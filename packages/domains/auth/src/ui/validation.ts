import { Schema } from "effect";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const email = Schema.String.check(
	Schema.makeFilter(
		(value: string) => value.trim().length > 0 || "Email is required.",
	),
	Schema.makeFilter(
		(value: string) =>
			EMAIL_PATTERN.test(value.trim()) || "Enter a valid email.",
	),
);

const name = Schema.String.check(
	Schema.makeFilter(
		(value: string) => value.trim().length > 0 || "Name is required.",
	),
);

const password = Schema.String.check(
	Schema.makeFilter(
		(value: string) =>
			value.length >= 8 || "Password must be at least 8 characters.",
	),
);

const requiredPassword = Schema.String.check(
	Schema.makeFilter(
		(value: string) => value.length > 0 || "Password is required.",
	),
);

const confirmPassword = Schema.String.check(
	Schema.makeFilter(
		(value: string) => value.length > 0 || "Confirm your password.",
	),
);

/** Cross-field check surfacing a mismatch on the confirm-password field. */
function passwordsMatch<
	T extends { readonly password: string; readonly confirmPassword: string },
>(value: T) {
	return value.password === value.confirmPassword
		? undefined
		: { path: ["confirmPassword"], issue: "Passwords must match." };
}

export const emailField = Schema.toStandardSchemaV1(email);
export const nameField = Schema.toStandardSchemaV1(name);
export const passwordField = Schema.toStandardSchemaV1(password);

export const signInSchema = Schema.toStandardSchemaV1(
	Schema.Struct({ email, password: requiredPassword }),
);

export const signUpSchema = Schema.toStandardSchemaV1(
	Schema.Struct({ name, email, password, confirmPassword }).check(
		Schema.makeFilter(passwordsMatch),
	),
);

export const forgotPasswordSchema = Schema.toStandardSchemaV1(
	Schema.Struct({ email }),
);

export const resetPasswordSchema = Schema.toStandardSchemaV1(
	Schema.Struct({ password, confirmPassword }).check(
		Schema.makeFilter(passwordsMatch),
	),
);
