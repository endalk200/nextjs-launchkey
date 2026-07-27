import { and, asc, Database, type DatabaseError, eq } from "@app/database";
import { posts } from "@app/database/schema";
import { Context, Effect, Layer } from "effect";
import { PostNotFoundError } from "../model/errors.ts";
import { Post } from "../model/post.ts";

class PostRepository extends Context.Service<
	PostRepository,
	{
		readonly list: (
			userId: string,
		) => Effect.Effect<ReadonlyArray<Post>, DatabaseError>;
		readonly create: (
			userId: string,
			title: string,
			content: string,
		) => Effect.Effect<Post, DatabaseError>;
		readonly delete: (
			userId: string,
			id: string,
		) => Effect.Effect<Post, DatabaseError | PostNotFoundError>;
		readonly update: (
			userId: string,
			id: string,
			title: string,
			content: string,
		) => Effect.Effect<Post, DatabaseError | PostNotFoundError>;
	}
>()("app/PostRepository") {}

const selection = {
	id: posts.id,
	title: posts.title,
	content: posts.content,
};

function toPost(record: {
	readonly id: string;
	readonly title: string;
	readonly content: string;
}) {
	return new Post(record);
}

function postNotFound(id: string) {
	return new PostNotFoundError({ id, message: "Post not found" });
}

const PostRepositoryDrizzle = Layer.effect(
	PostRepository,
	Effect.gen(function* () {
		const database = yield* Database;

		return PostRepository.of({
			list: (userId) =>
				Effect.fn("PostRepository.List")(function* () {
					const records = yield* database
						.select(selection)
						.from(posts)
						.where(eq(posts.userId, userId))
						.orderBy(asc(posts.createdAt), asc(posts.id));

					return records.map(toPost);
				})(),

			create: (userId, title, content) =>
				Effect.fn("PostRepository.Create")(function* () {
					const records = yield* database
						.insert(posts)
						.values({ userId, title, content })
						.returning(selection);
					const record = records[0];

					if (record === undefined) {
						return yield* Effect.die(
							new Error("Post insert returned no record"),
						);
					}

					return toPost(record);
				})(),

			delete: (userId, id) =>
				Effect.fn("PostRepository.Delete")(function* () {
					const records = yield* database
						.delete(posts)
						.where(and(eq(posts.id, id), eq(posts.userId, userId)))
						.returning(selection);
					const record = records[0];

					if (record === undefined) {
						return yield* postNotFound(id);
					}

					return toPost(record);
				})(),

			update: (userId, id, title, content) =>
				Effect.fn("PostRepository.Update")(function* () {
					const records = yield* database
						.update(posts)
						.set({ title, content })
						.where(and(eq(posts.id, id), eq(posts.userId, userId)))
						.returning(selection);
					const record = records[0];

					if (record === undefined) {
						return yield* postNotFound(id);
					}

					return toPost(record);
				})(),
		});
	}),
);

export { PostRepository, PostRepositoryDrizzle };
