import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["**/*.integration.test.ts", "**/*.integration.test.tsx"],
		testTimeout: 120_000,
		hookTimeout: 120_000,
	},
});
