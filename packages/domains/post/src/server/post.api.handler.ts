import { AuthenticatedUser } from "@app/auth/api";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { PostApi } from "../api.ts";
import { PostService } from "./post.service.ts";

const PostHandlers = HttpApiBuilder.group(PostApi, "posts", (handlers) =>
	Effect.gen(function* () {
		const posts = yield* PostService;

		return handlers
			.handle("listPosts", () =>
				Effect.fn("Post.List")(function* () {
					const user = yield* AuthenticatedUser;
					const list = yield* posts.list(user.id);

					return list;
				})(),
			)
			.handle("createPost", ({ payload }) =>
				Effect.fn("Post.Create")(function* () {
					const user = yield* AuthenticatedUser;
					const post = yield* posts.create({
						userId: user.id,
						title: payload.title,
						content: payload.content,
					});

					return post;
				})(),
			)
			.handle("updatePost", ({ params, payload }) =>
				Effect.fn("Post.Update")(function* () {
					const user = yield* AuthenticatedUser;
					const post = yield* posts.update({
						userId: user.id,
						id: params.id,
						title: payload.title,
						content: payload.content,
					});

					return post;
				})(),
			)
			.handle("deletePost", ({ params }) =>
				Effect.fn("Post.Delete")(function* () {
					const user = yield* AuthenticatedUser;
					const post = yield* posts.delete({
						userId: user.id,
						id: params.id,
					});

					return post;
				})(),
			);
	}),
);

export { PostHandlers };
