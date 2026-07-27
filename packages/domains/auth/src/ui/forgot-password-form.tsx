"use client";

import { useForm } from "@tanstack/react-form";
import { authClient } from "../client/client.ts";
import { AuthForm } from "./auth-form.tsx";
import { TextField } from "./text-field.tsx";
import type { AuthActionResult, ForgotPasswordInput } from "./types.ts";
import { useAuthAction } from "./use-auth-action.ts";
import { emailField, forgotPasswordSchema } from "./validation.ts";

export function ForgotPasswordForm({
	redirectTo,
	onSuccess,
	requestPasswordReset = (input) => authClient.requestPasswordReset(input),
}: {
	readonly redirectTo: string;
	readonly onSuccess?: () => void;
	readonly requestPasswordReset?: (
		input: ForgotPasswordInput,
	) => Promise<AuthActionResult>;
}) {
	const action = useAuthAction();
	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onSubmit: forgotPasswordSchema,
		},
		onSubmit: ({ value }) =>
			action.run({
				perform: () =>
					requestPasswordReset({
						email: value.email.trim(),
						redirectTo,
					}),
				successMessage: "If that account exists, a reset link is on its way.",
				onSuccess,
			}),
	});

	return (
		<AuthForm
			action={action}
			submitLabel="Send reset link"
			onSubmit={() => form.handleSubmit()}
		>
			<form.Field name="email" validators={{ onBlur: emailField }}>
				{(field) => (
					<TextField
						field={field}
						label="Email"
						type="email"
						autoComplete="email"
						testId="forgot-password-email-input"
					/>
				)}
			</form.Field>
		</AuthForm>
	);
}
