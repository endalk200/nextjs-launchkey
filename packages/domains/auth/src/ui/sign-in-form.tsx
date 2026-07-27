"use client";

import { useForm } from "@tanstack/react-form";
import { authClient } from "../client/client.ts";
import { AuthForm } from "./auth-form.tsx";
import { TextField } from "./text-field.tsx";
import type { AuthActionResult, SignInInput } from "./types.ts";
import { useAuthAction } from "./use-auth-action.ts";
import { emailField, signInSchema } from "./validation.ts";

export function SignInForm({
	callbackURL = "/",
	onSuccess,
	signIn = (input) => authClient.signIn.email(input),
}: {
	readonly callbackURL?: string;
	readonly onSuccess?: () => void;
	readonly signIn?: (input: SignInInput) => Promise<AuthActionResult>;
}) {
	const action = useAuthAction();
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: signInSchema,
		},
		onSubmit: ({ value }) =>
			action.run({
				perform: () =>
					signIn({
						email: value.email.trim(),
						password: value.password,
						callbackURL,
					}),
				successMessage: "Signed in.",
				onSuccess,
			}),
	});

	return (
		<AuthForm
			action={action}
			submitLabel="Sign in"
			onSubmit={() => form.handleSubmit()}
		>
			<form.Field name="email" validators={{ onBlur: emailField }}>
				{(field) => (
					<TextField
						field={field}
						label="Email"
						type="email"
						autoComplete="email"
						testId="sign-in-email-input"
					/>
				)}
			</form.Field>

			<form.Field name="password">
				{(field) => (
					<TextField
						field={field}
						label="Password"
						type="password"
						autoComplete="current-password"
						testId="sign-in-password-input"
					/>
				)}
			</form.Field>
		</AuthForm>
	);
}
