import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { testUtils } from "better-auth/plugins";

import { authOptions } from "./auth.ts";

export const testAuth = betterAuth({
	...authOptions,
	plugins: [testUtils({ captureOTP: true }), nextCookies()],
});
