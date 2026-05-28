import { Context, Effect } from "effect";
import { PostNotFound } from "../model/errors.ts";
import { Post } from "../model/post.ts";

export class PostRepo extends Context.Service<
	PostRepo,
	{
		readonly list: Effect.Effect<ReadonlyArray<Post>>;
		readonly create: (title: string, content: string) => Effect.Effect<Post>;
		readonly delete: (id: string) => Effect.Effect<Post, PostNotFound>;
		readonly update: (
			id: string,
			title: string,
			content: string,
		) => Effect.Effect<Post, PostNotFound>;
	}
>()("app/PostRepo") {}
