import { describe, expect, it, vi } from "vitest";
import {
	synchronizePostHogIdentity,
	synchronizePostHogSession,
} from "./posthog-identity.client";

function makeClient(storedUserId?: string) {
	return {
		get_property: vi.fn(() => storedUserId),
		identify: vi.fn(),
		reset: vi.fn(),
	};
}

describe("synchronizePostHogIdentity", () => {
	it("preserves a genuinely anonymous identity", () => {
		const client = makeClient();

		synchronizePostHogIdentity(client);

		expect(client.reset).not.toHaveBeenCalled();
		expect(client.identify).not.toHaveBeenCalled();
	});

	it("clears a persisted user when the application session is anonymous", () => {
		const client = makeClient("user-1");

		synchronizePostHogIdentity(client);

		expect(client.reset).toHaveBeenCalledOnce();
		expect(client.identify).not.toHaveBeenCalled();
	});

	it("identifies a newly authenticated user without person properties", () => {
		const client = makeClient();

		synchronizePostHogIdentity(client, { id: "user-1" });

		expect(client.reset).not.toHaveBeenCalled();
		expect(client.identify).toHaveBeenCalledWith("user-1");
	});

	it("does not repeat identification for the current user", () => {
		const client = makeClient("user-1");

		synchronizePostHogIdentity(client, { id: "user-1" });

		expect(client.reset).not.toHaveBeenCalled();
		expect(client.identify).not.toHaveBeenCalled();
	});

	it("resets before identifying a different user", () => {
		const calls: string[] = [];
		const client = {
			get_property: vi.fn(() => "user-1"),
			identify: vi.fn((id: string) => calls.push(`identify:${id}`)),
			reset: vi.fn(() => calls.push("reset")),
		};

		synchronizePostHogIdentity(client, { id: "user-2" });

		expect(calls).toEqual(["reset", "identify:user-2"]);
	});
});

describe("synchronizePostHogSession", () => {
	it.each([
		{ error: null, isPending: true, userId: undefined },
		{
			error: new Error("network unavailable"),
			isPending: false,
			userId: undefined,
		},
	])("preserves identity while the session is unresolved", (session) => {
		const client = makeClient("user-1");

		synchronizePostHogSession(client, session);

		expect(client.reset).not.toHaveBeenCalled();
		expect(client.identify).not.toHaveBeenCalled();
	});

	it.each([
		null,
		undefined,
	])("clears identity after a confirmed anonymous session without an error", (error) => {
		const client = makeClient("user-1");

		synchronizePostHogSession(client, {
			error,
			isPending: false,
			userId: undefined,
		});

		expect(client.reset).toHaveBeenCalledOnce();
		expect(client.identify).not.toHaveBeenCalled();
	});

	it("identifies the user from a confirmed client session", () => {
		const client = makeClient();

		synchronizePostHogSession(client, {
			error: null,
			isPending: false,
			userId: "user-1",
		});

		expect(client.identify).toHaveBeenCalledWith("user-1");
	});
});
