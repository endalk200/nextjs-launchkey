"use client";

import { Button } from "@app/ui/components/button";
import { StatusMessage } from "./auth-form.tsx";
import { authClient } from "../client/client.ts";
import type { AuthActionResult } from "./types.ts";
import { useAuthAction } from "./use-auth-action.ts";

export function SignOutButton({
	onSignedOut,
	signOut = () => authClient.signOut(),
}: {
	readonly onSignedOut?: () => void;
	readonly signOut?: () => Promise<AuthActionResult>;
}) {
	const action = useAuthAction();

	return (
		<>
			<Button
				type="button"
				variant="outline"
				disabled={action.isPending}
				onClick={() =>
					action.run({
						perform: signOut,
						successMessage: "Signed out.",
						onSuccess: onSignedOut,
					})
				}
			>
				Sign out
			</Button>
			<StatusMessage message={action.error} tone="error" />
		</>
	);
}
