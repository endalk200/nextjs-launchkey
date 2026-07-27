import type { Instrumentation } from "next";

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		const { registerNextOtel } = await import("./observability/otel.node.ts");

		registerNextOtel();
	}
}

export const onRequestError: Instrumentation.onRequestError = async (
	error,
	request,
	context,
) => {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	const [
		{ emitServerLog },
		{ captureServerException },
		{ readPostHogRequestContext },
	] = await Promise.all([
		import("./observability/logger.node.ts"),
		import("./observability/posthog.node.ts"),
		import("./observability/request-context.ts"),
	]);
	const correlation = readPostHogRequestContext(request.headers);

	emitServerLog({
		attributes: {
			"http.request.method": request.method,
			"url.path": request.path.split(/[?#]/, 1)[0],
			...context,
			...(correlation.distinctId
				? { posthogDistinctId: correlation.distinctId }
				: {}),
			...(correlation.sessionId ? { sessionId: correlation.sessionId } : {}),
		},
		body: "Unhandled Next.js request error",
		error,
		severity: "error",
	});

	await captureServerException(error, {
		...correlation,
		method: request.method,
		path: request.path.split(/[?#]/, 1)[0],
		routerKind: context.routerKind,
		routePath: context.routePath,
		routeType: context.routeType,
	});
};
