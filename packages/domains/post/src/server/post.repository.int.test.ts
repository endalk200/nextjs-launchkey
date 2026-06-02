import {
	Database,
	DatabaseLive,
	RecordRequiredButMissing,
	TransactionWriteConflict,
	UnexpectedDatabaseError,
} from "@app/database";
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
import { PostRepository, PostRepositoryPrisma } from "./post.repository.ts";

let container: StartedPostgreSqlContainer;
const rootDirectory = fileURLToPath(new URL("../../../../..", import.meta.url));
const describeWithDocker = hasDockerRuntime() ? describe : describe.skip;

const fakeDatabaseClient = {} as Database["Service"]["client"];

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
		Effect.provide(
			effect,
			PostRepositoryPrisma.pipe(Layer.provide(DatabaseLive)),
		),
	);
}

function runWithDatabase<A, E>(effect: Effect.Effect<A, E, Database>) {
	return Effect.runPromise(Effect.provide(effect, DatabaseLive));
}

function runRepositoryWithDatabase<A, E>(
	database: Database["Service"],
	effect: Effect.Effect<A, E, PostRepository>,
) {
	return Effect.runPromise(
		Effect.provide(
			effect,
			PostRepositoryPrisma.pipe(
				Layer.provide(Layer.succeed(Database, database)),
			),
		),
	);
}

describe("PostRepositoryLive database errors", () => {
	it("propagates unexpected database failures", async () => {
		const database = Database.of({
			client: fakeDatabaseClient,
			query: (metadata) =>
				Effect.fail(
					new UnexpectedDatabaseError({
						operation: metadata.operation,
						model: metadata.model,
						cause: new Error("database failed"),
					}),
				),
			mutation: (metadata) =>
				Effect.fail(
					new UnexpectedDatabaseError({
						operation: metadata.operation,
						model: metadata.model,
						cause: new Error("database failed"),
					}),
				),
			transaction: (metadata) =>
				Effect.fail(
					new UnexpectedDatabaseError({
						operation: metadata.operation,
						model: metadata.model,
						cause: new Error("database failed"),
					}),
				),
		});

		await expect(
			runRepositoryWithDatabase(
				database,
				Effect.gen(function* () {
					const repo = yield* PostRepository;

					return yield* repo.list;
				}),
			),
		).rejects.toMatchObject({
			_tag: "UnexpectedDatabaseError",
			operation: "Post.List",
		});
	});

	it("propagates retryable database failures", async () => {
		const database = Database.of({
			client: fakeDatabaseClient,
			query: (metadata) =>
				Effect.fail(
					new TransactionWriteConflict({
						operation: metadata.operation,
						model: metadata.model,
						cause: new Error("write conflict"),
					}),
				),
			mutation: (metadata) =>
				Effect.fail(
					new TransactionWriteConflict({
						operation: metadata.operation,
						model: metadata.model,
						cause: new Error("write conflict"),
					}),
				),
			transaction: (metadata) =>
				Effect.fail(
					new TransactionWriteConflict({
						operation: metadata.operation,
						model: metadata.model,
						cause: new Error("write conflict"),
					}),
				),
		});

		await expect(
			runRepositoryWithDatabase(
				database,
				Effect.gen(function* () {
					const repo = yield* PostRepository;

					return yield* repo.create("First post", "First body");
				}),
			),
		).rejects.toMatchObject({
			_tag: "TransactionWriteConflict",
			operation: "Post.Create",
		});
	});
});

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
		await runWithDatabase(
			Effect.gen(function* () {
				const database = yield* Database;

				yield* database
					.mutation(
						{ operation: "PostTest.Truncate", model: "Post" },
						(client) =>
							client.$executeRawUnsafe('TRUNCATE TABLE "posts" CASCADE'),
					)
					.pipe(Effect.orDie);
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

	it("returns RecordRequiredButMissing when updating a missing post", async () => {
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
		).rejects.toBeInstanceOf(RecordRequiredButMissing);
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
