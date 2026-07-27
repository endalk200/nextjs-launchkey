"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

type TelemetryUser = {
	readonly email: string;
	readonly id: string;
};

export function Providers({
	children,
	telemetryUser,
}: {
	readonly children: React.ReactNode;
	readonly telemetryUser?: TelemetryUser;
}) {
	const [queryClient] = useState(() => new QueryClient());

	useEffect(() => {
		if (telemetryUser && process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
			posthog.identify(telemetryUser.id, { email: telemetryUser.email });
		}
	}, [telemetryUser]);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
