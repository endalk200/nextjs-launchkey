import {
	ConnectionUnavailable,
	RecordRequiredButMissing,
	UnexpectedDatabaseError,
} from "@app/database";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import {
	PostNotFoundError,
	PostOperationFailedError,
} from "../model/errors.ts";
import { Post } from "../model/post.ts";
import { PostRepository } from "./post.repository.ts";
import { PostOperationsLive, PostService } from "./post.service.ts";

const post = new Post({
	id: "00000000-0000-0000-0000-000000000001",
	title: "First post",
	content: "First body",
});

function postRepositoryLayer(
	overrides: Partial<PostRepository["Service"]> = {},
) {
	return Layer.succeed(
		PostRepository,
		PostRepository.of({
			list: Effect.succeed([post]),
			create: (title, content) =>
				Effect.succeed(
					new Post({
						id: "00000000-0000-0000-0000-000000000002",
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
			update: (id, title, content) =>
				Effect.succeed(
					new Post({
						id,
						title,
						content,
					}),
				),
			...overrides,
		}),
	);
}

function runPostService<A, E>(
	effect: Effect.Effect<A, E, PostService>,
	repositoryLayer = postRepositoryLayer(),
) {
	return effect.pipe(
		Effect.provide(PostOperationsLive.pipe(Layer.provide(repositoryLayer))),
	);
}

describe("PostOperationsLive", () => {
	it.effect("returns successful repository values", () =>
		Effect.gen(function* () {
			const service = yield* PostService;

			const result = yield* service.create({
				title: "Created post",
				content: "Created body",
			});

			assert.deepStrictEqual(
				result,
				new Post({
					id: "00000000-0000-0000-0000-000000000002",
					title: "Created post",
					content: "Created body",
				}),
			);
		}).pipe(runPostService),
	);

	it.effect("wraps retryable database failures as PostOperationFailed", () =>
		Effect.gen(function* () {
			const service = yield* PostService;

			const error = yield* service.list.pipe(Effect.flip);

			assert.instanceOf(error, PostOperationFailedError);
			assert.include(error, {
				operation: "Post.List",
				message: "Something went wrong while fetching posts",
				retryable: true,
			});
		}).pipe((effect) =>
			runPostService(
				effect,
				postRepositoryLayer({
					list: Effect.fail(
						new ConnectionUnavailable({
							operation: "Post.List",
							model: "Post",
							cause: new Error("database unavailable"),
						}),
					),
				}),
			),
		),
	);

	it.effect(
		"wraps non-retryable database failures as PostOperationFailed",
		() =>
			Effect.gen(function* () {
				const service = yield* PostService;

				const error = yield* service
					.create({
						title: "Created post",
						content: "Created body",
					})
					.pipe(Effect.flip);

				assert.instanceOf(error, PostOperationFailedError);
				assert.include(error, {
					operation: "Post.Create",
					message: "Something went wrong while creating a post",
					retryable: false,
				});
			}).pipe((effect) =>
				runPostService(
					effect,
					postRepositoryLayer({
						create: () =>
							Effect.fail(
								new UnexpectedDatabaseError({
									operation: "Post.Create",
									model: "Post",
									cause: new Error("database failed"),
								}),
							),
					}),
				),
			),
	);

	it.effect("does not translate leaked database misses into PostNotFound", () =>
		Effect.gen(function* () {
			const service = yield* PostService;

			const error = yield* service
				.update({
					id: "00000000-0000-0000-0000-000000000009",
					title: "Updated post",
					content: "Updated body",
				})
				.pipe(Effect.flip);

			assert.instanceOf(error, PostOperationFailedError);
			assert.include(error, {
				operation: "Post.Update",
				message: "Something went wrong while updating a post",
				retryable: false,
			});
		}).pipe((effect) =>
			runPostService(
				effect,
				postRepositoryLayer({
					update: () =>
						Effect.fail(
							new RecordRequiredButMissing({
								operation: "Post.Update",
								model: "Post",
								cause: new Error("missing record"),
							}),
						),
				}),
			),
		),
	);

	it.effect("preserves PostNotFound failures from the repository", () => {
		const missing = new PostNotFoundError({
			id: "00000000-0000-0000-0000-000000000009",
			message: "Post not found",
		});

		return Effect.gen(function* () {
			const service = yield* PostService;

			const error = yield* service
				.delete("00000000-0000-0000-0000-000000000009")
				.pipe(Effect.flip);

			assert.strictEqual(error, missing);
		}).pipe((effect) =>
			runPostService(
				effect,
				postRepositoryLayer({
					delete: () => Effect.fail(missing),
				}),
			),
		);
	});
});
