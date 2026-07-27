import { describe, expect, it } from "vitest";
import { readPostHogRequestContext } from "./request-context.ts";

describe("readPostHogRequestContext", () => {
	it("reads browser correlation headers", () => {
		expect(
			readPostHogRequestContext(
				new Headers({
					"x-posthog-distinct-id": "user-123",
					"x-posthog-session-id": "session-456",
					"x-posthog-window-id": "window-789",
				}),
			),
		).toEqual({
			distinctId: "user-123",
			sessionId: "session-456",
			windowId: "window-789",
		});
	});

	it("drops empty and unbounded values", () => {
		expect(
			readPostHogRequestContext({
				"x-posthog-distinct-id": " ",
				"x-posthog-session-id": "s".repeat(201),
			}),
		).toEqual({
			distinctId: undefined,
			sessionId: undefined,
			windowId: undefined,
		});
	});
});
