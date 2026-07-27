import {
	AuthenticatedUser,
	AuthMiddleware,
	UnauthorizedError,
} from "../api.ts";
import { Effect, Layer, Redacted } from "effect";
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

type AuthHandler = AuthMiddleware["Service"]["betterAuthSession"];

function unauthorized() {
	return new UnauthorizedError({
		message: "Authentication is required.",
	});
}

function toWebHeaders(headers: Record<string, string>) {
	const webHeaders = new Headers();

	for (const [key, value] of Object.entries(headers)) {
		webHeaders.set(key, value);
	}

	return webHeaders;
}

export function makeAuthMiddlewareLayer(resolveSession: ResolveAuthSession) {
	const authenticate: AuthHandler = (effect, { credential }) =>
		Effect.gen(function* () {
			if (Redacted.value(credential).length === 0) {
				return yield* Effect.fail(unauthorized());
			}

			const request = yield* HttpServerRequest.HttpServerRequest;
			const session = yield* Effect.tryPromise({
				try: () => resolveSession(toWebHeaders(request.headers)),
				catch: unauthorized,
			});

			if (!session) {
				return yield* Effect.fail(unauthorized());
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
		});

	return Layer.succeed(
		AuthMiddleware,
		AuthMiddleware.of({
			betterAuthSession: authenticate,
			betterAuthSecureSession: authenticate,
		}),
	);
}

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
			betterAuthSecureSession: authenticate,
		}),
	);
}

const reject: AuthHandler = () => Effect.fail(unauthorized());

export const RejectingAuthMiddlewareTest = Layer.succeed(
	AuthMiddleware,
	AuthMiddleware.of({
		betterAuthSession: reject,
		betterAuthSecureSession: reject,
	}),
);

export { AuthenticatedUser, AuthMiddleware, UnauthorizedError };
