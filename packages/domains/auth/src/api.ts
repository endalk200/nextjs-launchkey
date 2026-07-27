import { Context, Schema } from "effect";
import { HttpApiMiddleware } from "effect/unstable/httpapi";

export class AuthenticatedUser extends Context.Service<
	AuthenticatedUser,
	{
		readonly id: string;
		readonly email: string;
		readonly name: string;
	}
>()("app/AuthenticatedUser") {}

export class UnauthorizedError extends Schema.TaggedErrorClass<UnauthorizedError>()(
	"Unauthorized",
	{
		message: Schema.String,
	},
	{ httpApiStatus: 401 },
) {}

export class AuthMiddleware extends HttpApiMiddleware.Service<
	AuthMiddleware,
	{
		readonly provides: AuthenticatedUser;
	}
>()("app/AuthMiddleware", {
	error: UnauthorizedError,
}) {}
