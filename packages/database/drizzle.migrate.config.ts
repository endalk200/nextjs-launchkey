import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { databaseArtifacts } from "./drizzle.config.ts";
import { requireDatabaseUrl } from "./src/database-url.ts";

export default defineConfig({
	...databaseArtifacts,
	dbCredentials: {
		url: requireDatabaseUrl(),
	},
});
