"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	readonly error: Error & { digest?: string };
	readonly reset: () => void;
}) {
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
			posthog.captureException(error, {
				error_boundary: "global",
				nextjs_digest: error.digest,
			});
		}
	}, [error]);

	return (
		<html lang="en">
			<body>
				<main>
					<h1>Something went wrong</h1>
					<p>
						Please try again. If the problem continues, we have been notified.
					</p>
					<button type="button" onClick={reset}>
						Try again
					</button>
				</main>
			</body>
		</html>
	);
}
