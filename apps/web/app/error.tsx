"use client";

import { Button } from "@app/ui/components/button";
import posthog from "posthog-js";
import { useEffect } from "react";

export default function ErrorBoundary({
	error,
	reset,
}: {
	readonly error: Error & { digest?: string };
	readonly reset: () => void;
}) {
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
			posthog.captureException(error, {
				error_boundary: "app",
				nextjs_digest: error.digest,
			});
		}
	}, [error]);

	return (
		<main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6">
			<h1 className="text-2xl font-semibold">Something went wrong</h1>
			<p>Please try again. If the problem continues, we have been notified.</p>
			<Button type="button" onClick={reset}>
				Try again
			</Button>
		</main>
	);
}
