import { AuthMiddlewareLive } from "@app/auth/server";
import { DatabaseLive } from "@app/database";
import {
	PostApi,
	PostHandlers,
	PostServiceLive,
	PostRepositoryDrizzle,
} from "@app/post/server";
import { context, isSpanContextValid, trace } from "@opentelemetry/api";
import { Cause, Effect, Layer, Option } from "effect";
import {
	Headers as HttpHeaders,
	HttpMiddleware,
	HttpRouter,
	HttpServer,
	HttpServerError,
	HttpServerRequest,
	HttpServerResponse,
} from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { OtelLive } from "../../../observability/otel.node.ts";
import { captureServerException } from "../../../observability/posthog.node.ts";
import { readPostHogRequestContext } from "../../../observability/request-context.ts";
import { PostApiDocumentation } from "./documentation.ts";

export const runtime = "nodejs";

const HttpHeaderRedactionLive = Layer.succeed(HttpHeaders.CurrentRedactedNames)(
	[
		"authorization",
		"cookie",
		"set-cookie",
		"x-api-key",
		"x-posthog-distinct-id",
		"x-posthog-session-id",
		"x-posthog-window-id",
		/token/i,
		/secret/i,
	],
);

const ServerLayer = Layer.mergeAll(
	HttpApiBuilder.layer(PostApi, {
		openapiPath: "/api/openapi.json",
	}).pipe(
		Layer.provide(PostHandlers),
		Layer.provide(PostServiceLive),
		Layer.provide(PostRepositoryDrizzle),
		Layer.provide(AuthMiddlewareLive),
		Layer.provide(DatabaseLive),
	),
	PostApiDocumentation,
	HttpHeaderRedactionLive,
).pipe(Layer.provide(HttpServer.layerServices), Layer.provideMerge(OtelLive));

const captureUnhandledErrors = HttpMiddleware.make((app) =>
	Effect.flatMap(HttpServerRequest.HttpServerRequest, (request) =>
		Effect.tapCause(app, (cause) => {
			const [response, stripped] = HttpServerError.causeResponseStripped(cause);

			if (response.status < 500 || Option.isNone(stripped)) {
				return Effect.void;
			}

			const realDefect = stripped.value.reasons
				.filter(Cause.isDieReason)
				.find(
					(reason) => !HttpServerResponse.isHttpServerResponse(reason.defect),
				);
			const hasUnhandledFailure = stripped.value.reasons.some(
				Cause.isFailReason,
			);

			if (realDefect === undefined && !hasUnhandledFailure) {
				return Effect.void;
			}

			const error = realDefect?.defect ?? Cause.squash(stripped.value);
			const correlation = readPostHogRequestContext(request.headers);
			const logAnnotations = {
				...(correlation.distinctId
					? { posthogDistinctId: correlation.distinctId }
					: {}),
				...(correlation.sessionId ? { sessionId: correlation.sessionId } : {}),
				httpMethod: request.method,
				httpPath: request.url.split(/[?#]/, 1)[0],
				httpStatusCode: response.status,
			};

			return Effect.all([
				Effect.logError("Unhandled Effect HTTP error", error).pipe(
					Effect.annotateLogs(logAnnotations),
				),
				Effect.promise(() =>
					captureServerException(error, {
						...correlation,
						method: request.method,
						path: request.url.split(/[?#]/, 1)[0],
						status: response.status,
					}),
				),
			]).pipe(Effect.exit, Effect.asVoid);
		}),
	),
);

const webHandler = HttpRouter.toWebHandler(ServerLayer, {
	middleware: captureUnhandledErrors,
});
const handler = webHandler.handler as (request: Request) => Promise<Response>;

const tracePropagationHeaders = [
	"b3",
	"traceparent",
	"tracestate",
	"x-b3-flags",
	"x-b3-parentspanid",
	"x-b3-sampled",
	"x-b3-spanid",
	"x-b3-traceid",
];

function requestWithActiveServerTrace(request: Request) {
	const activeSpanContext = trace.getSpan(context.active())?.spanContext();

	if (
		activeSpanContext === undefined ||
		!isSpanContextValid(activeSpanContext)
	) {
		return request;
	}

	const headers = new Headers(request.headers);

	for (const header of tracePropagationHeaders) {
		headers.delete(header);
	}

	// Effect's HTTP tracer reads incoming propagation headers to choose the
	// parent span. In a Next route handler, the parent span already lives in the
	// active OpenTelemetry context, so rewrite the request propagation headers to
	// point at that server span before passing the request into Effect.
	headers.set(
		"traceparent",
		`00-${activeSpanContext.traceId}-${activeSpanContext.spanId}-${activeSpanContext.traceFlags.toString(16).padStart(2, "0")}`,
	);

	const traceState = activeSpanContext.traceState?.serialize();

	if (traceState) {
		headers.set("tracestate", traceState);
	}

	return new Request(request, { headers });
}

const handleRequest = (request: Request) =>
	handler(requestWithActiveServerTrace(request));

export const DELETE = handleRequest;
export const GET = handleRequest;
export const PATCH = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
