import { Database, DatabaseError } from "@app/database";
import { Context, Effect, Layer } from "effect";
import { Post } from "../model/post.ts";
import { PostNotFoundError } from "../model/errors.ts";

class PostRepository extends Context.Service<
	PostRepository,
	{
		readonly list: Effect.Effect<ReadonlyArray<Post>, DatabaseError>;
		readonly create: (
			title: string,
			content: string,
		) => Effect.Effect<Post, DatabaseError>;
		readonly delete: (
			id: string,
		) => Effect.Effect<Post, DatabaseError | PostNotFoundError>;
		readonly update: (
			id: string,
			title: string,
			content: string,
		) => Effect.Effect<Post, DatabaseError | PostNotFoundError>;
	}
>()("app/PostRepo") {}

const PostRepositoryPrisma = Layer.effect(
	PostRepository,
	Effect.gen(function* () {
		const database = yield* Database;

		return PostRepository.of({
			list: Effect.fn("PostRepository.List")(function* () {
				const records = yield* database.query(
					{ operation: "Post.List", model: "Post" },
					(client) => client.post.findMany({ orderBy: { createdAt: "asc" } }),
				);

				const posts = records.map(
					(record) =>
						new Post({
							id: record.id,
							title: record.title,
							content: record.content,
						}),
				);

				return posts;
			})(),

			create: (title, content) =>
				Effect.fn("PostRepository.Create")(function* () {
					const record = yield* database.mutation(
						{ operation: "Post.Create", model: "Post" },
						(client) => client.post.create({ data: { title, content } }),
					);

					const post = new Post({
						id: record.id,
						title: record.title,
						content: record.content,
					});

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
								(error) => error._tag === "RecordRequiredButMissing",
								() =>
									Effect.fail(
										new PostNotFoundError({
											id,
											message: "Post not found",
										}),
									),
							),
						);

					const post = new Post({
						id: record.id,
						title: record.title,
						content: record.content,
					});

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
								(error) => error._tag === "RecordRequiredButMissing",
								() =>
									Effect.fail(
										new PostNotFoundError({
											id,
											message: "Post not found",
										}),
									),
							),
						);

					const post = new Post({
						id: record.id,
						title: record.title,
						content: record.content,
					});

					return post;
				})(),
		});
	}),
);

export { PostRepository, PostRepositoryPrisma };
