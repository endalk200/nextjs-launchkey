import { Effect } from "effect";
import { PostService } from "./service.ts";
import { PostRpcs } from "./rpc.defnition.ts";

export const PostHandlers = PostRpcs.toLayer(
	Effect.gen(function* () {
		const posts = yield* PostService;

		return PostRpcs.of({
			"Post.List": Effect.fn("Post.List")(function* () {
				const list = yield* posts.list;

				return list;
			}),
			"Post.Create": Effect.fn("Post.Create")(function* (payload) {
				const post = yield* posts.create({
					title: payload.title,
					content: payload.content,
				});

				return post;
			}),
			"Post.Update": Effect.fn("Post.Update")(function* (payload) {
				const post = yield* posts.update({
					id: payload.id,
					title: payload.title,
					content: payload.content,
				});

				return post;
			}),
			"Post.Delete": Effect.fn("Post.Delete")(function* (payload) {
				const post = yield* posts.delete(payload.id);

				return post;
			}),
		});
	}),
);
