import { loadRootEnv } from "@app/config/load-root-env";
import { defineConfig, devices } from "@playwright/test";

loadRootEnv();

const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: [["list"], ["html", { open: "never" }]],
	outputDir: "test-results",
	use: {
		baseURL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	projects: [
		{
			name: "setup",
			testMatch: /.*\.setup\.ts/,
		},
		{
			name: "chromium",
			testMatch: /.*\.e2e\.tsx?/,
			use: {
				...devices["Desktop Chrome"],
				storageState: "test-results/.auth/user.json",
			},
			dependencies: ["setup"],
		},
	],
	webServer: {
		command: "bun run start --port 3000",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
