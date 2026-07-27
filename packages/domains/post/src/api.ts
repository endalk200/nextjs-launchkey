import { AuthMiddleware } from "@app/auth/api";
import { Schema } from "effect";
import {
	HttpApi,
	HttpApiEndpoint,
	HttpApiError,
	HttpApiGroup,
	HttpApiSchema,
	OpenApi,
} from "effect/unstable/httpapi";

import { PostNotFoundError, PostOperationFailedError } from "./model/errors.ts";
import { Post, PostId } from "./model/post.ts";

export const PostIdParams = Schema.Struct({
	id: PostId,
});

const requiredString = (label: string, description: string, example: string) =>
	Schema.String.annotate({
		description,
		examples: [example],
	}).check(
		Schema.isMinLength(1, { message: `${label} is required.` }).abort(),
		Schema.isPattern(/\S/, { message: `${label} is required.` }),
	);

export const CreatePostPayload = Schema.Struct({
	title: requiredString(
		"Title",
		"Display title for the post. Must contain at least one non-whitespace character.",
		"My first post",
	),
	content: requiredString(
		"Content",
		"Body content for the post. Must contain at least one non-whitespace character.",
		"This is the body of my first post.",
	),
});

export const UpdatePostPayload = CreatePostPayload;

const BadRequestResponse = HttpApiError.BadRequestNoContent.annotate({
	description: "The path parameters or JSON request body failed validation.",
});
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
	})
		.annotate(OpenApi.Summary, "List the authenticated user's posts")
		.annotate(
			OpenApi.Description,
			"Returns every post owned by the user represented by the current session.",
		),
	HttpApiEndpoint.post("createPost", "/posts", {
		payload: CreatePostPayload,
		success: CreatedPost,
		error: [BadRequestResponse, PostOperationFailedResponse],
	})
		.annotate(OpenApi.Summary, "Create a post")
		.annotate(
			OpenApi.Description,
			"Creates a post owned by the authenticated user and returns it with 201 Created.",
		),
	// PUT because the payload replaces the whole post; all fields are required.
	HttpApiEndpoint.put("updatePost", "/posts/:id", {
		params: PostIdParams,
		payload: UpdatePostPayload,
		success: Post,
		error: [
			BadRequestResponse,
			PostNotFoundResponse,
			PostOperationFailedResponse,
		],
	})
		.annotate(OpenApi.Summary, "Replace a post")
		.annotate(
			OpenApi.Description,
			"Applies a complete replacement of the editable fields on a post owned by the authenticated user. Returns 404 when the post does not exist or belongs to another user.",
		),
	HttpApiEndpoint.delete("deletePost", "/posts/:id", {
		params: PostIdParams,
		success: Post,
		error: [
			BadRequestResponse,
			PostNotFoundResponse,
			PostOperationFailedResponse,
		],
	})
		.annotate(OpenApi.Summary, "Delete a post")
		.annotate(
			OpenApi.Description,
			"Deletes a post owned by the authenticated user and returns the deleted post. Returns 404 when the post does not exist or belongs to another user.",
		),
] as const;

export const PostApi = HttpApi.make("PostApi")
	.add(
		HttpApiGroup.make("posts")
			.annotate(OpenApi.Title, "Posts")
			.annotate(
				OpenApi.Description,
				"Create and manage posts owned by the authenticated user.",
			)
			.add(...PostEndpoints)
			.middleware(AuthMiddleware),
	)
	.prefix("/api")
	.annotate(OpenApi.Title, "LaunchKey Posts API")
	.annotate(OpenApi.Version, "0.1.0")
	.annotate(
		OpenApi.Description,
		"Authenticated API for creating and managing posts owned by the authenticated user.",
	);
