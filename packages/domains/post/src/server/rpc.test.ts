import { Effect, Layer } from "effect";
import { RpcTest } from "effect/unstable/rpc";
import { describe, expect, it } from "vitest";
import { PostNotFoundError } from "../model/errors.ts";
import { Post } from "../model/post.ts";
import { PostService } from "./service.ts";
import { PostHandlers } from "./rpc.handler.ts";
import { PostRpcs } from "./rpc.defnition.ts";

const existingPost = new Post({
	id: "00000000-0000-0000-0000-000000000001",
	title: "First post",
	content: "First body",
});

function postServiceLayer(overrides: Partial<PostService["Service"]> = {}) {
	return Layer.succeed(
		PostService,
		PostService.of({
			list: Effect.succeed([existingPost]),
			create: ({ title, content }) =>
				Effect.succeed(
					new Post({
						id: "00000000-0000-0000-0000-000000000002",
						title,
						content,
					}),
				),
			update: ({ id, title, content }) =>
				Effect.succeed(
					new Post({
						id,
						title,
						content,
					}),
				),
			delete: (id) =>
				Effect.succeed(
					new Post({
						id,
						title: "Deleted post",
						content: "Deleted body",
					}),
				),
			...overrides,
		}),
	);
}

function runRpc<A, E, R>(
	effect: Effect.Effect<A, E, R>,
	layer = postServiceLayer(),
) {
	return Effect.runPromise(
		Effect.scoped(effect).pipe(
			Effect.provide(PostHandlers.pipe(Layer.provide(layer))),
		) as Effect.Effect<A, E>,
	);
}

describe("PostHandlers", () => {
	it("returns posts from Post.List", async () => {
		const result = await runRpc(
			Effect.gen(function* () {
				const client = yield* RpcTest.makeClient(PostRpcs);

				return yield* client["Post.List"]();
			}),
		);

		expect(result).toEqual([existingPost]);
	});

	it("passes Post.Create payload to the service", async () => {
		const result = await runRpc(
			Effect.gen(function* () {
				const client = yield* RpcTest.makeClient(PostRpcs);

				return yield* client["Post.Create"]({
					title: "Created post",
					content: "Created body",
				});
			}),
		);

		expect(result).toEqual(
			new Post({
				id: "00000000-0000-0000-0000-000000000002",
				title: "Created post",
				content: "Created body",
			}),
		);
	});

	it("propagates PostNotFound from Post.Update", async () => {
		const missing = new PostNotFoundError({
			id: "00000000-0000-4000-8000-000000000009",
			message: "Post not found",
		});

		await expect(
			runRpc(
				Effect.gen(function* () {
					const client = yield* RpcTest.makeClient(PostRpcs);

					return yield* client["Post.Update"]({
						id: "00000000-0000-4000-8000-000000000009",
						title: "Updated post",
						content: "Updated body",
					});
				}),
				postServiceLayer({
					update: () => Effect.fail(missing),
				}),
			),
		).rejects.toBe(missing);
	});

	it("propagates PostNotFound from Post.Delete", async () => {
		const missing = new PostNotFoundError({
			id: "00000000-0000-4000-8000-000000000009",
			message: "Post not found",
		});

		await expect(
			runRpc(
				Effect.gen(function* () {
					const client = yield* RpcTest.makeClient(PostRpcs);

					return yield* client["Post.Delete"]({
						id: "00000000-0000-4000-8000-000000000009",
					});
				}),
				postServiceLayer({
					delete: () => Effect.fail(missing),
				}),
			),
		).rejects.toBe(missing);
	});

	it("rejects empty Post.Create title before calling the service", async () => {
		await expect(
			runRpc(
				Effect.gen(function* () {
					const client = yield* RpcTest.makeClient(PostRpcs);

					return yield* client["Post.Create"]({
						title: "   ",
						content: "Created body",
					});
				}),
			),
		).rejects.toThrow("Title is required.");
	});

	it("rejects empty Post.Create content before calling the service", async () => {
		await expect(
			runRpc(
				Effect.gen(function* () {
					const client = yield* RpcTest.makeClient(PostRpcs);

					return yield* client["Post.Create"]({
						title: "Created post",
						content: "   ",
					});
				}),
			),
		).rejects.toThrow("Content is required.");
	});

	it("rejects invalid UUID payloads before calling the service", async () => {
		await expect(
			runRpc(
				Effect.gen(function* () {
					const client = yield* RpcTest.makeClient(PostRpcs);

					return yield* client["Post.Delete"]({
						id: "not-a-uuid",
					});
				}),
			),
		).rejects.toThrow("Expected a UUID");
	});
});
