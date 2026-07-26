import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		exclude: [...defaultExclude, "src/test/**"],
		include: ["src/**/*.test.ts"],
	},
});
