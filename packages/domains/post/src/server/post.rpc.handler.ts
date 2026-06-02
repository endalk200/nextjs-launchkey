import { Effect } from "effect";
import { PostRpcs } from "./post.rpc.definition.ts";
import { PostService } from "./post.service.ts";

const PostHandlers = PostRpcs.toLayer(
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

export { PostHandlers };
