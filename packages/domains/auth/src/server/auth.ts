import { createPrismaClient } from "@app/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies, toNextJsHandler } from "better-auth/next-js";

import { makeAuthMiddlewareLayer } from "./auth-middleware.ts";
import { sendAuthEmail } from "./email.tsx";

const defaultDatabaseUrl =
	"postgresql://launchkey:launchkey@localhost:5432/launchkey?schema=public";
const defaultAuthUrl = "http://localhost:3000";
const developmentSecret =
	"development-only-secret-change-before-production-32-characters";

function readDatabaseUrl() {
	return process.env.DATABASE_URL ?? defaultDatabaseUrl;
}

function readAuthSecret() {
	return process.env.BETTER_AUTH_SECRET ?? developmentSecret;
}

function readAuthUrl() {
	return (
		process.env.BETTER_AUTH_URL ??
		process.env.NEXT_PUBLIC_APP_URL ??
		defaultAuthUrl
	);
}

function trustedOrigins() {
	return [
		readAuthUrl(),
		"http://127.0.0.1:3000",
		"http://localhost:3000",
	].filter((value, index, values) => values.indexOf(value) === index);
}

const prisma = createPrismaClient(readDatabaseUrl());

export const authOptions = {
	database: prismaAdapter(prisma, {
		provider: "postgresql",
		transaction: true,
	}),
	secret: readAuthSecret(),
	baseURL: readAuthUrl(),
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
			user: { email: string; name?: string | null };
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
			user: { email: string; name?: string | null };
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

export const auth = betterAuth(authOptions);

export const authRouteHandlers = toNextJsHandler(auth);

export const AuthMiddlewareLive = makeAuthMiddlewareLayer((headers) =>
	auth.api.getSession({ headers }),
);
