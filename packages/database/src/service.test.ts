import { assert, describe, it } from "@effect/vitest";
import { EffectDrizzleQueryError } from "drizzle-orm/effect-core";
import { Cause, Effect } from "effect";
import {
	ConnectionError,
	SqlError,
	UniqueViolation,
} from "effect/unstable/sql/SqlError";
import { isRetryableDatabaseError } from "./errors.ts";
import {
	DATABASE_CONNECTION_BUDGET,
	Database,
	DatabaseLive,
	EFFECT_DATABASE_POOL_MAX,
	NODE_DATABASE_POOL_MAX,
} from "./service.ts";

describe("DatabaseLive", () => {
	it("splits one process-wide connection budget across both database clients", () => {
		assert.strictEqual(
			EFFECT_DATABASE_POOL_MAX + NODE_DATABASE_POOL_MAX,
			DATABASE_CONNECTION_BUDGET,
		);
	});

	it.effect("requires DATABASE_URL", () =>
		Effect.gen(function* () {
			const originalDatabaseUrl = process.env.DATABASE_URL;
			delete process.env.DATABASE_URL;

			const error = yield* Database.pipe(
				Effect.provide(DatabaseLive),
				Effect.flip,
			);

			if (originalDatabaseUrl !== undefined) {
				process.env.DATABASE_URL = originalDatabaseUrl;
			}

			assert.strictEqual(error._tag, "ConfigError");
		}),
	);
});

describe("isRetryableDatabaseError", () => {
	it("uses Effect SQL retryability for direct transaction errors", () => {
		const error = new SqlError({
			reason: new ConnectionError({
				cause: new Error("database unavailable"),
			}),
		});

		assert.isTrue(isRetryableDatabaseError(error));
	});

	it("unwraps Effect SQL errors from Drizzle query errors", () => {
		const sqlError = new SqlError({
			reason: new ConnectionError({
				cause: new Error("database unavailable"),
			}),
		});
		const error = new EffectDrizzleQueryError({
			query: "select 1",
			params: [],
			cause: Cause.fail(sqlError),
		});

		assert.isTrue(isRetryableDatabaseError(error));
	});

	it("keeps non-retryable SQL classifications non-retryable", () => {
		const error = new SqlError({
			reason: new UniqueViolation({
				cause: new Error("duplicate"),
				constraint: "user_email_key",
			}),
		});

		assert.isFalse(isRetryableDatabaseError(error));
	});
});
