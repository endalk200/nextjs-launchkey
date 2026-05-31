import { describe, expect, it } from "vitest";
import { Effect, Layer } from "effect";
import { Headers } from "effect/unstable/http";
import { Rpc, RpcMessage } from "effect/unstable/rpc";
import { PostNotFound } from "../model/errors.ts";
import { Post } from "../model/post.ts";
import { PostRepository } from "./repo.ts";
import { PostHandlers, PostRpcs } from "./rpc.ts";
import { PostOperationsLive } from "./service.ts";

const calls: Array<ReadonlyArray<unknown>> = [];

const TestRepo = Layer.succeed(
	PostRepository,
	PostRepository.of({
		list: Effect.sync(() => {
			calls.push(["list"]);
			return [
				new Post({
					id: "post-1",
					title: "First post",
					content: "First body",
				}),
			];
		}),
		create: (title, content) =>
			Effect.sync(() => {
				calls.push(["create", title, content]);
				return new Post({
					id: "created",
					title,
					content,
				});
			}),
		delete: (id) =>
			Effect.sync(() => {
				calls.push(["delete", id]);
				return new Post({
					id,
					title: "Deleted post",
					content: "Deleted body",
				});
			}),
		update: (id, title, content) =>
			id === "missing"
				? new PostNotFound({ id })
				: Effect.sync(() => {
						calls.push(["update", id, title, content]);
						return new Post({
							id,
							title,
							content,
						});
					}),
	}),
);

const testRpcOptions = {
	client: new Rpc.ServerClient(0),
	headers: Headers.empty,
	requestId: RpcMessage.RequestId(1n),
};

type PostRpcHandler =
	| Rpc.Handler<"Post.List">
	| Rpc.Handler<"Post.Create">
	| Rpc.Handler<"Post.Delete">
	| Rpc.Handler<"Post.Update">;

function runHandler<A, E>(effect: Effect.Effect<A, E, PostRpcHandler>) {
	return Effect.runPromise(
		Effect.provide(
			effect,
			PostHandlers.pipe(
				Layer.provide(PostOperationsLive),
				Layer.provide(TestRepo),
			),
		),
	);
}

describe("PostHandlers", () => {
	it("maps RPC handlers to post service operations", async () => {
		calls.length = 0;

		const result = await runHandler(
			Effect.gen(function* () {
				const list = yield* PostRpcs.accessHandler("Post.List");
				const create = yield* PostRpcs.accessHandler("Post.Create");
				const update = yield* PostRpcs.accessHandler("Post.Update");
				const remove = yield* PostRpcs.accessHandler("Post.Delete");

				return {
					listed: yield* list(undefined, testRpcOptions),
					created: yield* create(
						{ title: "Created post", content: "Created body" },
						testRpcOptions,
					),
					updated: yield* update(
						{
							id: "post-1",
							title: "Updated post",
							content: "Updated body",
						},
						testRpcOptions,
					),
					deleted: yield* remove({ id: "post-1" }, testRpcOptions),
				};
			}),
		);

		expect(result.listed).toEqual([
			new Post({
				id: "post-1",
				title: "First post",
				content: "First body",
			}),
		]);
		expect(result.created).toEqual(
			new Post({
				id: "created",
				title: "Created post",
				content: "Created body",
			}),
		);
		expect(result.updated).toEqual(
			new Post({
				id: "post-1",
				title: "Updated post",
				content: "Updated body",
			}),
		);
		expect(result.deleted).toEqual(
			new Post({
				id: "post-1",
				title: "Deleted post",
				content: "Deleted body",
			}),
		);
		expect(calls).toEqual([
			["list"],
			["create", "Created post", "Created body"],
			["update", "post-1", "Updated post", "Updated body"],
			["delete", "post-1"],
		]);
	});

	it("exposes declared RPC errors from service operations", async () => {
		await expect(
			runHandler(
				Effect.gen(function* () {
					const update = yield* PostRpcs.accessHandler("Post.Update");

					return yield* update(
						{
							id: "missing",
							title: "Updated post",
							content: "Updated body",
						},
						testRpcOptions,
					);
				}),
			),
		).rejects.toBeInstanceOf(PostNotFound);
	});
});
