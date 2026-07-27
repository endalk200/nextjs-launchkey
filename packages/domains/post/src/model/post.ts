import { Schema } from "effect";

export const PostId = Schema.String.check(Schema.isUUID()).annotate({
	description: "Unique identifier for a post.",
	examples: ["00000000-0000-4000-8000-000000000001"],
});

export class Post extends Schema.Class<Post>("Post")(
	{
		id: PostId,
		title: Schema.String.annotate({
			description: "Display title for the post.",
			examples: ["My first post"],
		}),
		content: Schema.String.annotate({
			description: "Body content for the post.",
			examples: ["This is the body of my first post."],
		}),
	},
	{
		description: "A post owned by the authenticated user.",
	},
) {}
