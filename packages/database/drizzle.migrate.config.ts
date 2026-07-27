import { loadRootEnv } from "@app/config/load-root-env";
import { defineConfig } from "drizzle-kit";
import { databaseArtifacts } from "./drizzle.config.ts";
import { requireDatabaseUrl } from "./src/database-url.ts";

loadRootEnv();

export default defineConfig({
	...databaseArtifacts,
	dbCredentials: {
		url: requireDatabaseUrl(process.env.DATABASE_URL),
	},
});
