import { Effect, Layer } from "effect";
import {
	AuthenticatedUser,
	AuthMiddleware,
	UnauthorizedError,
} from "../api.ts";
import type { AuthHandler } from "../server/auth-middleware.ts";

/**
 * Auth middleware layer that authenticates every request as the given user.
 *
 * Keep this module free of environment-dependent imports so unit tests can
 * use it without configuring the application environment.
 */
export function makeTestAuthMiddlewareLayer(
	user: AuthenticatedUser["Service"] = AuthenticatedUser.of({
		id: "test-user",
		email: "test@example.com",
		name: "Test User",
	}),
) {
	const authenticate: AuthHandler = (effect) =>
		effect.pipe(Effect.provideService(AuthenticatedUser, user));

	return Layer.succeed(
		AuthMiddleware,
		AuthMiddleware.of({
			betterAuthSession: authenticate,
		}),
	);
}

/** Auth middleware layer that rejects every request as unauthorized. */
export const RejectingAuthMiddlewareTest = Layer.succeed(
	AuthMiddleware,
	AuthMiddleware.of({
		betterAuthSession: () =>
			Effect.fail(
				new UnauthorizedError({ message: "Authentication is required." }),
			),
	}),
);
