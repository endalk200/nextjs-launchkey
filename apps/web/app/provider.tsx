"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import {
	synchronizePostHogIdentity,
	type TelemetryUser,
} from "../observability/posthog-identity.client";

export function Providers({
	children,
	telemetryUser,
}: {
	readonly children: React.ReactNode;
	readonly telemetryUser?: TelemetryUser;
}) {
	const [queryClient] = useState(() => new QueryClient());

	useEffect(() => {
		if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
			synchronizePostHogIdentity(posthog, telemetryUser);
		}
	}, [telemetryUser]);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
