import { Context, Effect, Layer, Ref } from "effect";
import { PostNotFound } from "../model/errors.ts";
import { Post } from "../model/post.ts";

export class PostRepository extends Context.Service<
	PostRepository,
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

export const PostRepoLive = Layer.effect(
	PostRepository,
	Effect.gen(function* () {
		const posts = yield* Ref.make<ReadonlyArray<Post>>([]);
		const nextId = yield* Ref.make(0);

		return {
			list: Effect.gen(function* () {
				yield* Effect.log("Listing posts");

				const allPosts = yield* Ref.get(posts);

				return allPosts;
			}).pipe(Effect.withSpan("PostRepo.List")),

			create: (title, content) =>
				Effect.gen(function* () {
					const id = String(yield* Ref.updateAndGet(nextId, (n) => n + 1));

					yield* Effect.annotateCurrentSpan({
						"post.id": id,
					});

					const post = new Post({
						id: id,
						title: title,
						content: content,
					});

					yield* Ref.update(posts, (all) => [...all, post]);

					return post;
				}).pipe(Effect.withSpan("PostRepo.Create")),

			delete: (id) =>
				Effect.gen(function* () {
					const deleted = yield* Ref.modify(posts, (all) => {
						const post = all.find((post) => post.id === id);

						if (!post) {
							return [undefined, all] as const;
						}

						return [post, all.filter((post) => post.id !== id)] as const;
					});

					if (!deleted) {
						return yield* new PostNotFound({ id });
					}

					return deleted;
				}).pipe(Effect.withSpan("PostRepo.Delete")),

			update: (id, title, content) =>
				Effect.gen(function* () {
					const updated = yield* Ref.modify(posts, (all) => {
						const post = all.find((post) => post.id === id);

						if (!post) {
							return [undefined, all] as const;
						}

						const updated = new Post({
							...post,
							title,
							content,
						});

						return [
							updated,
							all.map((post) => (post.id === id ? updated : post)),
						] as const;
					});

					if (!updated) {
						return yield* new PostNotFound({ id });
					}

					return updated;
				}).pipe(Effect.withSpan("PostRepo.Update")),
		};
	}),
);
