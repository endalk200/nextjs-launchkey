import { type DatabaseError, isRetryableDatabaseError } from "@app/database";
import { Context, Effect, Layer } from "effect";
import type { Post } from "../model/post.ts";
import {
	PostNotFoundError,
	PostOperationFailedError,
} from "../model/errors.ts";
import { PostRepository } from "./post.repository.ts";

type CreatePostInput = {
	readonly userId: string;
	readonly title: string;
	readonly content: string;
};

type UpdatePostInput = {
	readonly userId: string;
	readonly id: string;
	readonly title: string;
	readonly content: string;
};

type DeletePostInput = {
	readonly userId: string;
	readonly id: string;
};

function operationFailed(
	error: DatabaseError,
	operation: string,
	message: string,
) {
	return new PostOperationFailedError({
		operation,
		message,
		retryable: isRetryableDatabaseError(error),
	});
}

class PostService extends Context.Service<
	PostService,
	{
		readonly list: (
			userId: string,
		) => Effect.Effect<ReadonlyArray<Post>, PostOperationFailedError>;
		readonly create: (
			input: CreatePostInput,
		) => Effect.Effect<Post, PostOperationFailedError>;
		readonly delete: (
			input: DeletePostInput,
		) => Effect.Effect<Post, PostNotFoundError | PostOperationFailedError>;
		readonly update: (
			input: UpdatePostInput,
		) => Effect.Effect<Post, PostNotFoundError | PostOperationFailedError>;
	}
>()("app/PostOperations") {}

const PostOperationsLive = Layer.effect(
	PostService,
	Effect.gen(function* () {
		const repo = yield* PostRepository;

		return PostService.of({
			list: (userId) =>
				Effect.fn("PostService.List")(function* () {
					const posts = yield* repo
						.list(userId)
						.pipe(
							Effect.mapError((error) =>
								operationFailed(
									error,
									"Post.List",
									"Something went wrong while fetching posts",
								),
							),
						);

					yield* Effect.annotateCurrentSpan({ count: posts.length, userId });

					yield* Effect.logInfo("Listed posts").pipe(
						Effect.annotateLogs({ count: posts.length, userId }),
					);

					return posts;
				})(),

			create: ({ userId, title, content }) =>
				Effect.fn("PostService.Create")(function* () {
					const post = yield* repo
						.create(userId, title, content)
						.pipe(
							Effect.mapError((error) =>
								operationFailed(
									error,
									"Post.Create",
									"Something went wrong while creating a post",
								),
							),
						);

					yield* Effect.annotateCurrentSpan({ id: post.id, userId });

					yield* Effect.logInfo("Created post").pipe(
						Effect.annotateLogs({ id: post.id, userId }),
					);

					return post;
				})(),

			delete: ({ userId, id }) =>
				Effect.fn("PostService.Delete")(function* () {
					const post = yield* repo
						.delete(userId, id)
						.pipe(
							Effect.mapError((error) =>
								error._tag === "PostNotFound"
									? error
									: operationFailed(
											error,
											"Post.Delete",
											"Something went wrong while deleting a post",
										),
							),
						);

					yield* Effect.annotateCurrentSpan({ id: post.id, userId });

					yield* Effect.logInfo("Deleted post").pipe(
						Effect.annotateLogs({ id: post.id, userId }),
					);

					return post;
				})(),

			update: ({ userId, id, title, content }) =>
				Effect.fn("PostService.Update")(function* () {
					const post = yield* repo
						.update(userId, id, title, content)
						.pipe(
							Effect.mapError((error) =>
								error._tag === "PostNotFound"
									? error
									: operationFailed(
											error,
											"Post.Update",
											"Something went wrong while updating a post",
										),
							),
						);

					yield* Effect.annotateCurrentSpan({ id: post.id, userId });

					yield* Effect.logInfo("Updated post").pipe(
						Effect.annotateLogs({ id: post.id, userId }),
					);

					return post;
				})(),
		});
	}),
);

export { PostService, PostOperationsLive };
