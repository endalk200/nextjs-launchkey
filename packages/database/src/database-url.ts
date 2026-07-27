import { Config, Schema } from "effect";

const postgresProtocols = new Set(["postgres:", "postgresql:"]);

export class DatabaseUrlError extends Error {
	override readonly name = "DatabaseUrlError";
}

function isPostgresConnectionUrl(value: string): boolean {
	if (value.length === 0 || value.trim() !== value) {
		return false;
	}

	let url: URL;

	try {
		url = new URL(value);
	} catch {
		return false;
	}

	if (!postgresProtocols.has(url.protocol)) {
		return false;
	}

	if (url.hostname.length === 0 || url.pathname.length <= 1) {
		return false;
	}

	return true;
}

export const DatabaseUrlSchema = Schema.String.pipe(
	Schema.check(
		Schema.makeFilter(isPostgresConnectionUrl, {
			expected: "a PostgreSQL connection URL with a hostname and database name",
		}),
	),
	Schema.brand("DatabaseUrl"),
);

export type DatabaseUrl = Schema.Schema.Type<typeof DatabaseUrlSchema>;

export const DatabaseUrlConfig = Config.schema(
	Schema.Redacted(DatabaseUrlSchema),
	"DATABASE_URL",
);

export const isDatabaseUrl = Schema.is(DatabaseUrlSchema);

const decodeDatabaseUrl = Schema.decodeUnknownSync(DatabaseUrlSchema);

export function requireDatabaseUrl(value: string | undefined): DatabaseUrl {
	if (value === undefined || value.trim().length === 0) {
		throw new DatabaseUrlError("DATABASE_URL is required");
	}

	try {
		return decodeDatabaseUrl(value);
	} catch {
		throw new DatabaseUrlError(
			"DATABASE_URL must be a PostgreSQL connection URL with a hostname and database name",
		);
	}
}

export function parseDatabaseUrl(value: string): URL {
	return new URL(requireDatabaseUrl(value));
}
