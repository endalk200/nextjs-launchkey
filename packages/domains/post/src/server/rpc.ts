import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { Post } from "../model/post.ts";
import { Schema } from "effect";
import { PostNotFound } from "../model/errors.ts";

export class ListPosts extends Rpc.make("Post.List", {
	success: Schema.Array(Post),
}) {}

export class CreatePost extends Rpc.make("Post.Create", {
	payload: {
		title: Schema.String,
		content: Schema.String,
	},
	success: Post,
}) {}

export class DeletePost extends Rpc.make("Post.Delete", {
	payload: {
		id: Schema.String,
	},
	success: Post,
	error: PostNotFound,
}) {}

export class UpdatePost extends Rpc.make("Post.Update", {
	payload: {
		id: Schema.String,
		title: Schema.String,
		content: Schema.String,
	},
	success: Post,
	error: PostNotFound,
}) {}

export class PostRpcs extends RpcGroup.make(
	ListPosts,
	CreatePost,
	DeletePost,
	UpdatePost,
) {}
