// @vitest-environment node

import { HttpRouter } from "effect/unstable/http";
import { afterEach, assert, describe, it } from "vitest";
import { PostApiDocumentation } from "./documentation.ts";

let dispose: (() => Promise<void>) | undefined;

afterEach(async () => {
	await dispose?.();
	dispose = undefined;
});

describe("PostApiDocumentation", () => {
	it("serves an interactive Scalar reference at /api/docs", async () => {
		const webHandler = HttpRouter.toWebHandler(PostApiDocumentation, {
			disableLogger: true,
		});
		dispose = webHandler.dispose;

		const response = await webHandler.handler(
			new Request("http://localhost/api/docs"),
		);
		const html = await response.text();

		assert.strictEqual(response.status, 200);
		assert.match(response.headers.get("content-type") ?? "", /^text\/html/);
		assert.include(html, "<title>LaunchKey Posts API</title>");
		assert.include(html, "List the authenticated user");
		assert.include(html, "window.Scalar.createApiReference");
	});
});
