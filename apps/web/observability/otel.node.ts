import * as OtelLogger from "@effect/opentelemetry/OtelLogger";
import * as OtelTracer from "@effect/opentelemetry/OtelTracer";
import * as OtelResource from "@effect/opentelemetry/Resource";
import type { Attributes } from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
	BatchLogRecordProcessor,
	LoggerProvider,
} from "@opentelemetry/sdk-logs";
import {
	AlwaysOffSampler,
	AlwaysOnSampler,
	BatchSpanProcessor,
	ParentBasedSampler,
	type ReadableSpan,
	type Sampler,
	SamplingDecision,
	type SamplingResult,
	type SpanProcessor,
	TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions";
import { Layer, Logger } from "effect";
import { parseOtlpHeaders } from "./otlp-headers.ts";

const serviceName = process.env.OTEL_SERVICE_NAME ?? "nextjs-launchkey-web";
const serviceVersion =
	process.env.OTEL_SERVICE_VERSION ??
	process.env.POSTHOG_RELEASE_VERSION ??
	process.env.VERCEL_GIT_COMMIT_SHA ??
	process.env.GITHUB_SHA;
const otlpEndpoint =
	process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";

const exportBatchConfig = {
	exportTimeoutMillis: 5_000,
	maxExportBatchSize: 64,
	maxQueueSize: 512,
	scheduledDelayMillis: 250,
};

function appendOtlpPath(path: "v1/logs" | "v1/traces") {
	return new URL(
		path,
		otlpEndpoint.endsWith("/") ? otlpEndpoint : `${otlpEndpoint}/`,
	).toString();
}

const tracesUrl =
	process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? appendOtlpPath("v1/traces");
const logsUrl =
	process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ?? appendOtlpPath("v1/logs");

// `Key=Value,Key2=Value2` pairs, e.g. `Authorization=Bearer phc_xxx`.
const tracesHeaders = parseOtlpHeaders(
	process.env.OTEL_EXPORTER_OTLP_TRACES_HEADERS ??
		process.env.OTEL_EXPORTER_OTLP_TRACES_HEADER,
);
const logsHeaders = parseOtlpHeaders(
	process.env.OTEL_EXPORTER_OTLP_LOGS_HEADERS ??
		process.env.OTEL_EXPORTER_OTLP_LOGS_HEADER,
);

const resourceAttributes = {
	[ATTR_DEPLOYMENT_ENVIRONMENT_NAME]:
		process.env.OTEL_DEPLOYMENT_ENVIRONMENT ??
		process.env.VERCEL_ENV ??
		process.env.NODE_ENV ??
		"development",
};

const otelStateKey = Symbol.for("nextjs-launchkey.otel.state");

type OtelState = {
	readonly loggerProvider: LoggerProvider;
	readonly tracerProvider: NodeTracerProvider;
	registered: boolean;
	shutdown?: Promise<void>;
};

type GlobalWithOtelState = typeof globalThis & {
	[otelStateKey]?: OtelState;
};

/**
 * Requests that produce no observability value: Next.js static assets, HMR,
 * favicons, and the dev-server's npm version check. Matching root spans are
 * dropped, and because sampling is parent-based their children are dropped
 * with them.
 */
const noisyUrlPatterns = [
	/^\/_next\//,
	/^\/favicon\.ico/,
	/^\/__nextjs/,
	/^\/insights\//,
	/^https?:\/\/registry\.npmjs\.org\//,
];

function isNoisySpan(attributes: Attributes): boolean {
	const target = attributes["http.target"] ?? attributes["http.url"];
	return (
		typeof target === "string" &&
		noisyUrlPatterns.some((pattern) => pattern.test(target))
	);
}

class NoiseFilterSampler implements Sampler {
	constructor(private readonly delegate: Sampler) {}

	shouldSample(...args: Parameters<Sampler["shouldSample"]>): SamplingResult {
		const attributes = args[4];
		if (isNoisySpan(attributes)) {
			return { decision: SamplingDecision.NOT_RECORD };
		}
		return this.delegate.shouldSample(...args);
	}

	toString(): string {
		return `NoiseFilterSampler(${this.delegate.toString()})`;
	}
}

function readSampleRatio(value: string | undefined): number {
	if (value === undefined) {
		return 1;
	}

	const ratio = Number(value);

	return Number.isFinite(ratio) && ratio >= 0 && ratio <= 1 ? ratio : 1;
}

/**
 * Honors the standard OTel sampler variables while keeping parent decisions
 * intact across the Next -> Effect span boundary.
 */
export function makeRootSampler(
	name = process.env.OTEL_TRACES_SAMPLER,
	argument = process.env.OTEL_TRACES_SAMPLER_ARG,
): Sampler {
	switch (name) {
		case "always_off":
			return new ParentBasedSampler({
				root: new NoiseFilterSampler(new AlwaysOffSampler()),
			});
		case "traceidratio":
		case "parentbased_traceidratio":
			return new ParentBasedSampler({
				root: new NoiseFilterSampler(
					new TraceIdRatioBasedSampler(readSampleRatio(argument)),
				),
			});
		case "always_on":
		case "parentbased_always_on":
		case undefined:
			return new ParentBasedSampler({
				root: new NoiseFilterSampler(new AlwaysOnSampler()),
			});
		default:
			return new ParentBasedSampler({
				root: new NoiseFilterSampler(new AlwaysOnSampler()),
			});
	}
}

function stripQueryAndFragment(value: string): string {
	try {
		const url = new URL(value);
		url.hash = "";
		url.search = "";

		return url.toString();
	} catch {
		return value.split(/[?#]/, 1)[0] ?? value;
	}
}

export function sanitizeHttpAttributes(
	attributes: Record<string, unknown>,
): void {
	delete attributes["url.query"];

	for (const key of ["url.full", "http.url", "http.target"]) {
		const value = attributes[key];

		if (typeof value === "string") {
			attributes[key] = stripQueryAndFragment(value);
		}
	}

	for (const key of Object.keys(attributes)) {
		if (
			/^http\.(request|response)\.header\./.test(key) &&
			/(authorization|cookie|posthog|secret|token|x-api-key)/i.test(key)
		) {
			delete attributes[key];
		}
	}
}

/**
 * Effect beta.101 records full URLs and query strings on HTTP spans. Query
 * values commonly contain password reset tokens and search text, so sanitize
 * immediately before the exporter sees the span.
 */
class SensitiveHttpAttributeSanitizer implements SpanProcessor {
	onStart(): void {}

	onEnd(span: ReadableSpan): void {
		sanitizeHttpAttributes(span.attributes as Record<string, unknown>);
	}

	forceFlush(): Promise<void> {
		return Promise.resolve();
	}

	shutdown(): Promise<void> {
		return Promise.resolve();
	}
}

/**
 * Renames the Next.js root server span for Effect API requests.
 *
 * Every request into the Effect catch-all route gets the root span name
 * `GET /api/[...path]`, which makes API traces indistinguishable in a trace
 * list. Effect's `HttpRouter` stamps the matched route template (for example
 * `/api/posts/:id`) as `http.route` on its own child span, so this processor
 * tracks root spans per trace and renames them once the Effect span reports
 * the concrete route.
 *
 * Ordering note: the root span's `onEnd` fires *before* the Effect span's
 * (Effect ends its bridged OTel span from a fiber after the response has been
 * returned), so the root is renamed by direct mutation after it has ended.
 * This is safe because the exporting {@link BatchSpanProcessor} holds the same
 * span instance until its scheduled flush.
 */
class ApiRouteRootSpanRenamer implements SpanProcessor {
	static readonly maxPendingRoots = 1_000;

	private readonly rootSpanByTrace = new Map<string, ReadableSpan>();

	onStart(span: ReadableSpan): void {
		if (span.attributes["next.span_type"] !== "BaseServer.handleRequest") {
			return;
		}

		if (this.rootSpanByTrace.size >= ApiRouteRootSpanRenamer.maxPendingRoots) {
			const oldest = this.rootSpanByTrace.keys().next().value;
			if (oldest !== undefined) {
				this.rootSpanByTrace.delete(oldest);
			}
		}

		this.rootSpanByTrace.set(span.spanContext().traceId, span);
	}

	onEnd(span: ReadableSpan): void {
		// Only Effect router spans carry the concrete route template; Next.js
		// spans (marked by next.span_type) only know the catch-all pattern.
		if (span.attributes["next.span_type"] !== undefined) {
			return;
		}

		const route = span.attributes["http.route"];

		if (typeof route !== "string" || !route.startsWith("/api/")) {
			return;
		}

		const traceId = span.spanContext().traceId;
		const rootSpan = this.rootSpanByTrace.get(traceId);

		if (rootSpan === undefined) {
			return;
		}

		this.rootSpanByTrace.delete(traceId);

		const method = rootSpan.attributes["http.method"];
		(rootSpan as { name: string }).name =
			typeof method === "string" ? `${method} ${route}` : route;
		rootSpan.attributes["http.route"] = route;
	}

	forceFlush(): Promise<void> {
		return Promise.resolve();
	}

	shutdown(): Promise<void> {
		this.rootSpanByTrace.clear();
		return Promise.resolve();
	}
}

/**
 * Registers the process-wide tracer provider used by both Next.js spans and
 * Effect spans (via {@link OtelLive}'s global tracer layer), so all traces
 * flow through a single provider and OTLP exporter.
 */
function makeOtelState(): OtelState {
	const resource = resourceFromAttributes(
		OtelResource.configToAttributes({
			serviceName,
			serviceVersion,
			attributes: resourceAttributes,
		}),
	);

	return {
		loggerProvider: new LoggerProvider({
			resource,
			processors: [
				new BatchLogRecordProcessor(
					new OTLPLogExporter({ url: logsUrl, headers: logsHeaders }),
					exportBatchConfig,
				),
			],
		}),
		tracerProvider: new NodeTracerProvider({
			resource,
			sampler: makeRootSampler(),
			spanProcessors: [
				new SensitiveHttpAttributeSanitizer(),
				new ApiRouteRootSpanRenamer(),
				new BatchSpanProcessor(
					new OTLPTraceExporter({ url: tracesUrl, headers: tracesHeaders }),
					exportBatchConfig,
				),
			],
		}),
		registered: false,
	};
}

const globalScope = globalThis as GlobalWithOtelState;

function getOtelState(): OtelState {
	const existing = globalScope[otelStateKey];

	if (existing) {
		return existing;
	}

	const state = makeOtelState();
	globalScope[otelStateKey] = state;

	return state;
}

const otelState = getOtelState();

export async function shutdownOtel(): Promise<void> {
	otelState.shutdown ??= Promise.allSettled([
		otelState.loggerProvider.forceFlush().then(() => {
			return otelState.loggerProvider.shutdown();
		}),
		otelState.tracerProvider.forceFlush().then(() => {
			return otelState.tracerProvider.shutdown();
		}),
	]).then(() => undefined);

	return otelState.shutdown;
}

export function registerNextOtel() {
	if (otelState.registered) {
		return;
	}

	otelState.tracerProvider.register();
	logs.setGlobalLoggerProvider(otelState.loggerProvider);
	otelState.registered = true;

	process.once("beforeExit", () => {
		void shutdownOtel();
	});
}

const LoggerProviderLive = Layer.succeed(
	OtelLogger.OtelLoggerProvider,
	otelState.loggerProvider,
);
const ResourceLive = OtelResource.layer({
	attributes: resourceAttributes,
	serviceName,
	serviceVersion,
});

/**
 * Effect ships with both its console logger and tracer logger installed. The
 * tracer logger mirrors every log into a span event, which duplicates the OTLP
 * log record in PostHog. Install an explicit console + OTLP set to retain local
 * output without creating that duplicate span event.
 */
const LoggerLive = Logger.layer([Logger.defaultLogger, OtelLogger.make]).pipe(
	Layer.provide(LoggerProviderLive),
);

/**
 * Effect telemetry layer backed by the global tracer provider registered in
 * {@link registerNextOtel}, plus an OTLP log exporter for Effect logs.
 */
export const OtelLive = Layer.mergeAll(OtelTracer.layerGlobal, LoggerLive).pipe(
	Layer.provide(ResourceLive),
	Layer.orDie,
);
