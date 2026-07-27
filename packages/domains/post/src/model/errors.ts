import { Schema } from "effect";

export class PostOperationFailedError extends Schema.TaggedErrorClass<PostOperationFailedError>()(
	"PostOperationFailed",
	{
		operation: Schema.String,
		message: Schema.String,
		retryable: Schema.Boolean,
	},
	{
		description:
			"The post operation failed because an underlying dependency was unavailable or returned an unexpected result.",
	},
) {}

export class PostNotFoundError extends Schema.TaggedErrorClass<PostNotFoundError>()(
	"PostNotFound",
	{
		id: Schema.String.check(Schema.isUUID()).annotate({
			description: "Identifier of the post that could not be found.",
		}),
		message: Schema.String,
	},
	{
		description:
			"The requested post does not exist or is not owned by the authenticated user.",
	},
) {}

export class PostAlreadyExistsError extends Schema.TaggedErrorClass<PostAlreadyExistsError>()(
	"PostAlreadyExists",
	{
		id: Schema.String,
		message: Schema.String,
	},
) {}
