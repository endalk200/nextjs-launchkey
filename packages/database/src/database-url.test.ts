import { describe, expect, it } from "vitest";
import {
	DatabaseUrlError,
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
	])("rejects an unsafe DATABASE_URL value: %s", (value) => {
		expect(() => requireDatabaseUrl(value)).toThrow(DatabaseUrlError);
	});

	it.each([
		"postgres://user:password@localhost:5432/app",
		"postgresql://user:password@db.example.com/app?sslmode=require",
	])("accepts PostgreSQL connection URLs: %s", (value) => {
		expect(requireDatabaseUrl(value)).toBe(value);
		expect(parseDatabaseUrl(value).protocol).toMatch(/^postgres(?:ql)?:$/);
	});

	it("does not include database credentials in validation errors", () => {
		const password = "do-not-leak";

		expect(() =>
			requireDatabaseUrl(`mysql://user:${password}@localhost:3306/app`),
		).toThrowError(expect.not.stringContaining(password));
	});
});
