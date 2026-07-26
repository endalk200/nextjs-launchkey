import { createNodeDrizzleClient, sql } from "@app/database";
import {
	account,
	authSchema,
	session,
	user,
	verification,
} from "@app/database/schema";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { betterAuth } from "better-auth/minimal";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let container: StartedPostgreSqlContainer;
let database: ReturnType<typeof createNodeDrizzleClient>;

const rootDirectory = fileURLToPath(new URL("../../../../..", import.meta.url));
const authSecret = "better-auth-drizzle-integration-test-secret";

function migrate(databaseUrl: string) {
	execFileSync("bun", ["--filter", "@app/database", "db:migrate:deploy"], {
		cwd: rootDirectory,
		env: { ...process.env, DATABASE_URL: databaseUrl },
		stdio: "inherit",
	});
}

function assertDockerRuntime() {
	try {
		execFileSync("docker", ["info"], { stdio: "ignore" });
	} catch (cause) {
		throw new Error("Docker is required to run auth integration tests.", {
			cause,
		});
	}
}

describe("Better Auth Drizzle integration", () => {
	beforeAll(async () => {
		assertDockerRuntime();

		container = await new PostgreSqlContainer("postgres:17-alpine")
			.withDatabase("launchkey_auth_test")
			.withUsername("launchkey")
			.withPassword("launchkey")
			.start();

		const databaseUrl = `${container.getConnectionUri()}?schema=public`;

		migrate(databaseUrl);

		database = createNodeDrizzleClient(databaseUrl);
	});

	afterAll(async () => {
		await database?.$client.end();
		await container?.stop();
	});

	beforeEach(async () => {
		await database.execute(
			sql`TRUNCATE TABLE "verification", "account", "session", "user" CASCADE`,
		);
	});

	it("persists every core auth model using the generated Better Auth schema", async () => {
		let emailVerificationToken: string | undefined;
		let passwordResetToken: string | undefined;

		const testAuth = betterAuth({
			database: drizzleAdapter(database, {
				provider: "pg",
				schema: authSchema,
				camelCase: true,
				transaction: true,
			}),
			baseURL: "http://127.0.0.1:3000",
			secret: authSecret,
			emailAndPassword: {
				enabled: true,
				requireEmailVerification: true,
				sendResetPassword: async ({ token }) => {
					passwordResetToken = token;
				},
			},
			emailVerification: {
				sendOnSignUp: true,
				autoSignInAfterVerification: true,
				sendVerificationEmail: async ({ token }) => {
					emailVerificationToken = token;
				},
			},
		});

		await testAuth.api.signUpEmail({
			body: {
				name: "Drizzle Auth User",
				email: "drizzle-auth@example.com",
				password: "correct horse battery staple",
			},
		});

		const [usersAfterSignUp, accountsAfterSignUp, sessionsAfterSignUp] =
			await Promise.all([
				database.select().from(user),
				database.select().from(account),
				database.select().from(session),
			]);

		expect(usersAfterSignUp).toHaveLength(1);
		expect(accountsAfterSignUp).toMatchObject([
			{
				issuer: "local:credential",
				providerAccountId: usersAfterSignUp[0]?.id,
				providerId: "credential",
				userId: usersAfterSignUp[0]?.id,
			},
		]);
		expect(sessionsAfterSignUp).toHaveLength(0);
		expect(emailVerificationToken).toBeDefined();

		await testAuth.api.verifyEmail({
			query: { token: emailVerificationToken ?? "" },
		});

		const [verifiedUsers, sessionsAfterVerification] = await Promise.all([
			database.select().from(user),
			database.select().from(session),
		]);

		expect(verifiedUsers[0]?.emailVerified).toBe(true);
		expect(sessionsAfterVerification).toHaveLength(1);

		await testAuth.api.requestPasswordReset({
			body: { email: "drizzle-auth@example.com" },
		});

		const verificationRows = await database.select().from(verification);

		expect(passwordResetToken).toBeDefined();
		expect(verificationRows).toMatchObject([
			{
				identifier: `reset-password:${passwordResetToken}`,
				value: usersAfterSignUp[0]?.id,
			},
		]);
		expect(verificationRows[0]?.createdAt).toBeInstanceOf(Date);
		expect(verificationRows[0]?.updatedAt).toBeInstanceOf(Date);
	});
});
