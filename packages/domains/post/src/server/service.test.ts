import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { PostNotFoundError } from "../model/errors.ts";
import { Post } from "../model/post.ts";
import { PostRepository } from "./post.repository.ts";
import { PostOperationsLive, PostService } from "./service.ts";

const post = new Post({
	id: "00000000-0000-0000-0000-000000000001",
	title: "First post",
	content: "First body",
});

const FakePostRepositoryLive = Layer.succeed(
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
	}),
);

function runPostService<A, E>(
	effect: Effect.Effect<A, E, PostService>,
	repositoryLayer = FakePostRepositoryLive,
) {
	return Effect.runPromise(
		Effect.provide(
			effect,
			PostOperationsLive.pipe(Layer.provide(repositoryLayer)),
		),
	);
}

describe("PostOperationsLive", () => {
	it("lists posts through the repository", async () => {
		const result = await runPostService(
			Effect.gen(function* () {
				const service = yield* PostService;

				return yield* service.list;
			}),
		);

		expect(result).toEqual([post]);
	});

	it("creates posts through the repository", async () => {
		const result = await runPostService(
			Effect.gen(function* () {
				const service = yield* PostService;

				return yield* service.create({
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

	it("updates posts through the repository", async () => {
		const result = await runPostService(
			Effect.gen(function* () {
				const service = yield* PostService;

				return yield* service.update({
					id: "00000000-0000-0000-0000-000000000001",
					title: "Updated post",
					content: "Updated body",
				});
			}),
		);

		expect(result).toEqual(
			new Post({
				id: "00000000-0000-0000-0000-000000000001",
				title: "Updated post",
				content: "Updated body",
			}),
		);
	});

	it("deletes posts through the repository", async () => {
		const result = await runPostService(
			Effect.gen(function* () {
				const service = yield* PostService;

				return yield* service.delete("00000000-0000-0000-0000-000000000001");
			}),
		);

		expect(result).toEqual(
			new Post({
				id: "00000000-0000-0000-0000-000000000001",
				title: "Deleted post",
				content: "Deleted body",
			}),
		);
	});

	it("preserves PostNotFound failures from the repository", async () => {
		const missing = new PostNotFoundError({
			id: "00000000-0000-0000-0000-000000000009",
			message: "Post not found",
		});
		const failingRepositoryLayer = Layer.succeed(
			PostRepository,
			PostRepository.of({
				list: Effect.succeed([]),
				create: (title, content) =>
					Effect.succeed(
						new Post({
							id: "00000000-0000-0000-0000-000000000002",
							title,
							content,
						}),
					),
				delete: () => Effect.fail(missing),
				update: () => Effect.fail(missing),
			}),
		);

		await expect(
			runPostService(
				Effect.gen(function* () {
					const service = yield* PostService;

					return yield* service.update({
						id: "00000000-0000-0000-0000-000000000009",
						title: "Updated post",
						content: "Updated body",
					});
				}),
				failingRepositoryLayer,
			),
		).rejects.toBe(missing);
	});
});
