"use client";

import { useForm } from "@tanstack/react-form";
import { authClient } from "../client/client.ts";
import { AuthForm } from "./auth-form.tsx";
import { TextField } from "./text-field.tsx";
import type { AuthActionResult, ResetPasswordInput } from "./types.ts";
import { useAuthAction } from "./use-auth-action.ts";
import { passwordField, resetPasswordSchema } from "./validation.ts";

export function ResetPasswordForm({
	token,
	onSuccess,
	resetPassword = (input) => authClient.resetPassword(input),
}: {
	readonly token: string;
	readonly onSuccess?: () => void;
	readonly resetPassword?: (
		input: ResetPasswordInput,
	) => Promise<AuthActionResult>;
}) {
	const action = useAuthAction();
	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onSubmit: resetPasswordSchema,
		},
		onSubmit: ({ value }) => {
			if (!token) {
				action.fail("Reset token is missing or invalid.");
				return;
			}

			return action.run({
				perform: () =>
					resetPassword({
						token,
						newPassword: value.password,
					}),
				successMessage:
					"Password updated. You can sign in with the new password.",
				onSuccess,
			});
		},
	});

	return (
		<AuthForm
			action={action}
			submitLabel="Update password"
			onSubmit={() => form.handleSubmit()}
		>
			<form.Field name="password" validators={{ onBlur: passwordField }}>
				{(field) => (
					<TextField
						field={field}
						label="New password"
						type="password"
						autoComplete="new-password"
						testId="reset-password-input"
					/>
				)}
			</form.Field>

			<form.Field name="confirmPassword">
				{(field) => (
					<TextField
						field={field}
						label="Confirm password"
						type="password"
						autoComplete="new-password"
						testId="reset-confirm-password-input"
					/>
				)}
			</form.Field>
		</AuthForm>
	);
}
