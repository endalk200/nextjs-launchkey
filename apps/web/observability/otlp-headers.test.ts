import { describe, expect, it } from "vitest";
import { parseOtlpHeaders } from "./otlp-headers.ts";

describe("parseOtlpHeaders", () => {
	it("returns undefined for missing or blank input", () => {
		expect(parseOtlpHeaders(undefined)).toBeUndefined();
		expect(parseOtlpHeaders("")).toBeUndefined();
		expect(parseOtlpHeaders("   ")).toBeUndefined();
	});

	it("parses a single Authorization pair with '=' and spaces in the value", () => {
		expect(parseOtlpHeaders("Authorization=Bearer phc_abc123")).toEqual({
			Authorization: "Bearer phc_abc123",
		});
	});

	it("keeps '=' characters inside the value", () => {
		expect(parseOtlpHeaders("X-Token=a=b=c")).toEqual({ "X-Token": "a=b=c" });
	});

	it("parses multiple comma-separated pairs and trims whitespace", () => {
		expect(
			parseOtlpHeaders("Authorization=Bearer phc_abc, X-Tenant = acme"),
		).toEqual({
			Authorization: "Bearer phc_abc",
			"X-Tenant": "acme",
		});
	});

	it("skips malformed pairs but keeps valid ones", () => {
		expect(
			parseOtlpHeaders("no-separator,=missing-key,Empty=,Valid=yes"),
		).toEqual({ Valid: "yes" });
	});

	it("returns undefined when every pair is malformed", () => {
		expect(parseOtlpHeaders("no-separator,=nope,also-bad")).toBeUndefined();
	});
});
