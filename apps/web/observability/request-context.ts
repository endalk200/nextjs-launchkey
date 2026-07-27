export type HeaderSource =
	| Headers
	| NodeJS.Dict<string | ReadonlyArray<string> | string[]>;

export type PostHogRequestContext = {
	readonly distinctId?: string;
	readonly sessionId?: string;
	readonly windowId?: string;
};

function readHeader(headers: HeaderSource, name: string): string | undefined {
	const value =
		headers instanceof Headers
			? headers.get(name)
			: headers[name.toLowerCase()];
	const first = Array.isArray(value) ? value[0] : value;

	if (typeof first !== "string") {
		return undefined;
	}

	const trimmed = first.trim();

	return trimmed.length > 0 && trimmed.length <= 200 ? trimmed : undefined;
}

/**
 * PostHog's browser tracing-header integration adds these values to same-origin
 * requests. They are correlation metadata only and must never be used for
 * authorization.
 */
export function readPostHogRequestContext(
	headers: HeaderSource,
): PostHogRequestContext {
	return {
		distinctId: readHeader(headers, "x-posthog-distinct-id"),
		sessionId: readHeader(headers, "x-posthog-session-id"),
		windowId: readHeader(headers, "x-posthog-window-id"),
	};
}
