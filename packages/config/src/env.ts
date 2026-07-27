import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";
import { loadRootEnv } from "./load-root-env.ts";

loadRootEnv();

type RuntimeEnv = Record<string, string | boolean | number | undefined>;
type EnvIssue = {
	path?: readonly unknown[];
	message: string;
};

function readNodeEnv(runtimeEnv: RuntimeEnv) {
	if (runtimeEnv.NODE_ENV === "production") {
		return "production";
	}

	if (runtimeEnv.NODE_ENV === "test") {
		return "test";
	}

	return "development";
}

function isPostHogBrowserHost(value: string): boolean {
	try {
		if (value.startsWith("/")) {
			const base = new URL("https://root-relative.invalid");

			return new URL(value, base).origin === base.origin;
		}

		const url = new URL(value);

		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

export function createAppEnv(runtimeEnv: RuntimeEnv = process.env) {
	const nodeEnv = readNodeEnv(runtimeEnv);

	return createEnv({
		server: {
			NODE_ENV: z.enum(["development", "test", "production"]).default(nodeEnv),
			DATABASE_URL: z.url("DATABASE_URL must be a valid URL."),
			BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL."),
			BETTER_AUTH_SECRET: z
				.string()
				.trim()
				.min(1, "BETTER_AUTH_SECRET is required."),
			RESEND_API_KEY: z.string().trim().min(1, "RESEND_API_KEY is required."),
			AUTH_EMAIL_FROM: z.string().trim().min(1, "AUTH_EMAIL_FROM is required."),
			OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
			OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: z.url().optional(),
			OTEL_EXPORTER_OTLP_LOGS_HEADERS: z.string().optional(),
			OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.url().optional(),
			OTEL_EXPORTER_OTLP_TRACES_HEADERS: z.string().optional(),
			OTEL_DEPLOYMENT_ENVIRONMENT: z.string().trim().min(1).optional(),
			OTEL_SERVICE_NAME: z.string().trim().min(1).optional(),
			OTEL_SERVICE_VERSION: z.string().trim().min(1).optional(),
			OTEL_TRACES_SAMPLER: z
				.enum([
					"always_off",
					"always_on",
					"parentbased_always_on",
					"parentbased_traceidratio",
					"traceidratio",
				])
				.optional(),
			OTEL_TRACES_SAMPLER_ARG: z.coerce.number().min(0).max(1).optional(),
			POSTHOG_API_KEY: z.string().trim().min(1).optional(),
			POSTHOG_HOST: z.url().optional(),
			POSTHOG_PROJECT_ID: z.string().trim().min(1).optional(),
			POSTHOG_PROJECT_TOKEN: z.string().trim().min(1).optional(),
			POSTHOG_RELEASE_VERSION: z.string().trim().min(1).optional(),
			POSTHOG_SOURCE_MAPS_ENABLED: z.enum(["false", "true"]).optional(),
			POSTHOG_UI_HOST: z.url().optional(),
		},
		clientPrefix: "NEXT_PUBLIC_",
		client: {
			NEXT_PUBLIC_APP_URL: z.url("NEXT_PUBLIC_APP_URL must be a valid URL."),
			NEXT_PUBLIC_POSTHOG_HOST: z
				.string()
				.refine(
					isPostHogBrowserHost,
					"NEXT_PUBLIC_POSTHOG_HOST must be a URL or root-relative path.",
				)
				.optional(),
			NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string().trim().min(1).optional(),
			NEXT_PUBLIC_POSTHOG_UI_HOST: z.url().optional(),
		},
		runtimeEnv,
		isServer: true,
		emptyStringAsUndefined: true,
		onValidationError: (issues) => {
			throw new Error(
				`Invalid application environment variables:\n${issues
					.map((issue: EnvIssue) => {
						const name = issue.path?.join(".") || "unknown";

						return `- ${name}: ${issue.message}`;
					})
					.join("\n")}`,
			);
		},
	});
}

export const appConfig = createAppEnv();
