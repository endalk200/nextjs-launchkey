import { PrismaLive, PrismaService } from "@app/database";
import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Effect, Layer } from "effect";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PostNotFoundError } from "../model/errors.ts";
import { Post } from "../model/post.ts";
import { PostRepository, PostRepositoryLive } from "./post.repository.ts";

let container: StartedPostgreSqlContainer;
const rootDirectory = fileURLToPath(new URL("../../../../..", import.meta.url));
const describeWithDocker = hasDockerRuntime() ? describe : describe.skip;

function hasDockerRuntime() {
	try {
		execFileSync("docker", ["info"], { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}

function runRepository<A, E>(effect: Effect.Effect<A, E, PostRepository>) {
	return Effect.runPromise(
		Effect.provide(effect, PostRepositoryLive.pipe(Layer.provide(PrismaLive))),
	);
}

function runWithPrisma<A, E>(effect: Effect.Effect<A, E, PrismaService>) {
	return Effect.runPromise(Effect.provide(effect, PrismaLive));
}

describeWithDocker("PostRepoPrismaLive", () => {
	beforeAll(async () => {
		container = await new PostgreSqlContainer("postgres:17-alpine")
			.withDatabase("launchkey_test")
			.withUsername("launchkey")
			.withPassword("launchkey")
			.start();

		process.env.DATABASE_URL = `${container.getConnectionUri()}?schema=public`;

		execFileSync("bun", ["--filter", "@app/database", "db:migrate:deploy"], {
			cwd: rootDirectory,
			env: process.env,
			stdio: "inherit",
		});
	});

	afterAll(async () => {
		await container?.stop();
	});

	beforeEach(async () => {
		await runWithPrisma(
			Effect.gen(function* () {
				const prisma = yield* PrismaService;

				yield* Effect.tryPromise(() =>
					prisma.client.$executeRawUnsafe(
						'TRUNCATE TABLE "posts" RESTART IDENTITY CASCADE',
					),
				).pipe(Effect.orDie);
			}),
		);
	});

	it("creates and lists posts through the PostRepository contract", async () => {
		const result = await runRepository(
			Effect.gen(function* () {
				const repo = yield* PostRepository;
				const created = yield* repo.create("First post", "First body");
				const list = yield* repo.list;

				return { created, list };
			}),
		);

		expect(result.created.id).toEqual(expect.any(String));
		expect(result.created).toMatchObject({
			title: "First post",
			content: "First body",
		});
		expect(result.list).toEqual([result.created]);
	});

	it("updates posts through the PostRepository contract", async () => {
		const result = await runRepository(
			Effect.gen(function* () {
				const repo = yield* PostRepository;
				const created = yield* repo.create("First post", "First body");

				return yield* repo.update(created.id, "Updated post", "Updated body");
			}),
		);

		expect(result).toEqual(
			new Post({
				id: result.id,
				title: "Updated post",
				content: "Updated body",
			}),
		);
	});

	it("deletes posts through the PostRepository contract", async () => {
		const result = await runRepository(
			Effect.gen(function* () {
				const repo = yield* PostRepository;
				const created = yield* repo.create("First post", "First body");
				const deleted = yield* repo.delete(created.id);
				const list = yield* repo.list;

				return { deleted, list };
			}),
		);

		expect(result.deleted).toMatchObject({
			title: "First post",
			content: "First body",
		});
		expect(result.list).toEqual([]);
	});

	it("returns PostNotFound when updating a missing post", async () => {
		await expect(
			runRepository(
				Effect.gen(function* () {
					const repo = yield* PostRepository;

					return yield* repo.update(
						"00000000-0000-0000-0000-000000000001",
						"Updated post",
						"Updated body",
					);
				}),
			),
		).rejects.toBeInstanceOf(PostNotFoundError);
	});

	it("returns PostNotFound when deleting a missing post", async () => {
		await expect(
			runRepository(
				Effect.gen(function* () {
					const repo = yield* PostRepository;

					return yield* repo.delete("00000000-0000-0000-0000-000000000001");
				}),
			),
		).rejects.toBeInstanceOf(PostNotFoundError);
	});
});
