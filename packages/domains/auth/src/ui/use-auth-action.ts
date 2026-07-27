"use client";

import { useState } from "react";
import type { AuthActionResult, AuthError } from "./types.ts";

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

function messageFromError(error: AuthError) {
	return error?.message ?? error?.statusText ?? FALLBACK_ERROR_MESSAGE;
}

export type AuthActionState = {
	readonly status: string | null;
	readonly error: string | null;
	readonly isPending: boolean;
};

/**
 * Shared submit-state handling for the auth forms: tracks pending/status/error
 * state around a Better Auth client call and reports failures as messages
 * instead of letting rejections escape the form submit handler.
 */
export function useAuthAction() {
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	async function run({
		perform,
		successMessage,
		onSuccess,
	}: {
		readonly perform: () => Promise<AuthActionResult>;
		readonly successMessage: string;
		readonly onSuccess?: () => void;
	}) {
		setError(null);
		setStatus(null);
		setIsPending(true);

		try {
			const result = await perform();

			if (result.error) {
				setError(messageFromError(result.error));
				return;
			}

			setStatus(successMessage);
			onSuccess?.();
		} catch {
			setError(FALLBACK_ERROR_MESSAGE);
		} finally {
			setIsPending(false);
		}
	}

	function fail(message: string) {
		setStatus(null);
		setError(message);
	}

	return { status, error, isPending, run, fail };
}
