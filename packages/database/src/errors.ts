import type { EffectDrizzleQueryError } from "drizzle-orm/effect-core";
import { Cause, Option } from "effect";
import { isSqlError, type SqlError } from "effect/unstable/sql/SqlError";

export type DatabaseError = EffectDrizzleQueryError | SqlError;

export function isRetryableDatabaseError(error: DatabaseError): boolean {
	if (isSqlError(error)) {
		return error.isRetryable;
	}

	if (!Cause.isCause(error.cause)) {
		return false;
	}

	const cause = Cause.findErrorOption(error.cause).pipe(Option.getOrUndefined);

	return isSqlError(cause) && cause.isRetryable;
}
