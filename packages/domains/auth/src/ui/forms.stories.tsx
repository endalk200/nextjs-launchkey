import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ForgotPasswordForm } from "./forgot-password-form.tsx";
import { ResetPasswordForm } from "./reset-password-form.tsx";
import { SignInForm } from "./sign-in-form.tsx";
import { SignOutButton } from "./sign-out-button.tsx";
import { SignUpForm } from "./sign-up-form.tsx";

const meta = {
	title: "Auth/Forms",
	parameters: {
		layout: "centered",
	},
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignIn = {
	render: () => <SignInForm signIn={async () => ({ error: null })} />,
} satisfies Story;

export const SignUp = {
	render: () => <SignUpForm signUp={async () => ({ error: null })} />,
} satisfies Story;

export const ForgotPassword = {
	render: () => (
		<ForgotPasswordForm
			redirectTo="/reset-password"
			requestPasswordReset={async () => ({ error: null })}
		/>
	),
} satisfies Story;

export const ResetPassword = {
	render: () => (
		<ResetPasswordForm
			token="storybook-token"
			resetPassword={async () => ({ error: null })}
		/>
	),
} satisfies Story;

export const SignOut = {
	render: () => <SignOutButton signOut={async () => ({ error: null })} />,
} satisfies Story;
