// @vitest-environment node

import {
	makeTestAuthMiddlewareLayer,
	RejectingAuthMiddlewareTest,
} from "@app/auth/server/middleware";
import { UnauthorizedError } from "@app/auth/api";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { HttpServer } from "effect/unstable/http";
import { HttpApiTest } from "effect/unstable/httpapi";
import { PostApi } from "../api.ts";
import { PostNotFoundError } from "../model/errors.ts";
import { Post } from "../model/post.ts";
import { PostHandlers } from "./post.api.handler.ts";
import { PostService } from "./post.service.ts";

const existingPost = new Post({
	id: "00000000-0000-0000-0000-000000000001",
	title: "First post",
	content: "First body",
});
const testUser = {
	id: "user-1",
	email: "user-1@example.com",
	name: "User One",
};

function postServiceLayer(overrides: Partial<PostService["Service"]> = {}) {
	return Layer.succeed(
		PostService,
		PostService.of({
			list: () => Effect.succeed([existingPost]),
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
			delete: ({ id }) =>
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

function runApi<A, E, R>(
	effect: Effect.Effect<A, E, R>,
	serviceLayer = postServiceLayer(),
	authLayer = makeTestAuthMiddlewareLayer(testUser),
) {
	return Effect.scoped(effect).pipe(
		Effect.provide(
			PostHandlers.pipe(Layer.provide(serviceLayer), Layer.provide(authLayer)),
		),
		Effect.provide(authLayer),
		Effect.provide(HttpServer.layerServices),
	);
}

describe("PostHandlers", () => {
	it.effect("returns posts from GET /api/posts", () =>
		Effect.gen(function* () {
			const client = yield* HttpApiTest.groups(PostApi, ["posts"]);

			const result = yield* client.posts.listPosts({});

			assert.deepStrictEqual(result, [existingPost]);
		}).pipe(runApi),
	);

	it.effect("passes POST /api/posts payload to the service", () =>
		Effect.gen(function* () {
			const client = yield* HttpApiTest.groups(PostApi, ["posts"]);

			const [result, response] = yield* client.posts.createPost({
				payload: {
					title: "Created post",
					content: "Created body",
				},
				responseMode: "decoded-and-response",
			});

			assert.strictEqual(response.status, 201);
			assert.deepStrictEqual(
				result,
				new Post({
					id: "00000000-0000-0000-0000-000000000002",
					title: "Created post",
					content: "Created body",
				}),
			);
		}).pipe(runApi),
	);

	it.effect("passes PATCH /api/posts/:id inputs to the service", () =>
		Effect.gen(function* () {
			const client = yield* HttpApiTest.groups(PostApi, ["posts"]);

			const result = yield* client.posts.updatePost({
				params: {
					id: "00000000-0000-4000-8000-000000000003",
				},
				payload: {
					title: "Updated post",
					content: "Updated body",
				},
			});

			assert.deepStrictEqual(
				result,
				new Post({
					id: "00000000-0000-4000-8000-000000000003",
					title: "Updated post",
					content: "Updated body",
				}),
			);
		}).pipe(runApi),
	);

	it.effect("passes DELETE /api/posts/:id params to the service", () =>
		Effect.gen(function* () {
			const client = yield* HttpApiTest.groups(PostApi, ["posts"]);

			const result = yield* client.posts.deletePost({
				params: {
					id: "00000000-0000-4000-8000-000000000004",
				},
			});

			assert.deepStrictEqual(
				result,
				new Post({
					id: "00000000-0000-4000-8000-000000000004",
					title: "Deleted post",
					content: "Deleted body",
				}),
			);
		}).pipe(runApi),
	);

	it.effect("encodes and decodes declared service errors", () => {
		const missing = new PostNotFoundError({
			id: "00000000-0000-4000-8000-000000000009",
			message: "Post not found",
		});

		return Effect.gen(function* () {
			const client = yield* HttpApiTest.groups(PostApi, ["posts"]);

			const error = yield* client.posts
				.updatePost({
					params: {
						id: "00000000-0000-4000-8000-000000000009",
					},
					payload: {
						title: "Updated post",
						content: "Updated body",
					},
				})
				.pipe(Effect.flip);

			assert.deepStrictEqual(error, missing);
		}).pipe((effect) =>
			runApi(
				effect,
				postServiceLayer({
					update: () => Effect.fail(missing),
				}),
			),
		);
	});

	it.effect("returns the declared unauthorized error", () =>
		Effect.gen(function* () {
			const client = yield* HttpApiTest.groups(PostApi, ["posts"]);

			const error = yield* client.posts.listPosts({}).pipe(Effect.flip);

			assert.instanceOf(error, UnauthorizedError);
			assert.strictEqual(error.message, "Authentication is required.");
		}).pipe((effect) =>
			runApi(effect, postServiceLayer(), RejectingAuthMiddlewareTest),
		),
	);
});
