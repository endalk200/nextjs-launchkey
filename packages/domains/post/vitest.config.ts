import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		exclude: ["**/*.int.test.ts", "**/*.int.test.tsx"],
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		setupFiles: ["./src/test/setup.ts"],
	},
});
