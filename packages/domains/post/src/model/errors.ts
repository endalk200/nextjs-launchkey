import { Schema } from "effect";

export class PostNotFound extends Schema.TaggedErrorClass<PostNotFound>()(
	"PostNotFound",
	{
		id: Schema.String,
	},
) {}
