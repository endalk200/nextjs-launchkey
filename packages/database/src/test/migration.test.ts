import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let container: StartedPostgreSqlContainer;
let client: Client;

const rootDirectory = fileURLToPath(new URL("../../../../", import.meta.url));

function assertDockerRuntime() {
	try {
		execFileSync("docker", ["info"], { stdio: "ignore" });
	} catch (cause) {
		throw new Error(
			"Docker is required to run database migration integration tests.",
			{ cause },
		);
	}
}

function migrate(databaseUrl: string) {
	execFileSync("bun", ["--filter", "@app/database", "db:migrate:deploy"], {
		cwd: rootDirectory,
		env: { ...process.env, DATABASE_URL: databaseUrl },
		stdio: "inherit",
	});
}

describe("Drizzle baseline migration", () => {
	beforeAll(async () => {
		assertDockerRuntime();

		container = await new PostgreSqlContainer("postgres:17-alpine")
			.withDatabase("launchkey_migration_test")
			.withUsername("launchkey")
			.withPassword("launchkey")
			.start();

		client = new Client({ connectionString: container.getConnectionUri() });
		await client.connect();
	});

	afterAll(async () => {
		await client?.end();
		await container?.stop();
	});

	it("creates the application and Better Auth 1.7 schema once", async () => {
		const databaseUrl = `${container.getConnectionUri()}?schema=public`;

		migrate(databaseUrl);
		migrate(databaseUrl);

		const tables = await client.query<{ table_name: string }>(`
			SELECT table_name
			FROM information_schema.tables
			WHERE table_schema = 'public'
			ORDER BY table_name
		`);
		const accountIdentityColumns = await client.query<{
			column_name: string;
			is_nullable: "NO" | "YES";
		}>(`
			SELECT column_name, is_nullable
			FROM information_schema.columns
			WHERE table_schema = 'public'
				AND table_name = 'account'
				AND column_name IN ('accountId', 'issuer', 'providerAccountId')
			ORDER BY column_name
		`);
		const updatedAtDefaults = await client.query<{
			table_name: string;
			column_name: string;
			column_default: string | null;
		}>(`
			SELECT table_name, column_name, column_default
			FROM information_schema.columns
			WHERE table_schema = 'public'
				AND (
					(table_name = 'posts' AND column_name = 'updated_at')
					OR (
						table_name IN ('account', 'session', 'user', 'verification')
						AND column_name = 'updatedAt'
					)
				)
			ORDER BY table_name
		`);
		const insertedPost = await client.query<{
			id: string;
			has_timestamps: boolean;
		}>(`
			WITH inserted_user AS (
				INSERT INTO "user" ("id", "name", "email")
				VALUES ('migration-default-user', 'Migration User', 'migration@example.com')
				RETURNING "id"
			)
			INSERT INTO "posts" ("user_id", "title", "content")
			SELECT "id", 'Migration post', 'Database defaults' FROM inserted_user
			RETURNING
				"id",
				"created_at" IS NOT NULL AND "updated_at" IS NOT NULL AS has_timestamps
		`);
		const migrationCount = await client.query<{ count: number }>(
			`SELECT count(*)::int AS count FROM "drizzle"."__drizzle_migrations"`,
		);

		expect(tables.rows).toEqual([
			{ table_name: "account" },
			{ table_name: "posts" },
			{ table_name: "session" },
			{ table_name: "user" },
			{ table_name: "verification" },
		]);
		expect(accountIdentityColumns.rows).toEqual([
			{ column_name: "issuer", is_nullable: "NO" },
			{ column_name: "providerAccountId", is_nullable: "NO" },
		]);
		expect(updatedAtDefaults.rows).toEqual([
			{
				table_name: "account",
				column_name: "updatedAt",
				column_default: "now()",
			},
			{
				table_name: "posts",
				column_name: "updated_at",
				column_default: "now()",
			},
			{
				table_name: "session",
				column_name: "updatedAt",
				column_default: "now()",
			},
			{
				table_name: "user",
				column_name: "updatedAt",
				column_default: "now()",
			},
			{
				table_name: "verification",
				column_name: "updatedAt",
				column_default: "now()",
			},
		]);
		expect(insertedPost.rows).toEqual([
			{
				id: expect.stringMatching(/^[0-9a-f-]{36}$/),
				has_timestamps: true,
			},
		]);
		expect(migrationCount.rows).toEqual([{ count: 1 }]);
	});
});
