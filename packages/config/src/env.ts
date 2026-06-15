import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

type RuntimeEnv = Record<string, string | boolean | number | undefined>;

function readNodeEnv(runtimeEnv: RuntimeEnv) {
	if (runtimeEnv.NODE_ENV === "production") {
		return "production";
	}

	if (runtimeEnv.NODE_ENV === "test") {
		return "test";
	}

	return "development";
}

export function createAppEnv(runtimeEnv: RuntimeEnv = process.env) {
	const nodeEnv = readNodeEnv(runtimeEnv);

	return createEnv({
		server: {
			NODE_ENV: z.enum(["development", "test", "production"]).default(nodeEnv),
			DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required."),
			BETTER_AUTH_URL: z.string().trim().min(1, "BETTER_AUTH_URL is required."),
			NEXT_PUBLIC_APP_URL: z
				.string()
				.trim()
				.min(1, "NEXT_PUBLIC_APP_URL is required."),
			BETTER_AUTH_SECRET: z
				.string()
				.trim()
				.min(1, "BETTER_AUTH_SECRET is required."),
			RESEND_API_KEY: z.string().trim().min(1, "RESEND_API_KEY is required."),
			AUTH_EMAIL_FROM: z.string().trim().min(1, "AUTH_EMAIL_FROM is required."),
		},
		runtimeEnv,
		isServer: true,
		emptyStringAsUndefined: true,
		onValidationError: (issues) => {
			throw new Error(
				`Invalid application environment variables: ${issues
					.map((issue) => issue.path?.join(".") ?? issue.message)
					.join(", ")}`,
			);
		},
	});
}

export const appConfig = createAppEnv();
