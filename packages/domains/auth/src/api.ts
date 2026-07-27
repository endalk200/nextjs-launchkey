import { Context, Schema } from "effect";
import {
	HttpApiMiddleware,
	HttpApiSecurity,
	OpenApi,
} from "effect/unstable/httpapi";

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

export class AuthUnavailableError extends Schema.TaggedErrorClass<AuthUnavailableError>()(
	"AuthUnavailable",
	{
		message: Schema.String,
	},
	{ httpApiStatus: 503 },
) {}

export const BetterAuthSessionCookie = HttpApiSecurity.apiKey({
	key: "better-auth.session_token",
	in: "cookie",
}).pipe(
	HttpApiSecurity.annotate(
		OpenApi.Description,
		"Better Auth session cookie. HTTPS deployments use the __Secure- prefix.",
	),
);

export class AuthMiddleware extends HttpApiMiddleware.Service<
	AuthMiddleware,
	{
		readonly provides: AuthenticatedUser;
	}
>()("app/AuthMiddleware", {
	error: [UnauthorizedError, AuthUnavailableError],
	security: {
		betterAuthSession: BetterAuthSessionCookie,
	},
}) {}
