"use client";

import { SignOutButton } from "@app/auth/client";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

export function SignOutControl() {
	const router = useRouter();

	return (
		<SignOutButton
			onSignedOut={() => {
				if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
					posthog.reset();
				}
				router.push("/sign-in");
				router.refresh();
			}}
		/>
	);
}
