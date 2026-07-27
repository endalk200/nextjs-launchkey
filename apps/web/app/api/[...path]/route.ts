import { AuthMiddlewareLive } from "@app/auth/server";
import { DatabaseLive } from "@app/database";
import {
	PostApi,
	PostHandlers,
	PostOperationsLive,
	PostRepositoryDrizzle,
} from "@app/post/server";
import { context, isSpanContextValid, trace } from "@opentelemetry/api";
import { Layer } from "effect";
import { HttpMiddleware, HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { OtelLive } from "../../../observability/otel.node.ts";

export const runtime = "nodejs";

const ServerLayer = HttpApiBuilder.layer(PostApi, {
	openapiPath: "/api/openapi.json",
}).pipe(
	Layer.provide(PostHandlers),
	Layer.provide(PostOperationsLive),
	Layer.provide(PostRepositoryDrizzle),
	Layer.provide(AuthMiddlewareLive),
	Layer.provide(DatabaseLive),
	Layer.provide(HttpServer.layerServices),
	Layer.provideMerge(OtelLive),
);

const webHandler = HttpRouter.toWebHandler(ServerLayer, {
	middleware: (effect) => HttpMiddleware.tracer(effect),
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
