import { afterEach, describe, expect, it, vi } from "vitest";

const completeEnv = {
	AUTH_EMAIL_FROM: "LaunchKey <auth@example.com>",
	BETTER_AUTH_SECRET: "development-secret",
	BETTER_AUTH_URL: "http://localhost:3000",
	DATABASE_URL: "postgresql://user:pass@localhost:5432/app?schema=public",
	NEXT_PUBLIC_APP_URL: "http://localhost:3000",
	NODE_ENV: "development",
	RESEND_API_KEY: "re_test",
} as const;

describe("application environment", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	async function importEnvModule() {
		for (const [key, value] of Object.entries(completeEnv)) {
			vi.stubEnv(key, value);
		}

		return import("./env.ts");
	}

	it("accepts a complete environment", async () => {
		const { createAppEnv } = await importEnvModule();
		const env = createAppEnv(completeEnv);

		expect(env).toMatchObject({
			AUTH_EMAIL_FROM: "LaunchKey <auth@example.com>",
			BETTER_AUTH_SECRET: "development-secret",
			BETTER_AUTH_URL: "http://localhost:3000",
			DATABASE_URL: "postgresql://user:pass@localhost:5432/app?schema=public",
			NEXT_PUBLIC_APP_URL: "http://localhost:3000",
			RESEND_API_KEY: "re_test",
		});
	});

	it.each([
		"DATABASE_URL",
		"BETTER_AUTH_URL",
		"NEXT_PUBLIC_APP_URL",
		"BETTER_AUTH_SECRET",
		"RESEND_API_KEY",
		"AUTH_EMAIL_FROM",
	] as const)("requires %s", async (name) => {
		const { createAppEnv } = await importEnvModule();
		const runtimeEnv = { ...completeEnv, [name]: " " };

		expect(() => {
			const env = createAppEnv(runtimeEnv);

			return env[name];
		}).toThrow(new RegExp(name));
	});

	it("reports the invalid variable and validation reason", async () => {
		const { createAppEnv } = await importEnvModule();

		expect(() => {
			createAppEnv({ ...completeEnv, NEXT_PUBLIC_APP_URL: "not-a-url" });
		}).toThrow(
			"Invalid application environment variables:\n- NEXT_PUBLIC_APP_URL: NEXT_PUBLIC_APP_URL must be a valid URL.",
		);
	});

	it.each([
		"DATABASE_URL",
		"BETTER_AUTH_URL",
		"NEXT_PUBLIC_APP_URL",
	] as const)("rejects a malformed %s", async (name) => {
		const { createAppEnv } = await importEnvModule();
		const runtimeEnv = { ...completeEnv, [name]: "not-a-url" };

		expect(() => {
			const env = createAppEnv(runtimeEnv);

			return env[name];
		}).toThrow(new RegExp(`${name}: ${name} must be a valid URL.`));
	});

	it("accepts a root-relative PostHog reverse proxy", async () => {
		const { createAppEnv } = await importEnvModule();
		const env = createAppEnv({
			...completeEnv,
			NEXT_PUBLIC_POSTHOG_HOST: "/insights",
			NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "phc_test",
		});

		expect(env.NEXT_PUBLIC_POSTHOG_HOST).toBe("/insights");
	});

	it("accepts an absolute HTTPS PostHog host", async () => {
		const { createAppEnv } = await importEnvModule();
		const env = createAppEnv({
			...completeEnv,
			NEXT_PUBLIC_POSTHOG_HOST: "https://eu.i.posthog.com",
			NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "phc_test",
		});

		expect(env.NEXT_PUBLIC_POSTHOG_HOST).toBe("https://eu.i.posthog.com");
	});

	it.each([
		"//collector.example",
		"/\\collector.example",
		"ftp://collector.example",
	])("rejects an unsafe PostHog host: %s", async (host) => {
		const { createAppEnv } = await importEnvModule();

		expect(() =>
			createAppEnv({
				...completeEnv,
				NEXT_PUBLIC_POSTHOG_HOST: host,
				NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "phc_test",
			}),
		).toThrow(/NEXT_PUBLIC_POSTHOG_HOST/);
	});

	it("rejects an invalid OTel sample ratio", async () => {
		const { createAppEnv } = await importEnvModule();

		expect(() =>
			createAppEnv({ ...completeEnv, OTEL_TRACES_SAMPLER_ARG: "2" }),
		).toThrow(/OTEL_TRACES_SAMPLER_ARG/);
	});
});
