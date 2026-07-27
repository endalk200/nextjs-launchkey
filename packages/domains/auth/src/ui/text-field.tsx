"use client";

import { Field, FieldError, FieldLabel } from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";

/**
 * The subset of the tanstack-form field API consumed by {@link TextField}.
 *
 * Typed structurally so the component stays decoupled from tanstack-form's
 * generics while remaining assignable from any string-valued field.
 */
export type TextFieldControl = {
	readonly name: string;
	readonly state: {
		readonly value: string;
		readonly meta: {
			readonly isTouched: boolean;
			readonly errors: ReadonlyArray<unknown>;
		};
	};
	readonly handleBlur: () => void;
	readonly handleChange: (value: string) => void;
};

function fieldErrors(errors: ReadonlyArray<unknown>) {
	return errors.map((error) => {
		if (typeof error === "string") {
			return { message: error };
		}

		if (
			typeof error === "object" &&
			error !== null &&
			"message" in error &&
			typeof error.message === "string"
		) {
			return { message: error.message };
		}

		return { message: "Invalid value." };
	});
}

export function TextField({
	field,
	label,
	type = "text",
	autoComplete,
	testId,
}: {
	readonly field: TextFieldControl;
	readonly label: string;
	readonly type?: "text" | "email" | "password";
	readonly autoComplete?: string;
	readonly testId: string;
}) {
	const errors = field.state.meta.isTouched
		? fieldErrors(field.state.meta.errors)
		: [];
	const isInvalid = errors.length > 0;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				name={field.name}
				type={type}
				autoComplete={autoComplete}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(event) => field.handleChange(event.target.value)}
				aria-invalid={isInvalid}
				data-testid={testId}
			/>
			<FieldError errors={errors} />
		</Field>
	);
}
