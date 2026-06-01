import { Context, Effect, Layer } from "effect";
import type { Post } from "../model/post.ts";
import {
	PostNotFoundError,
	PostOperationFailedError,
} from "../model/errors.ts";
import { PostRepository } from "./post.repository.ts";

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
		readonly list: Effect.Effect<ReadonlyArray<Post>, PostOperationFailedError>;
		readonly create: (
			input: CreatePostInput,
		) => Effect.Effect<Post, PostOperationFailedError>;
		readonly delete: (
			id: string,
		) => Effect.Effect<Post, PostNotFoundError | PostOperationFailedError>;
		readonly update: (
			input: UpdatePostInput,
		) => Effect.Effect<Post, PostNotFoundError | PostOperationFailedError>;
	}
>()("app/PostOperations") {}

export const PostOperationsLive = Layer.effect(
	PostService,
	Effect.gen(function* () {
		const repo = yield* PostRepository;

		return {
			list: Effect.fn("PostService.List")(function* () {
				const posts = yield* repo.list;

				yield* Effect.annotateCurrentSpan({ count: posts.length });

				yield* Effect.logInfo("Listed posts").pipe(
					Effect.annotateLogs({ count: posts.length }),
				);

				return posts;
			})(),

			create: ({ title, content }) =>
				Effect.fn("PostService.Create")(function* () {
					const post = yield* repo.create(title, content);

					yield* Effect.annotateCurrentSpan({ id: post.id });

					yield* Effect.logInfo("Created post").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				})(),

			delete: (id) =>
				Effect.fn("PostService.Delete")(function* () {
					const post = yield* repo.delete(id);

					yield* Effect.annotateCurrentSpan({ id: post.id });

					yield* Effect.logInfo("Deleted post").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				})(),

			update: ({ id, title, content }) =>
				Effect.fn("PostService.Update")(function* () {
					const post = yield* repo.update(id, title, content);

					yield* Effect.annotateCurrentSpan({ id: post.id });

					yield* Effect.logInfo("Updated post").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				})(),
		};
	}),
);
