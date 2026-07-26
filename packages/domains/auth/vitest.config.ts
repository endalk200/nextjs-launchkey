import react from "@vitejs/plugin-react";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		exclude: [...defaultExclude, "src/test/**"],
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		setupFiles: ["./src/utils/test-setup.ts"],
	},
});
