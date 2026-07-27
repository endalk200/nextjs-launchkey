import { assert, describe, it } from "@effect/vitest";
import { EffectDrizzleQueryError } from "drizzle-orm/effect-core";
import { Cause, ConfigProvider, Effect } from "effect";
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
			const error = yield* Database.pipe(
				Effect.provide(DatabaseLive),
				Effect.provideService(
					ConfigProvider.ConfigProvider,
					ConfigProvider.fromEnv({ env: {} }),
				),
				Effect.flip,
			);

			assert.strictEqual(error._tag, "ConfigError");
		}),
	);

	it.effect("redacts invalid DATABASE_URL values", () =>
		Effect.gen(function* () {
			const password = "do-not-leak";
			const error = yield* Database.pipe(
				Effect.provide(DatabaseLive),
				Effect.provideService(
					ConfigProvider.ConfigProvider,
					ConfigProvider.fromEnv({
						env: {
							DATABASE_URL: `mysql://user:${password}@localhost:3306/app`,
						},
					}),
				),
				Effect.flip,
			);

			assert.strictEqual(error._tag, "ConfigError");
			assert.notInclude(String(error), password);
			assert.include(String(error), "<redacted>");
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
