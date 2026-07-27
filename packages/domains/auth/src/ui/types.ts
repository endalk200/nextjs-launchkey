/**
 * Result and input shapes shared by the auth form components.
 *
 * The action types intentionally describe only what the forms consume from
 * the Better Auth client responses, so tests and stories can provide simple
 * fakes without depending on the client types.
 */

export type AuthError = {
	readonly message?: string;
	readonly statusText?: string;
} | null;

export type AuthActionResult = {
	readonly error?: AuthError;
};

export type SignInInput = {
	readonly email: string;
	readonly password: string;
	readonly callbackURL?: string;
};

export type SignUpInput = {
	readonly name: string;
	readonly email: string;
	readonly password: string;
	readonly callbackURL?: string;
};

export type ForgotPasswordInput = {
	readonly email: string;
	readonly redirectTo: string;
};

export type ResetPasswordInput = {
	readonly token: string;
	readonly newPassword: string;
};
