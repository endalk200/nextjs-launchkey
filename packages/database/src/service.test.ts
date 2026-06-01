import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import {
	DatabaseConfigurationError,
	PrismaLive,
	PrismaService,
} from "./service.ts";

const originalDatabaseUrl = process.env.DATABASE_URL;

function acquirePrismaService() {
	return Effect.runPromise(Effect.provide(PrismaService, PrismaLive));
}

describe("PrismaLive", () => {
	afterEach(() => {
		if (originalDatabaseUrl === undefined) {
			delete process.env.DATABASE_URL;
		} else {
			process.env.DATABASE_URL = originalDatabaseUrl;
		}
	});

	it("fails when DATABASE_URL is missing", async () => {
		delete process.env.DATABASE_URL;

		await expect(acquirePrismaService()).rejects.toMatchObject({
			_tag: "DatabaseConfigurationError",
			message: "DATABASE_URL is required",
		});
	});

	it("fails when DATABASE_URL is not a valid URL", async () => {
		process.env.DATABASE_URL = "not-a-url";

		await expect(acquirePrismaService()).rejects.toMatchObject({
			_tag: "DatabaseConfigurationError",
			message: "DATABASE_URL must be a valid URL",
		});
	});

	it("fails when DATABASE_URL is not postgres", async () => {
		process.env.DATABASE_URL = "mysql://launchkey:launchkey@localhost:3306/app";

		await expect(acquirePrismaService()).rejects.toMatchObject({
			_tag: "DatabaseConfigurationError",
			message:
				"DATABASE_URL must use the postgresql:// or postgres:// protocol",
		});
	});

	it("preserves configuration failures as DatabaseConfigurationError", async () => {
		delete process.env.DATABASE_URL;

		await expect(acquirePrismaService()).rejects.toBeInstanceOf(
			DatabaseConfigurationError,
		);
	});
});
