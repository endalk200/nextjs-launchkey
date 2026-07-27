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
			assert.isDefined(item?.patch);
			assert.isDefined(item?.delete);
			assert.property(collection?.post?.responses ?? {}, "201");
			assert.property(item?.patch?.responses ?? {}, "404");
			assert.property(item?.delete?.responses ?? {}, "404");
		}),
	);
});
