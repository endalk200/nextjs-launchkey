import { describe, expect, it } from "vitest";
import { getExceptionAttributes } from "./logger.node";

describe("getExceptionAttributes", () => {
	it("preserves structured Error details for OTLP logs", () => {
		const error = new TypeError("Invalid post");

		expect(getExceptionAttributes(error)).toMatchObject({
			"exception.message": "Invalid post",
			"exception.type": "TypeError",
		});
		expect(getExceptionAttributes(error)["exception.stacktrace"]).toContain(
			"TypeError: Invalid post",
		);
	});

	it("describes non-Error defects", () => {
		expect(getExceptionAttributes("unexpected defect")).toEqual({
			"exception.message": "unexpected defect",
		});
	});
});
