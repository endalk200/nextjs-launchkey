import { appConfig } from "@app/config/env";
import { createNodeDrizzleClient } from "@app/database";
import { authSchema } from "@app/database/schema";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { nextCookies, toNextJsHandler } from "better-auth/next-js";

import { makeAuthMiddlewareLayer } from "./auth-middleware.ts";
import { sendAuthEmail } from "./email.tsx";

type AuthEmailUser = {
	readonly email: string;
	readonly name?: string | null;
};

function trustedOrigins() {
	const origins = new Set([
		appConfig.BETTER_AUTH_URL,
		appConfig.NEXT_PUBLIC_APP_URL,
	]);

	if (appConfig.NODE_ENV !== "production") {
		origins.add("http://127.0.0.1:3000");
		origins.add("http://localhost:3000");
	}

	return [...origins];
}

/**
 * Builds the Better Auth options from the validated application environment.
 *
 * Called lazily (never at module scope) so that importing this module does not
 * require a configured environment or open a database connection.
 */
export function createAuthOptions() {
	const database = createNodeDrizzleClient(appConfig.DATABASE_URL);

	return {
		database: drizzleAdapter(database, {
			provider: "pg",
			schema: authSchema,
			camelCase: true,
			transaction: true,
		}),
		secret: appConfig.BETTER_AUTH_SECRET,
		baseURL: appConfig.BETTER_AUTH_URL,
		trustedOrigins: trustedOrigins(),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			revokeSessionsOnPasswordReset: true,
			resetPasswordTokenExpiresIn: 60 * 60,
			sendResetPassword: async ({
				user,
				url,
			}: {
				user: AuthEmailUser;
				url: string;
			}) => {
				await sendAuthEmail({
					kind: "password-reset",
					to: user.email,
					name: user.name,
					url,
				});
			},
		},
		emailVerification: {
			sendOnSignUp: true,
			sendOnSignIn: true,
			autoSignInAfterVerification: true,
			expiresIn: 60 * 60 * 24,
			sendVerificationEmail: async ({
				user,
				url,
			}: {
				user: AuthEmailUser;
				url: string;
			}) => {
				await sendAuthEmail({
					kind: "email-verification",
					to: user.email,
					name: user.name,
					url,
				});
			},
		},
		plugins: [nextCookies()],
	};
}

type Auth = ReturnType<typeof betterAuth<ReturnType<typeof createAuthOptions>>>;

const globalAuthKey = Symbol.for("nextjs-launchkey.auth.instance");

type GlobalWithAuth = typeof globalThis & {
	[globalAuthKey]?: Auth;
};

/**
 * Memoized Better Auth instance.
 *
 * Cached on `globalThis` so Next.js dev-mode module reloads reuse the same
 * database pool instead of opening a new one per reload.
 */
export function getAuth(): Auth {
	const globalScope = globalThis as GlobalWithAuth;

	globalScope[globalAuthKey] ??= betterAuth(createAuthOptions());

	return globalScope[globalAuthKey];
}

export function getAuthRouteHandlers() {
	return toNextJsHandler(getAuth());
}

export const AuthMiddlewareLive = makeAuthMiddlewareLayer((headers) =>
	getAuth().api.getSession({ headers }),
);
