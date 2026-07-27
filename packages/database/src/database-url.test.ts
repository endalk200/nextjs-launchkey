import { describe, expect, it } from "vitest";
import {
	DatabaseUrlError,
	isDatabaseUrl,
	parseDatabaseUrl,
	requireDatabaseUrl,
} from "./database-url.ts";

describe("database URL validation", () => {
	it.each([
		undefined,
		"",
		"not a url",
		"mysql://user:password@localhost:3306/app",
		"postgresql://localhost",
		" postgresql://user:password@localhost:5432/app",
		"postgresql://user:password@localhost:5432/app ",
	])("rejects an unsafe DATABASE_URL value: %s", (value) => {
		expect(() => requireDatabaseUrl(value)).toThrow(DatabaseUrlError);
		expect(isDatabaseUrl(value)).toBe(false);
	});

	it.each([
		"postgres://user:password@localhost:5432/app",
		"postgresql://user:password@db.example.com/app?sslmode=require",
	])("accepts PostgreSQL connection URLs: %s", (value) => {
		expect(requireDatabaseUrl(value)).toBe(value);
		expect(isDatabaseUrl(value)).toBe(true);
		expect(parseDatabaseUrl(value).protocol).toMatch(/^postgres(?:ql)?:$/);
	});

	it("does not include database credentials in validation errors", () => {
		const password = "do-not-leak";

		expect(() =>
			requireDatabaseUrl(`mysql://user:${password}@localhost:3306/app`),
		).toThrowError(expect.not.stringContaining(password));
	});
});
