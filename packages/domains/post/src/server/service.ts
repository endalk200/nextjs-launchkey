import { Context, Effect, Layer } from "effect";
import { PostNotFound } from "../model/errors.ts";
import type { Post } from "../model/post.ts";
import { PostRepository } from "./repo.ts";

type CreatePostInput = {
	readonly title: string;
	readonly content: string;
};

type UpdatePostInput = {
	readonly id: string;
	readonly title: string;
	readonly content: string;
};

export class PostService extends Context.Service<
	PostService,
	{
		readonly list: Effect.Effect<ReadonlyArray<Post>>;
		readonly create: (input: CreatePostInput) => Effect.Effect<Post>;
		readonly delete: (id: string) => Effect.Effect<Post, PostNotFound>;
		readonly update: (
			input: UpdatePostInput,
		) => Effect.Effect<Post, PostNotFound>;
	}
>()("app/PostOperations") {}

export const PostOperationsLive = Layer.effect(
	PostService,
	Effect.gen(function* () {
		const repo = yield* PostRepository;

		return {
			list: Effect.gen(function* () {
				const posts = yield* repo.list;

				yield* Effect.annotateCurrentSpan({ count: posts.length });

				yield* Effect.logInfo("Listed posts").pipe(
					Effect.annotateLogs({ count: posts.length }),
				);

				return posts;
			}).pipe(Effect.withSpan("Post.List")),

			create: ({ title, content }) =>
				Effect.gen(function* () {
					const post = yield* repo.create(title, content);

					yield* Effect.annotateCurrentSpan({ id: post.id });

					yield* Effect.logInfo("Created post").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				}).pipe(Effect.withSpan("Post.Create")),

			delete: (id) =>
				Effect.gen(function* () {
					const post = yield* repo.delete(id);

					yield* Effect.annotateCurrentSpan({ id: post.id });

					yield* Effect.logInfo("Deleted post").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				}).pipe(Effect.withSpan("Post.Delete")),

			update: ({ id, title, content }) =>
				Effect.gen(function* () {
					const post = yield* repo.update(id, title, content);

					yield* Effect.annotateCurrentSpan({ id: post.id });

					yield* Effect.logInfo("Updated post").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				}).pipe(Effect.withSpan("Post.Update")),
		};
	}),
);
