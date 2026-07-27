import { AuthMiddleware } from "@app/auth/api";
import { Schema } from "effect";
import {
	HttpApi,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSchema,
} from "effect/unstable/httpapi";

import { PostNotFoundError, PostOperationFailedError } from "./model/errors.ts";
import { Post } from "./model/post.ts";

export const PostIdParams = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
});

const requiredString = (label: string) =>
	Schema.String.check(
		Schema.makeFilter(
			(value) => value.trim().length > 0 || `${label} is required.`,
		),
	);

export const CreatePostPayload = Schema.Struct({
	title: requiredString("Title"),
	content: requiredString("Content"),
});

export const UpdatePostPayload = CreatePostPayload;

const PostOperationFailedResponse = PostOperationFailedError.pipe(
	HttpApiSchema.status("InternalServerError"),
);
const PostNotFoundResponse = PostNotFoundError.pipe(
	HttpApiSchema.status("NotFound"),
);
const CreatedPost = Post.pipe(HttpApiSchema.status("Created"));

const PostEndpoints = [
	HttpApiEndpoint.get("listPosts", "/posts", {
		success: Schema.Array(Post),
		error: PostOperationFailedResponse,
	}),
	HttpApiEndpoint.post("createPost", "/posts", {
		payload: CreatePostPayload,
		success: CreatedPost,
		error: PostOperationFailedResponse,
	}),
	HttpApiEndpoint.patch("updatePost", "/posts/:id", {
		params: PostIdParams,
		payload: UpdatePostPayload,
		success: Post,
		error: [PostNotFoundResponse, PostOperationFailedResponse],
	}),
	HttpApiEndpoint.delete("deletePost", "/posts/:id", {
		params: PostIdParams,
		success: Post,
		error: [PostNotFoundResponse, PostOperationFailedResponse],
	}),
] as const;

export const PostApi = HttpApi.make("PostApi")
	.add(
		HttpApiGroup.make("posts")
			.add(...PostEndpoints)
			.middleware(AuthMiddleware),
	)
	.prefix("/api");
