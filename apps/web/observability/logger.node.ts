import { context, trace } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";

type ServerLogOptions = {
	readonly attributes?: Readonly<Record<string, unknown>>;
	readonly body: string;
	readonly error?: unknown;
	readonly severity?: "error" | "info" | "warn";
};

export function getExceptionAttributes(error: unknown): Record<string, string> {
	if (!(error instanceof Error)) {
		return { "exception.message": String(error) };
	}

	return {
		"exception.message": error.message,
		"exception.type": error.name,
		...(error.stack ? { "exception.stacktrace": error.stack } : {}),
	};
}

const severities = {
	error: SeverityNumber.ERROR,
	info: SeverityNumber.INFO,
	warn: SeverityNumber.WARN,
} as const;

/**
 * Application logger for server code that does not run inside Effect. Effect
 * logs use OtelLogger directly; both paths share the same global provider.
 */
export function emitServerLog({
	attributes = {},
	body,
	error,
	severity = "info",
}: ServerLogOptions): void {
	const activeContext = context.active();
	const activeSpan = trace.getSpan(activeContext)?.spanContext();

	logs.getLogger("nextjs-launchkey-web").emit({
		attributes: {
			...attributes,
			...(error === undefined ? {} : getExceptionAttributes(error)),
			...(activeSpan
				? { spanId: activeSpan.spanId, traceId: activeSpan.traceId }
				: {}),
		},
		body,
		context: activeContext,
		...(error === undefined ? {} : { exception: error }),
		severityNumber: severities[severity],
		severityText: severity.toUpperCase(),
	});
}
