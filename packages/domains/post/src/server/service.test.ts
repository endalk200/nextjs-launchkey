import { describe, expect, it } from "vitest";
import { Effect, Layer } from "effect";
import { PostNotFound } from "../model/errors.ts";
import { Post } from "../model/post.ts";
import { PostService, PostOperationsLive } from "./service.ts";
import { PostRepoLive } from "./repo.ts";

function runPostOperation<A, E>(effect: Effect.Effect<A, E, PostService>) {
	return Effect.runPromise(
		Effect.provide(
			effect,
			PostOperationsLive.pipe(Layer.provide(PostRepoLive)),
		),
	);
}

describe("PostOperations", () => {
	it("creates and lists posts through the operation interface", async () => {
		const program = Effect.gen(function* () {
			const posts = yield* PostService;

			const created = yield* posts.create({
				title: "First post",
				content: "First post body",
			});
			const list = yield* posts.list;

			return { created, list };
		});

		const result = await runPostOperation(program);

		expect(result.created).toEqual(
			new Post({
				id: "1",
				title: "First post",
				content: "First post body",
			}),
		);
		expect(result.list).toEqual([result.created]);
	});

	it("updates and deletes posts through the operation interface", async () => {
		const program = Effect.gen(function* () {
			const posts = yield* PostService;

			const created = yield* posts.create({
				title: "First post",
				content: "First post body",
			});
			const updated = yield* posts.update({
				id: created.id,
				title: "Updated post",
				content: "Updated body",
			});
			const deleted = yield* posts.delete(created.id);
			const list = yield* posts.list;

			return { deleted, list, updated };
		});

		const result = await runPostOperation(program);

		expect(result.updated).toEqual(
			new Post({
				id: "1",
				title: "Updated post",
				content: "Updated body",
			}),
		);
		expect(result.deleted).toEqual(result.updated);
		expect(result.list).toEqual([]);
	});

	it("preserves PostNotFound errors from the repo adapter", async () => {
		const program = Effect.gen(function* () {
			const posts = yield* PostService;

			return yield* posts.delete("missing");
		});

		await expect(runPostOperation(program)).rejects.toBeInstanceOf(
			PostNotFound,
		);
	});
});
