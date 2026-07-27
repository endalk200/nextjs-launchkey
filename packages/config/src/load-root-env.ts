import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnvFile } from "dotenv";

const packageDirectory = dirname(fileURLToPath(import.meta.url));

/**
 * The only supported local environment file.
 *
 * dotenv does not overwrite variables that are already present, so deployment
 * and CI environments always take precedence over local file values.
 */
export const rootEnvFile = join(packageDirectory, "../../../.env");

let loaded = false;

export function loadRootEnv(): void {
	if (loaded) {
		return;
	}

	loadEnvFile({ path: rootEnvFile, quiet: true });
	loaded = true;
}
