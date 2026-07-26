import * as PgClient from "@effect/sql-pg/PgClient";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { Config, Context, Layer, Redacted, Schema } from "effect";
import { isDatabaseUrl, requireDatabaseUrl } from "./database-url.ts";

export const DATABASE_POOL_MAX = 5;
export const DATABASE_CONNECT_TIMEOUT_MS = 5_000;
export const DATABASE_IDLE_TIMEOUT_MS = 30_000;

export type DatabaseClient = PgDrizzle.EffectPgDatabase & {
	readonly $client: PgClient.PgClient;
};

export class Database extends Context.Service<Database, DatabaseClient>()(
	"app/Database",
) {}

const databaseUrl = Config.schema(
	Schema.Redacted(Schema.String).pipe(
		Schema.check(
			Schema.makeFilter((value) => isDatabaseUrl(Redacted.value(value)), {
				expected: "a PostgreSQL connection URL",
			}),
		),
	),
	"DATABASE_URL",
);

const PgClientLive = PgClient.layerConfig({
	url: databaseUrl,
	maxConnections: Config.succeed(DATABASE_POOL_MAX),
	connectTimeout: Config.succeed(DATABASE_CONNECT_TIMEOUT_MS),
	idleTimeout: Config.succeed(DATABASE_IDLE_TIMEOUT_MS),
});

export const DatabaseLive = Layer.effect(
	Database,
	PgDrizzle.makeWithDefaults(),
).pipe(Layer.provide(PgClientLive));

export function createDrizzleClient(databaseUrl: string) {
	return drizzle({
		connection: {
			connectionString: requireDatabaseUrl(databaseUrl),
			max: DATABASE_POOL_MAX,
			connectionTimeoutMillis: DATABASE_CONNECT_TIMEOUT_MS,
			idleTimeoutMillis: DATABASE_IDLE_TIMEOUT_MS,
		},
	});
}
