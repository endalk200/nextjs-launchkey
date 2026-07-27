"use client";

import { Button } from "@app/ui/components/button";
import { FieldGroup } from "@app/ui/components/field";
import type { ReactNode } from "react";
import type { AuthActionState } from "./use-auth-action.ts";

export function StatusMessage({
	message,
	tone,
}: {
	readonly message: string | null;
	readonly tone: "error" | "success";
}) {
	if (!message) {
		return null;
	}

	return (
		<p
			className={
				tone === "error"
					? "text-sm text-destructive"
					: "text-sm text-muted-foreground"
			}
			role={tone === "error" ? "alert" : "status"}
		>
			{message}
		</p>
	);
}

/**
 * Shared shell for the auth forms: fields, action status messages, and the
 * submit button in the standard layout.
 */
export function AuthForm({
	action,
	children,
	onSubmit,
	submitLabel,
}: {
	readonly action: AuthActionState;
	readonly children: ReactNode;
	readonly onSubmit: () => void;
	readonly submitLabel: string;
}) {
	return (
		<form
			className="flex w-full max-w-sm flex-col gap-5"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				onSubmit();
			}}
		>
			<FieldGroup>{children}</FieldGroup>

			<StatusMessage message={action.error} tone="error" />
			<StatusMessage message={action.status} tone="success" />
			<Button type="submit" disabled={action.isPending}>
				{action.isPending ? "Submitting" : submitLabel}
			</Button>
		</form>
	);
}
