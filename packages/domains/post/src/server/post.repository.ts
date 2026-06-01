import { Context, Effect } from "effect";
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

export const PostRepositoryLive = Effect.fn("PostRepositoryLive")(function* () {
	return PostRepository.of({
		list: Effect.fn("PostRepository.List")(function* () {
			return [];
		}),

		create: Effect.fn("PostRepository.Create")(function* (title, content) {
			return new Post({ id: "1", title, content });
		}),

		delete: Effect.fn("PostRepository.Delete")(function* (id) {
			return new Post({ id, title: "Deleted post", content: "Deleted body" });
		}),

		update: Effect.fn("PostRepository.Update")(function* (id, title, content) {
			return new Post({ id, title, content });
		}),
	});
});
