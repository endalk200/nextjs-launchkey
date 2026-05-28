"use client";

import { Effect, Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { PostRpcs } from "../server/rpc.ts";

const ClientLayer = RpcClient.layerProtocolHttp({ url: "/api/rpc" }).pipe(
	Layer.provide(RpcSerialization.layerJson),
	Layer.provide(FetchHttpClient.layer),
);

function makeRuntime() {
	return ManagedRuntime.make(ClientLayer);
}

const makeTodoClient = RpcClient.make(PostRpcs);

const runtime = makeRuntime();

export const postRpc = {
	list: () =>
		runtime.runPromise(
			Effect.scoped(
				Effect.flatMap(makeTodoClient, (client) => client["Post.List"]()),
			),
		),

	create: (title: string, content: string) =>
		runtime.runPromise(
			Effect.scoped(
				Effect.flatMap(makeTodoClient, (client) =>
					client["Post.Create"]({ title: title, content: content }),
				),
			),
		),

	update: (id: string, title: string, content: string) =>
		runtime.runPromise(
			Effect.scoped(
				Effect.flatMap(makeTodoClient, (client) =>
					client["Post.Update"]({ id: id, title: title, content: content }),
				),
			),
		),

	delete: (id: string) =>
		runtime.runPromise(
			Effect.scoped(
				Effect.flatMap(makeTodoClient, (client) =>
					client["Post.Delete"]({ id: id }),
				),
			),
		),
};

export function disposePostRpc() {
	return runtime.dispose();
}
