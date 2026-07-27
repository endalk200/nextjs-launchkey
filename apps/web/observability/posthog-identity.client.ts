export type TelemetryUser = {
	readonly id: string;
};

type PostHogIdentityClient = {
	readonly get_property: (name: string) => unknown;
	readonly identify: (id: string) => void;
	readonly reset: () => void;
};

/**
 * Reconciles PostHog's persisted identity with the authoritative application
 * session. Reset before clearing or changing users so person properties,
 * feature flags, and replay state cannot leak across authentication boundaries.
 */
export function synchronizePostHogIdentity(
	client: PostHogIdentityClient,
	user?: TelemetryUser,
): void {
	const storedUserId = client.get_property("$user_id");
	const currentUserId =
		typeof storedUserId === "string" ? storedUserId : undefined;

	if (currentUserId === user?.id) {
		return;
	}

	if (currentUserId !== undefined) {
		client.reset();
	}

	if (user) {
		client.identify(user.id);
	}
}
