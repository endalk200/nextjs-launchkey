import { ROOT_CONTEXT, SpanKind } from "@opentelemetry/api";
import { SamplingDecision } from "@opentelemetry/sdk-trace-base";
import { describe, expect, it } from "vitest";
import { makeRootSampler, sanitizeHttpAttributes } from "./otel.node.ts";

const traceId = "0123456789abcdef0123456789abcdef";

function sample(
	sampler: ReturnType<typeof makeRootSampler>,
	attributes: Record<string, string> = {},
) {
	return sampler.shouldSample(
		ROOT_CONTEXT,
		traceId,
		"request",
		SpanKind.SERVER,
		attributes,
		[],
	).decision;
}

describe("makeRootSampler", () => {
	it("supports the standard ratio sampler", () => {
		expect(sample(makeRootSampler("parentbased_traceidratio", "0"))).toBe(
			SamplingDecision.NOT_RECORD,
		);
		expect(sample(makeRootSampler("parentbased_traceidratio", "1"))).toBe(
			SamplingDecision.RECORD_AND_SAMPLED,
		);
	});

	it.each([
		"/_next/static/chunk.js",
		"/insights/e",
	])("drops noisy root %s before export", (target) => {
		expect(
			sample(makeRootSampler("always_on"), {
				"http.target": target,
			}),
		).toBe(SamplingDecision.NOT_RECORD);
	});
});

describe("sanitizeHttpAttributes", () => {
	it("removes query values and sensitive headers", () => {
		const attributes: Record<string, unknown> = {
			"http.request.header.authorization": ["Bearer secret"],
			"http.request.header.x-posthog-session-id": ["session-123"],
			"http.request.header.x-safe": ["safe"],
			"http.target": "/reset-password?token=secret",
			"url.full": "https://example.com/reset-password?token=secret#section",
			"url.query": "token=secret",
		};

		sanitizeHttpAttributes(attributes);

		expect(attributes).toEqual({
			"http.request.header.x-safe": ["safe"],
			"http.target": "/reset-password",
			"url.full": "https://example.com/reset-password",
		});
	});
});
