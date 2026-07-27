"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	sessionOptions: {
		// Poll only while Better Auth has an authenticated session. This bounds a
		// stale PostHog identity after remote expiry or revocation to roughly two
		// minutes; window-focus and cross-tab updates can reconcile it sooner.
		refetchInterval: 120,
		refetchOnWindowFocus: true,
		refetchWhenOffline: false,
	},
});
