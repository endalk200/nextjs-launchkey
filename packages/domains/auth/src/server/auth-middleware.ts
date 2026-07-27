import {
	AuthenticatedUser,
	AuthMiddleware,
	UnauthorizedError,
} from "../api.ts";
import { Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/unstable/http";

type SessionUser = {
	readonly id: string;
	readonly email: string;
	readonly name?: string | null;
};

type AuthSession = {
	readonly user: SessionUser;
} | null;

export type ResolveAuthSession = (headers: Headers) => Promise<AuthSession>;

function toWebHeaders(headers: Record<string, string>) {
	const webHeaders = new Headers();

	for (const [key, value] of Object.entries(headers)) {
		webHeaders.set(key, value);
	}

	return webHeaders;
}

export function makeAuthMiddlewareLayer(resolveSession: ResolveAuthSession) {
	return Layer.succeed(
		AuthMiddleware,
		AuthMiddleware.of((effect) =>
			Effect.gen(function* () {
				const request = yield* HttpServerRequest.HttpServerRequest;
				const session = yield* Effect.tryPromise({
					try: () => resolveSession(toWebHeaders(request.headers)),
					catch: () =>
						new UnauthorizedError({
							message: "Authentication is required.",
						}),
				});

				if (!session) {
					return yield* Effect.fail(
						new UnauthorizedError({
							message: "Authentication is required.",
						}),
					);
				}

				return yield* effect.pipe(
					Effect.provideService(
						AuthenticatedUser,
						AuthenticatedUser.of({
							id: session.user.id,
							email: session.user.email,
							name: session.user.name ?? session.user.email,
						}),
					),
				);
			}),
		),
	);
}

export function makeTestAuthMiddlewareLayer(
	user: AuthenticatedUser["Service"] = AuthenticatedUser.of({
		id: "test-user",
		email: "test@example.com",
		name: "Test User",
	}),
) {
	return Layer.succeed(
		AuthMiddleware,
		AuthMiddleware.of((effect) =>
			effect.pipe(Effect.provideService(AuthenticatedUser, user)),
		),
	);
}

export const RejectingAuthMiddlewareTest = Layer.succeed(
	AuthMiddleware,
	AuthMiddleware.of(() =>
		Effect.fail(
			new UnauthorizedError({
				message: "Authentication is required.",
			}),
		),
	),
);

export { AuthenticatedUser, AuthMiddleware, UnauthorizedError };
