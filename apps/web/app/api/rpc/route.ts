import { PostHandlers, PostRepoLive, PostRpcs } from "@app/post/server";
import { Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";

export const runtime = "nodejs";

const AppRpcs = PostRpcs;

const AppHandlers = PostHandlers;

const AppRepositories = PostRepoLive;

const ServerLayer = RpcServer.layerHttp({
	group: AppRpcs,
	path: "/api/rpc",
	protocol: "http",
}).pipe(
	Layer.provide(AppHandlers),
	Layer.provide(AppRepositories),
	Layer.provide(RpcSerialization.layerJson),
);

const { dispose, handler } = HttpRouter.toWebHandler(ServerLayer);

export const POST = (request: Request) => handler(request);

export const disposeRpcRoute = dispose;
