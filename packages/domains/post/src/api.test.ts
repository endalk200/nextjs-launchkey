import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { OpenApi } from "effect/unstable/httpapi";
import {
	CreatePostPayload,
	PostApi,
	PostIdParams,
	UpdatePostPayload,
} from "./api.ts";

describe("PostApi", () => {
	it.effect("accepts valid create payloads", () =>
		Effect.sync(() => {
			const payload = Schema.decodeUnknownSync(CreatePostPayload)({
				title: "Created post",
				content: "Created body",
			});

			assert.deepStrictEqual(payload, {
				title: "Created post",
				content: "Created body",
			});
		}),
	);

	it.effect("rejects empty create titles", () =>
		Effect.sync(() => {
			assert.throws(
				() =>
					Schema.decodeUnknownSync(CreatePostPayload)({
						title: "   ",
						content: "Created body",
					}),
				/Title is required\./,
			);
		}),
	);

	it.effect("rejects empty create content", () =>
		Effect.sync(() => {
			assert.throws(
				() =>
					Schema.decodeUnknownSync(CreatePostPayload)({
						title: "Created post",
						content: "   ",
					}),
				/Content is required\./,
			);
		}),
	);

	it.effect("accepts valid update payloads", () =>
		Effect.sync(() => {
			const payload = Schema.decodeUnknownSync(UpdatePostPayload)({
				title: "Updated post",
				content: "Updated body",
			});

			assert.deepStrictEqual(payload, {
				title: "Updated post",
				content: "Updated body",
			});
		}),
	);

	it.effect("rejects invalid path ids", () =>
		Effect.sync(() => {
			assert.throws(
				() =>
					Schema.decodeUnknownSync(PostIdParams)({
						id: "not-a-uuid",
					}),
				/Expected a UUID/,
			);
		}),
	);

	it.effect("publishes the REST methods and response statuses", () =>
		Effect.sync(() => {
			const specification = OpenApi.fromApi(PostApi);
			const collection = specification.paths["/api/posts"];
			const item = specification.paths["/api/posts/{id}"];

			assert.isDefined(collection?.get);
			assert.isDefined(collection?.post);
			assert.isDefined(item?.put);
			assert.isDefined(item?.delete);
			assert.property(collection?.post?.responses ?? {}, "201");
			assert.property(collection?.post?.responses ?? {}, "400");
			assert.property(collection?.get?.responses ?? {}, "503");
			assert.property(collection?.post?.responses ?? {}, "503");
			assert.property(item?.put?.responses ?? {}, "400");
			assert.property(item?.put?.responses ?? {}, "404");
			assert.property(item?.put?.responses ?? {}, "503");
			assert.property(item?.delete?.responses ?? {}, "400");
			assert.property(item?.delete?.responses ?? {}, "404");
			assert.property(item?.delete?.responses ?? {}, "503");
		}),
	);

	it.effect("publishes consumer-facing API and operation documentation", () =>
		Effect.sync(() => {
			const specification = OpenApi.fromApi(PostApi);
			const collection = specification.paths["/api/posts"];
			const item = specification.paths["/api/posts/{id}"];

			assert.strictEqual(specification.info.title, "LaunchKey Posts API");
			assert.strictEqual(specification.info.version, "0.1.0");
			assert.match(specification.info.description ?? "", /authenticated user/);
			assert.deepInclude(specification.tags, {
				name: "Posts",
				description: "Create and manage posts owned by the authenticated user.",
			});
			assert.strictEqual(
				collection?.get?.summary,
				"List the authenticated user's posts",
			);
			assert.match(collection?.get?.description ?? "", /current session/);
			assert.strictEqual(collection?.post?.summary, "Create a post");
			assert.match(collection?.post?.description ?? "", /201 Created/);
			assert.strictEqual(item?.put?.summary, "Replace a post");
			assert.match(item?.put?.description ?? "", /complete replacement/);
			assert.strictEqual(item?.delete?.summary, "Delete a post");
			assert.match(item?.delete?.description ?? "", /deleted post/);
		}),
	);

	it.effect("publishes the non-blank request validation constraints", () =>
		Effect.sync(() => {
			const specification = OpenApi.fromApi(PostApi);
			const requestSchema = specification.paths["/api/posts"]?.post?.requestBody
				?.content["application/json"]?.schema as
				| {
						readonly properties?: Record<
							string,
							{
								readonly allOf?: ReadonlyArray<Record<string, unknown>>;
								readonly description?: string;
							}
						>;
				  }
				| undefined;
			const title = requestSchema?.properties?.title;
			const content = requestSchema?.properties?.content;

			assert.deepInclude(title?.allOf ?? [], { minLength: 1 });
			assert.deepInclude(title?.allOf ?? [], { pattern: "\\S" });
			assert.match(title?.description ?? "", /non-whitespace/);
			assert.deepInclude(content?.allOf ?? [], { minLength: 1 });
			assert.deepInclude(content?.allOf ?? [], { pattern: "\\S" });
			assert.match(content?.description ?? "", /non-whitespace/);
		}),
	);

	it.effect("publishes the Better Auth session-cookie requirement", () =>
		Effect.sync(() => {
			const specification = OpenApi.fromApi(PostApi);
			const collection = specification.paths["/api/posts"];
			const item = specification.paths["/api/posts/{id}"];
			const expectedSecurity: Array<Record<string, string[]>> = [
				{ betterAuthSession: [] },
			];

			assert.deepStrictEqual(specification.components.securitySchemes, {
				betterAuthSession: {
					type: "apiKey",
					name: "better-auth.session_token",
					in: "cookie",
					description:
						"Better Auth session cookie. HTTPS deployments use the __Secure- prefix.",
				},
			});
			assert.deepStrictEqual(collection?.get?.security, expectedSecurity);
			assert.deepStrictEqual(collection?.post?.security, expectedSecurity);
			assert.deepStrictEqual(item?.put?.security, expectedSecurity);
			assert.deepStrictEqual(item?.delete?.security, expectedSecurity);
		}),
	);
});
