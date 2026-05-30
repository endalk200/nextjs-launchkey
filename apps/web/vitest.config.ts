import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		exclude: ["e2e/**", "node_modules/**"],
	},
});
