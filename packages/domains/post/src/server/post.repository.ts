import { Database, DatabaseError } from "@app/database";
import { Context, Effect, Layer } from "effect";
import { Post } from "../model/post.ts";
import {
	PostNotFoundError,
	PostOperationFailedError,
} from "../model/errors.ts";

export class PostRepository extends Context.Service<
	PostRepository,
	{
		readonly list: Effect.Effect<ReadonlyArray<Post>, PostOperationFailedError>;
		readonly create: (
			title: string,
			content: string,
		) => Effect.Effect<Post, PostOperationFailedError>;
		readonly delete: (
			id: string,
		) => Effect.Effect<Post, PostOperationFailedError | PostNotFoundError>;
		readonly update: (
			id: string,
			title: string,
			content: string,
		) => Effect.Effect<Post, PostOperationFailedError | PostNotFoundError>;
	}
>()("app/PostRepo") {}

export const PostRepositoryLive = Layer.effect(
	PostRepository,
	Effect.gen(function* () {
		const database = yield* Database;

		return PostRepository.of({
			list: Effect.fn("PostRepository.List")(function* () {
				const records = yield* database
					.query({ operation: "Post.List", model: "Post" }, (client) =>
						client.post.findMany({ orderBy: { createdAt: "asc" } }),
					)
					.pipe(
						Effect.catchIf(DatabaseError.isDatabaseError, (error) =>
							Effect.fail(
								new PostOperationFailedError({
									operation: "Post.List",
									message: "Post persistence operation failed",
									retryable: DatabaseError.isRetryable(error),
								}),
							),
						),
					);

				const posts = records.map(
					(record) =>
						new Post({
							id: record.id,
							title: record.title,
							content: record.content,
						}),
				);

				yield* Effect.logInfo("Listed posts from repository").pipe(
					Effect.annotateLogs({ count: posts.length }),
				);

				return posts;
			})(),

			create: (title, content) =>
				Effect.fn("PostRepository.Create")(function* () {
					const record = yield* database
						.mutation({ operation: "Post.Create", model: "Post" }, (client) =>
							client.post.create({ data: { title, content } }),
						)
						.pipe(
							Effect.catchIf(DatabaseError.isDatabaseError, (error) =>
								Effect.fail(
									new PostOperationFailedError({
										operation: "Post.Create",
										message: "Post persistence operation failed",
										retryable: DatabaseError.isRetryable(error),
									}),
								),
							),
						);
					const post = new Post({
						id: record.id,
						title: record.title,
						content: record.content,
					});

					yield* Effect.logInfo("Created post in repository").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				})(),

			delete: (id) =>
				Effect.fn("PostRepository.Delete")(function* () {
					const record = yield* database
						.mutation({ operation: "Post.Delete", model: "Post" }, (client) =>
							client.post.delete({ where: { id } }),
						)
						.pipe(
							Effect.catchIf(
								DatabaseError.isDatabaseError,
								(
									error,
								): Effect.Effect<
									never,
									PostOperationFailedError | PostNotFoundError
								> => {
									if (error._tag === "RecordRequiredButMissing") {
										return Effect.fail(
											new PostNotFoundError({
												id,
												message: "Post not found",
											}),
										);
									}

									return Effect.fail(
										new PostOperationFailedError({
											operation: "Post.Delete",
											message: "Post persistence operation failed",
											retryable: DatabaseError.isRetryable(error),
										}),
									);
								},
							),
						);
					const post = new Post({
						id: record.id,
						title: record.title,
						content: record.content,
					});

					yield* Effect.logInfo("Deleted post in repository").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				})(),

			update: (id, title, content) =>
				Effect.fn("PostRepository.Update")(function* () {
					const record = yield* database
						.mutation({ operation: "Post.Update", model: "Post" }, (client) =>
							client.post.update({
								where: { id },
								data: { title, content },
							}),
						)
						.pipe(
							Effect.catchIf(
								DatabaseError.isDatabaseError,
								(
									error,
								): Effect.Effect<
									never,
									PostOperationFailedError | PostNotFoundError
								> => {
									if (error._tag === "RecordRequiredButMissing") {
										return Effect.fail(
											new PostNotFoundError({
												id,
												message: "Post not found",
											}),
										);
									}

									return Effect.fail(
										new PostOperationFailedError({
											operation: "Post.Update",
											message: "Post persistence operation failed",
											retryable: DatabaseError.isRetryable(error),
										}),
									);
								},
							),
						);
					const post = new Post({
						id: record.id,
						title: record.title,
						content: record.content,
					});

					yield* Effect.logInfo("Updated post in repository").pipe(
						Effect.annotateLogs({ id: post.id }),
					);

					return post;
				})(),
		});
	}),
);

export const PostRepoPrismaLive = PostRepositoryLive;
