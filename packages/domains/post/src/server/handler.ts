import { Effect } from "effect";
import { PostRpcs } from "./rpc.ts";
import { PostRepo } from "./repo.ts";

export const PostHandlers = PostRpcs.toLayer(
	Effect.gen(function* () {
		const repo = yield* PostRepo;

		return PostRpcs.of({
			"Post.List": () =>
				Effect.gen(function* () {
					const list = yield* repo.list;

					yield* Effect.annotateCurrentSpan({ count: list.length });

					yield* Effect.logInfo("Listed posts").pipe(
						Effect.annotateLogs({ count: list.length }),
					);

					return list;
				}).pipe(Effect.withSpan("Post.List")),

			"Post.Create": ({ title, content }) =>
				Effect.gen(function* () {
					const post = yield* repo.create(title, content);

					yield* Effect.annotateCurrentSpan({ id: post.id });

					yield* Effect.logInfo("Created post").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				}).pipe(Effect.withSpan("Post.Create")),

			"Post.Delete": ({ id }) =>
				Effect.gen(function* () {
					const post = yield* repo.delete(id);

					yield* Effect.annotateCurrentSpan({ id: post.id });

					yield* Effect.logInfo("Deleted post").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				}).pipe(Effect.withSpan("Post.Delete")),

			"Post.Update": ({ id, title, content }) =>
				Effect.gen(function* () {
					const post = yield* repo.update(id, title, content);

					yield* Effect.annotateCurrentSpan({ id: post.id });

					yield* Effect.logInfo("Listed posts").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				}).pipe(Effect.withSpan("Post.Update")),
		});
	}),
);
