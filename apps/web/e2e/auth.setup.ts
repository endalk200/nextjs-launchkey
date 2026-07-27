import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRootEnv } from "@app/config/load-root-env";
import { createNodeDrizzleClient, like } from "@app/database";
import { user as userTable } from "@app/database/schema";
import { test as setup } from "@playwright/test";

const authFile = fileURLToPath(
	new URL("../test-results/.auth/user.json", import.meta.url),
);
const signOutAuthFile = fileURLToPath(
	new URL("../test-results/.auth/sign-out-user.json", import.meta.url),
);
loadRootEnv();

setup("authenticate", async ({ baseURL, browser }) => {
	const { createTestAuth } = await import("@app/auth/testing/e2e");
	const testAuth = createTestAuth();
	const authContext = await testAuth.$context;
	const cookieDomain = new URL(baseURL ?? "http://127.0.0.1:3000").hostname;

	try {
		await cleanupOldE2eUsers();

		for (const [suffix, path] of [
			["user", authFile],
			["sign-out", signOutAuthFile],
		] as const) {
			const id = `e2e-${suffix}-${Date.now()}`;
			const user = authContext.test.createUser({
				id,
				email: `${id}@example.com`,
				name: "Playwright User",
				emailVerified: true,
			});

			await authContext.test.saveUser(user);

			const cookies = await authContext.test.getCookies({
				userId: user.id,
				domain: cookieDomain,
			});
			const context = await browser.newContext();

			try {
				await context.addCookies(
					cookies.map((cookie) => ({
						...cookie,
						domain: cookieDomain,
						path: cookie.path || "/",
						sameSite: cookie.sameSite ?? "Lax",
					})),
				);

				await mkdir(dirname(path), { recursive: true });
				await context.storageState({ path });
			} finally {
				await context.close();
			}
		}
	} catch (error) {
		throw new Error(
			[
				"Could not create the Better Auth e2e users.",
				"Make sure the e2e Postgres database is running and migrations have been applied.",
				`Original error: ${describeError(error)}`,
			].join("\n"),
			{ cause: error },
		);
	}
});

async function cleanupOldE2eUsers() {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		return;
	}

	const database = createNodeDrizzleClient(databaseUrl);

	try {
		await database.delete(userTable).where(like(userTable.email, "e2e-%"));
	} finally {
		await database.$client.end();
	}
}

function describeError(error: unknown) {
	if (!(error instanceof Error)) {
		return String(error);
	}

	const details: string[] = [error.message.trim()];

	if ("code" in error && typeof error.code === "string") {
		details.push(`code=${error.code}`);
	}

	if ("meta" in error && error.meta !== undefined) {
		details.push(`meta=${JSON.stringify(error.meta)}`);
	}

	return details.filter(Boolean).join(" ");
}
