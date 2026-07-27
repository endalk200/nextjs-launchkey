import * as PgClient from "@effect/sql-pg/PgClient";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { Config, Context, Layer } from "effect";
import { DatabaseUrlConfig, requireDatabaseUrl } from "./database-url.ts";

export const DATABASE_CONNECTION_BUDGET = 5;
export const EFFECT_DATABASE_POOL_MAX = 3;
export const NODE_DATABASE_POOL_MAX =
	DATABASE_CONNECTION_BUDGET - EFFECT_DATABASE_POOL_MAX;
export const DATABASE_CONNECT_TIMEOUT_MS = 5_000;
export const DATABASE_IDLE_TIMEOUT_MS = 30_000;

export type DatabaseClient = PgDrizzle.EffectPgDatabase & {
	readonly $client: PgClient.PgClient;
};

export class Database extends Context.Service<Database, DatabaseClient>()(
	"app/Database",
) {}

const PgClientLive = PgClient.layerConfig({
	url: DatabaseUrlConfig,
	maxConnections: Config.succeed(EFFECT_DATABASE_POOL_MAX),
	connectTimeout: Config.succeed(DATABASE_CONNECT_TIMEOUT_MS),
	idleTimeout: Config.succeed(DATABASE_IDLE_TIMEOUT_MS),
});

export const DatabaseLive = Layer.effect(
	Database,
	PgDrizzle.makeWithDefaults(),
).pipe(Layer.provide(PgClientLive));

export function createNodeDrizzleClient(databaseUrl: string) {
	return drizzle({
		connection: {
			connectionString: requireDatabaseUrl(databaseUrl),
			max: NODE_DATABASE_POOL_MAX,
			connectionTimeoutMillis: DATABASE_CONNECT_TIMEOUT_MS,
			idleTimeoutMillis: DATABASE_IDLE_TIMEOUT_MS,
		},
	});
}
