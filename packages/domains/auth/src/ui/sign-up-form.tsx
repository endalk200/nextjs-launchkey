"use client";

import { useForm } from "@tanstack/react-form";
import { authClient } from "../client/client.ts";
import { AuthForm } from "./auth-form.tsx";
import { TextField } from "./text-field.tsx";
import type { AuthActionResult, SignUpInput } from "./types.ts";
import { useAuthAction } from "./use-auth-action.ts";
import {
	emailField,
	nameField,
	passwordField,
	signUpSchema,
} from "./validation.ts";

export function SignUpForm({
	callbackURL = "/",
	onSuccess,
	signUp = (input) => authClient.signUp.email(input),
}: {
	readonly callbackURL?: string;
	readonly onSuccess?: () => void;
	readonly signUp?: (input: SignUpInput) => Promise<AuthActionResult>;
}) {
	const action = useAuthAction();
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validators: {
			onSubmit: signUpSchema,
		},
		onSubmit: ({ value }) =>
			action.run({
				perform: () =>
					signUp({
						name: value.name.trim(),
						email: value.email.trim(),
						password: value.password,
						callbackURL,
					}),
				successMessage: "Check your email to verify your account.",
				onSuccess,
			}),
	});

	return (
		<AuthForm
			action={action}
			submitLabel="Create account"
			onSubmit={() => form.handleSubmit()}
		>
			<form.Field name="name" validators={{ onBlur: nameField }}>
				{(field) => (
					<TextField
						field={field}
						label="Name"
						autoComplete="name"
						testId="sign-up-name-input"
					/>
				)}
			</form.Field>

			<form.Field name="email" validators={{ onBlur: emailField }}>
				{(field) => (
					<TextField
						field={field}
						label="Email"
						type="email"
						autoComplete="email"
						testId="sign-up-email-input"
					/>
				)}
			</form.Field>

			<form.Field name="password" validators={{ onBlur: passwordField }}>
				{(field) => (
					<TextField
						field={field}
						label="Password"
						type="password"
						autoComplete="new-password"
						testId="sign-up-password-input"
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
						testId="sign-up-confirm-password-input"
					/>
				)}
			</form.Field>
		</AuthForm>
	);
}
