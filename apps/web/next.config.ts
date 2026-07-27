import "@app/config/env";
import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";

const postHogProxyPath = "/insights";

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				destination: "https://us-assets.i.posthog.com/static/:path*",
				source: `${postHogProxyPath}/static/:path*`,
			},
			{
				destination: "https://us-assets.i.posthog.com/array/:path*",
				source: `${postHogProxyPath}/array/:path*`,
			},
			{
				destination: "https://us.i.posthog.com/:path*",
				source: `${postHogProxyPath}/:path*`,
			},
		];
	},
	skipTrailingSlashRedirect: true,
};

const personalApiKey = process.env.POSTHOG_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;
const releaseVersion =
	process.env.POSTHOG_RELEASE_VERSION ??
	process.env.VERCEL_GIT_COMMIT_SHA ??
	process.env.GITHUB_SHA;
const sourceMapsExplicitlyEnabled =
	process.env.POSTHOG_SOURCE_MAPS_ENABLED === "true";

if (sourceMapsExplicitlyEnabled && (!personalApiKey || !projectId)) {
	throw new Error(
		"POSTHOG_SOURCE_MAPS_ENABLED=true requires POSTHOG_API_KEY and POSTHOG_PROJECT_ID.",
	);
}

export default personalApiKey && projectId
	? withPostHogConfig(nextConfig, {
			host: process.env.POSTHOG_UI_HOST ?? "https://us.posthog.com",
			personalApiKey,
			projectId,
			sourcemaps: {
				deleteAfterUpload: true,
				enabled:
					process.env.NODE_ENV === "production" &&
					process.env.POSTHOG_SOURCE_MAPS_ENABLED !== "false",
				releaseName: "nextjs-launchkey-web",
				releaseVersion,
			},
		})
	: nextConfig;
