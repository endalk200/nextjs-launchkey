import { type DatabaseError, isRetryableDatabaseError } from "@app/database";
import { Context, Effect, Layer } from "effect";
import {
	PostNotFoundError,
	PostOperationFailedError,
} from "../model/errors.ts";
import type { Post } from "../model/post.ts";
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
>()("app/PostService") {}

/** Maps a repository failure to the domain-level operation error. */
const operationFailed =
	(operation: string, message: string) => (error: DatabaseError) =>
		new PostOperationFailedError({
			operation,
			message,
			retryable: isRetryableDatabaseError(error),
		});

/** Passes not-found errors through untouched while mapping database failures. */
const keepNotFound =
	(map: (error: DatabaseError) => PostOperationFailedError) =>
	(error: DatabaseError | PostNotFoundError) =>
		error._tag === "PostNotFound" ? error : map(error);

/**
 * Wraps an operation in a named span and annotates span and log on success,
 * keeping the individual service methods free of tracing boilerplate.
 */
const traced =
	<A, E>(
		operation: string,
		successMessage: string,
		annotate: (value: A) => Record<string, string | number>,
	) =>
	(effect: Effect.Effect<A, E>): Effect.Effect<A, E> =>
		Effect.fn(`PostService.${operation}`)(function* () {
			const value = yield* effect;
			const annotations = annotate(value);

			yield* Effect.annotateCurrentSpan(annotations);
			yield* Effect.logInfo(successMessage).pipe(
				Effect.annotateLogs(annotations),
			);

			return value;
		})();

const PostServiceLive = Layer.effect(
	PostService,
	Effect.gen(function* () {
		const repo = yield* PostRepository;

		return PostService.of({
			list: (userId) =>
				repo.list(userId).pipe(
					Effect.mapError(
						operationFailed(
							"Post.List",
							"Something went wrong while fetching posts",
						),
					),
					traced("List", "Listed posts", (posts) => ({
						count: posts.length,
						userId,
					})),
				),

			create: ({ userId, title, content }) =>
				repo.create(userId, title, content).pipe(
					Effect.mapError(
						operationFailed(
							"Post.Create",
							"Something went wrong while creating a post",
						),
					),
					traced("Create", "Created post", (post) => ({
						id: post.id,
						userId,
					})),
				),

			delete: ({ userId, id }) =>
				repo.delete(userId, id).pipe(
					Effect.mapError(
						keepNotFound(
							operationFailed(
								"Post.Delete",
								"Something went wrong while deleting a post",
							),
						),
					),
					traced("Delete", "Deleted post", (post) => ({
						id: post.id,
						userId,
					})),
				),

			update: ({ userId, id, title, content }) =>
				repo.update(userId, id, title, content).pipe(
					Effect.mapError(
						keepNotFound(
							operationFailed(
								"Post.Update",
								"Something went wrong while updating a post",
							),
						),
					),
					traced("Update", "Updated post", (post) => ({
						id: post.id,
						userId,
					})),
				),
		});
	}),
);

export { PostService, PostServiceLive };
