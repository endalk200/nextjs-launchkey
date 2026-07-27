import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { testUtils } from "better-auth/plugins";

import { createAuthOptions } from "../server/auth.ts";

/**
 * Creates a Better Auth instance with test utilities enabled.
 *
 * Intended for e2e setup code only; each call opens its own database
 * connection, so callers should reuse the returned instance.
 */
export function createTestAuth() {
	return betterAuth({
		...createAuthOptions(),
		plugins: [testUtils({ captureOTP: true }), nextCookies()],
	});
}
