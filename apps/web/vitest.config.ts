import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRootEnv } from "@app/config/load-root-env";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

loadRootEnv();

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));
const storybookConfigDir = path.join(dirname, ".storybook");

export default defineConfig({
	plugins: [react()],
	optimizeDeps: {
		include: ["@tanstack/react-query"],
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					exclude: ["e2e/**", "node_modules/**"],
				},
			},
			{
				extends: true,
				plugins: [
					storybookTest({
						configDir: storybookConfigDir,
						storybookScript: "bun run storybook -- --no-open",
					}),
				],
				test: {
					name: `storybook:${storybookConfigDir}`,
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: "chromium",
							},
						],
					},
				},
			},
		],
	},
});
