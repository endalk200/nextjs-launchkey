import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (projectToken) {
	posthog.init(projectToken, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/insights",
		capture_exceptions: true,
		defaults: "2026-05-30",
		person_profiles: "identified_only",
		session_recording: {
			// Start from a privacy-first baseline. Relax this to targeted
			// `ph-mask` regions only after reviewing real replay requirements.
			maskAllInputs: true,
			maskTextSelector: "*",
			recordBody: false,
			recordHeaders: false,
		},
		tracing_headers: [window.location.hostname],
		ui_host:
			process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ?? "https://us.posthog.com",
	});
}
