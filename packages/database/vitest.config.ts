import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		exclude: ["src/test/**"],
		include: ["src/**/*.test.ts"],
	},
});
