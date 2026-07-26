const postgresProtocols = new Set(["postgres:", "postgresql:"]);

export class DatabaseUrlError extends Error {
	override readonly name = "DatabaseUrlError";
}

export function parseDatabaseUrl(value: string): URL {
	if (value.trim().length === 0) {
		throw new DatabaseUrlError("DATABASE_URL is required");
	}

	let url: URL;

	try {
		url = new URL(value);
	} catch {
		throw new DatabaseUrlError("DATABASE_URL must be a valid URL");
	}

	if (!postgresProtocols.has(url.protocol)) {
		throw new DatabaseUrlError(
			"DATABASE_URL must use the postgres: or postgresql: protocol",
		);
	}

	if (url.hostname.length === 0 || url.pathname.length <= 1) {
		throw new DatabaseUrlError(
			"DATABASE_URL must include a hostname and database name",
		);
	}

	return url;
}

export function isDatabaseUrl(value: string): boolean {
	try {
		parseDatabaseUrl(value);
		return true;
	} catch {
		return false;
	}
}

export function requireDatabaseUrl(
	value: string | undefined = process.env.DATABASE_URL,
): string {
	if (value === undefined) {
		throw new DatabaseUrlError("DATABASE_URL is required");
	}

	parseDatabaseUrl(value);
	return value;
}
