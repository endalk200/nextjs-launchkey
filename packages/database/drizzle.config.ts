import { defineConfig } from "drizzle-kit";

export const databaseArtifacts = {
	dialect: "postgresql",
	schema: "./src/schema.ts",
	out: "./drizzle",
} as const;

// Schema generation is deliberately offline. Commands that connect to a
// database use drizzle.migrate.config.ts, which requires DATABASE_URL.
export default defineConfig(databaseArtifacts);
