import {
	PostHandlers,
	PostOperationsLive,
	PostRepoLive,
	PostRpcs,
} from "@app/post/server";
import { context, isSpanContextValid, trace } from "@opentelemetry/api";
import { Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { OtelLive } from "../../../observability/otel.node.ts";

export const runtime = "nodejs";

const AppRpcs = PostRpcs;

const AppHandlers = PostHandlers;

const AppOperations = PostOperationsLive;

const AppRepositories = PostRepoLive;

const ServerLayer = RpcServer.layerHttp({
	group: AppRpcs,
	path: "/api/rpc",
	protocol: "http",
}).pipe(
	Layer.provide(AppHandlers),
	Layer.provide(AppOperations),
	Layer.provide(AppRepositories),
	Layer.provide(RpcSerialization.layerJson),
	Layer.provideMerge(OtelLive),
);

const { dispose, handler } = HttpRouter.toWebHandler(ServerLayer);

const propagationHeaders = [
	"b3",
	"traceparent",
	"tracestate",
	"x-b3-flags",
	"x-b3-parentspanid",
	"x-b3-sampled",
	"x-b3-spanid",
	"x-b3-traceid",
];

function requestForActiveServerTrace(request: Request) {
	const activeSpanContext = trace.getSpan(context.active())?.spanContext();

	if (
		activeSpanContext === undefined ||
		!isSpanContextValid(activeSpanContext)
	) {
		return request;
	}

	const headers = new Headers(request.headers);

	for (const header of propagationHeaders) {
		headers.delete(header);
	}

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

export const POST = (request: Request) =>
	handler(requestForActiveServerTrace(request));

export const disposeRpcRoute = dispose;
