"use client";

import { Effect, ManagedRuntime } from "effect";
import { FetchHttpClient, HttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";
import { PostApi } from "../api.ts";

type CreatePostInput = {
	readonly title: string;
	readonly content: string;
};

type UpdatePostInput = {
	readonly id: string;
	readonly title: string;
	readonly content: string;
};

const runtime = ManagedRuntime.make(FetchHttpClient.layer);
const makePostApiClient = HttpApiClient.make(PostApi);

function runPostRequest<A, E>(
	effect: Effect.Effect<A, E, HttpClient.HttpClient>,
): Promise<A> {
	return runtime.runPromise(effect);
}

export const PostClient = {
	list: () =>
		runPostRequest(
			Effect.flatMap(makePostApiClient, (client) => client.posts.listPosts({})),
		),

	create: (input: CreatePostInput) =>
		runPostRequest(
			Effect.flatMap(makePostApiClient, (client) =>
				client.posts.createPost({ payload: input }),
			),
		),

	update: ({ id, ...payload }: UpdatePostInput) =>
		runPostRequest(
			Effect.flatMap(makePostApiClient, (client) =>
				client.posts.updatePost({
					params: { id },
					payload,
				}),
			),
		),

	delete: (id: string) =>
		runPostRequest(
			Effect.flatMap(makePostApiClient, (client) =>
				client.posts.deletePost({ params: { id } }),
			),
		),

	dispose: () => runtime.dispose(),
};
