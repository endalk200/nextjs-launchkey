// @vitest-environment node

import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer, Logger, Schema } from "effect";
import { HttpServer } from "effect/unstable/http";
import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiTest,
} from "effect/unstable/httpapi";
import {
	AuthenticatedUser,
	AuthMiddleware,
	AuthUnavailableError,
	UnauthorizedError,
} from "../api.ts";
import {
	makeAuthMiddlewareLayer,
	type ResolveAuthSession,
} from "./auth-middleware.ts";

const AuthTestApi = HttpApi.make("AuthTestApi").add(
	HttpApiGroup.make("auth")
		.add(
			HttpApiEndpoint.get("currentUser", "/auth/current-user", {
				headers: Schema.Struct({
					cookie: Schema.String,
				}),
				success: Schema.String,
			}),
		)
		.middleware(AuthMiddleware),
);

const AuthTestHandlers = HttpApiBuilder.group(AuthTestApi, "auth", (handlers) =>
	handlers.handle("currentUser", () =>
		Effect.map(AuthenticatedUser, (user) => user.email),
	),
);

function runApi<A, E, R>(
	effect: Effect.Effect<A, E, R>,
	resolveSession: ResolveAuthSession,
) {
	const authLayer = makeAuthMiddlewareLayer(resolveSession);

	return Effect.scoped(effect).pipe(
		Effect.provide(AuthTestHandlers.pipe(Layer.provide(authLayer))),
		Effect.provide(authLayer),
		Effect.provide(HttpServer.layerServices),
	);
}

const sessionCookie = {
	headers: {
		cookie: "better-auth.session_token=signed-session-token",
	},
};

describe("makeAuthMiddlewareLayer", () => {
	it.effect("provides the authenticated user for a valid session", () =>
		Effect.gen(function* () {
			const client = yield* HttpApiTest.groups(AuthTestApi, ["auth"]);

			const email = yield* client.auth.currentUser(sessionCookie);

			assert.strictEqual(email, "user@example.com");
		}).pipe((effect) =>
			runApi(effect, () =>
				Promise.resolve({
					user: {
						id: "user-1",
						email: "user@example.com",
						name: "Test User",
					},
				}),
			),
		),
	);

	it.effect("returns unauthorized when no session exists", () =>
		Effect.gen(function* () {
			const client = yield* HttpApiTest.groups(AuthTestApi, ["auth"]);

			const error = yield* client.auth
				.currentUser(sessionCookie)
				.pipe(Effect.flip);

			assert.instanceOf(error, UnauthorizedError);
			assert.strictEqual(error.message, "Authentication is required.");
		}).pipe((effect) => runApi(effect, () => Promise.resolve(null))),
	);

	it.effect("returns unavailable and logs the original lookup failure", () => {
		const lookupFailure = new Error("database unavailable");
		const logMessages: unknown[] = [];
		const logger = Logger.make<unknown, void>(({ message }) => {
			logMessages.push(message);
		});

		return Effect.gen(function* () {
			const client = yield* HttpApiTest.groups(AuthTestApi, ["auth"]);

			const error = yield* client.auth
				.currentUser(sessionCookie)
				.pipe(Effect.flip);

			assert.instanceOf(error, AuthUnavailableError);
			assert.strictEqual(
				error.message,
				"Authentication is temporarily unavailable.",
			);
			assert.isTrue(
				logMessages.some(
					(message) =>
						Array.isArray(message) &&
						message[0] === "Auth session lookup failed" &&
						message[1] === lookupFailure,
				),
			);
		}).pipe(
			(effect) => runApi(effect, () => Promise.reject(lookupFailure)),
			Effect.provide(Logger.layer([logger])),
		);
	});
});
