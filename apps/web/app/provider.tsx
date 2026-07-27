"use client";

import { authClient } from "@app/auth/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import {
	synchronizePostHogIdentity,
	synchronizePostHogSession,
	type TelemetryUser,
} from "../observability/posthog-identity.client";

function PostHogIdentitySync({
	initialTelemetryUser,
}: {
	readonly initialTelemetryUser?: TelemetryUser;
}) {
	const clientSession = authClient.useSession();

	useEffect(() => {
		synchronizePostHogIdentity(posthog, initialTelemetryUser);
	}, [initialTelemetryUser]);

	useEffect(() => {
		synchronizePostHogSession(posthog, {
			error: clientSession.error,
			isPending: clientSession.isPending,
			userId: clientSession.data?.user.id,
		});
	}, [
		clientSession.data?.user.id,
		clientSession.error,
		clientSession.isPending,
	]);

	return null;
}

export function Providers({
	children,
	initialTelemetryUser,
}: {
	readonly children: React.ReactNode;
	readonly initialTelemetryUser?: TelemetryUser;
}) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<>
			{process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ? (
				<PostHogIdentitySync initialTelemetryUser={initialTelemetryUser} />
			) : null}
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</>
	);
}
