import { PostHog } from "posthog-node";
import type { PostHogRequestContext } from "./request-context.ts";

type ServerExceptionContext = PostHogRequestContext & {
	readonly method?: string;
	readonly path?: string;
	readonly release?: string;
	readonly routerKind?: string;
	readonly routePath?: string;
	readonly routeType?: string;
	readonly status?: number;
};

const postHogClientKey = Symbol.for("nextjs-launchkey.posthog.client");

type GlobalWithPostHog = typeof globalThis & {
	[postHogClientKey]?: PostHog | null;
};

const globalScope = globalThis as GlobalWithPostHog;

function getPostHogClient(): PostHog | null {
	if (globalScope[postHogClientKey] !== undefined) {
		return globalScope[postHogClientKey];
	}

	const projectToken =
		process.env.POSTHOG_PROJECT_TOKEN ??
		process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

	if (!projectToken) {
		globalScope[postHogClientKey] = null;

		return null;
	}

	const client = new PostHog(projectToken, {
		flushAt: 1,
		flushInterval: 0,
		host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
	});

	process.once("beforeExit", () => {
		void client.shutdown().catch(() => undefined);
	});
	globalScope[postHogClientKey] = client;

	return client;
}

function cleanContext(
	value: ServerExceptionContext,
): Record<string, number | string> {
	return Object.fromEntries(
		Object.entries(value).filter(
			(entry): entry is [string, number | string] =>
				typeof entry[1] === "number" || typeof entry[1] === "string",
		),
	);
}

/**
 * Captures immediately because Next route handlers may run in short-lived
 * processes. This observer is deliberately total: telemetry failure must never
 * change an application response.
 */
export async function captureServerException(
	error: unknown,
	context: ServerExceptionContext = {},
): Promise<void> {
	const client = getPostHogClient();

	if (!client) {
		return;
	}

	const release =
		context.release ??
		process.env.POSTHOG_RELEASE_VERSION ??
		process.env.VERCEL_GIT_COMMIT_SHA ??
		process.env.GITHUB_SHA;

	try {
		await client.captureExceptionImmediate(error, context.distinctId, {
			...cleanContext(context),
			...(context.sessionId ? { $session_id: context.sessionId } : {}),
			...(release ? { $release: release } : {}),
		});
	} catch {
		// Observability is never allowed to become an application failure.
	}
}

export async function shutdownPostHog(): Promise<void> {
	const client = getPostHogClient();

	if (client) {
		await client.shutdown();
	}
}
