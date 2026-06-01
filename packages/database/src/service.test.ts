import { Data, Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "./generated/client.ts";
import { Prisma } from "./generated/client.ts";
import { DatabaseConfigurationError, DatabaseError } from "./errors.ts";
import {
	makeDatabaseService,
	PrismaServiceLive,
	PrismaService,
} from "./service.ts";

const originalDatabaseUrl = process.env.DATABASE_URL;

function acquirePrismaService() {
	return Effect.runPromise(Effect.provide(PrismaService, PrismaServiceLive));
}

describe("PrismaLive", () => {
	afterEach(() => {
		if (originalDatabaseUrl === undefined) {
			delete process.env.DATABASE_URL;
		} else {
			process.env.DATABASE_URL = originalDatabaseUrl;
		}
	});

	it("fails when DATABASE_URL is missing", async () => {
		delete process.env.DATABASE_URL;

		await expect(acquirePrismaService()).rejects.toMatchObject({
			_tag: "DatabaseConfigurationError",
			message: "DATABASE_URL is required",
		});
	});

	it("fails when DATABASE_URL is not a valid URL", async () => {
		process.env.DATABASE_URL = "not-a-url";

		await expect(acquirePrismaService()).rejects.toMatchObject({
			_tag: "DatabaseConfigurationError",
			message: "DATABASE_URL must be a valid URL",
		});
	});

	it("fails when DATABASE_URL is not postgres", async () => {
		process.env.DATABASE_URL = "mysql://launchkey:launchkey@localhost:3306/app";

		await expect(acquirePrismaService()).rejects.toMatchObject({
			_tag: "DatabaseConfigurationError",
			message:
				"DATABASE_URL must use the postgresql:// or postgres:// protocol",
		});
	});

	it("preserves configuration failures as DatabaseConfigurationError", async () => {
		delete process.env.DATABASE_URL;

		await expect(acquirePrismaService()).rejects.toBeInstanceOf(
			DatabaseConfigurationError,
		);
	});
});

const prismaClientVersion = Prisma.prismaVersion.client;

function knownRequestError(
	code: string,
	meta?: Record<string, unknown>,
): Prisma.PrismaClientKnownRequestError {
	return new Prisma.PrismaClientKnownRequestError(`Prisma error ${code}`, {
		code,
		clientVersion: prismaClientVersion,
		meta,
	});
}

class DomainRuleRejected extends Data.TaggedError("DomainRuleRejected")<{
	readonly message: string;
}> {}

describe("Database", () => {
	it("maps unique constraint violations to stable database errors", async () => {
		const database = makeDatabaseService({} as PrismaClient);

		await expect(
			Effect.runPromise(
				database.mutation({ operation: "Post.Create", model: "Post" }, () =>
					Promise.reject(knownRequestError("P2002", { target: ["slug"] })),
				),
			),
		).rejects.toMatchObject({
			_tag: "UniqueConstraintViolation",
			operation: "Post.Create",
			model: "Post",
			fields: ["slug"],
		});
	});

	it("maps required missing records to stable database errors", async () => {
		const database = makeDatabaseService({} as PrismaClient);

		await expect(
			Effect.runPromise(
				database.mutation({ operation: "Post.Update", model: "Post" }, () =>
					Promise.reject(knownRequestError("P2025")),
				),
			),
		).rejects.toMatchObject({
			_tag: "RecordRequiredButMissing",
			operation: "Post.Update",
			model: "Post",
		});
	});

	it("maps foreign key constraint violations with affected fields", async () => {
		const database = makeDatabaseService({} as PrismaClient);

		await expect(
			Effect.runPromise(
				database.mutation(
					{ operation: "Comment.Create", model: "Comment" },
					() =>
						Promise.reject(
							knownRequestError("P2003", {
								field_name: "post_id",
								constraint: "comments_post_id_fkey",
							}),
						),
				),
			),
		).rejects.toMatchObject({
			_tag: "ForeignKeyConstraintViolation",
			operation: "Comment.Create",
			model: "Comment",
			constraint: "comments_post_id_fkey",
			fields: ["post_id"],
		});
	});

	it("maps connection pool timeouts as retryable query timeouts", async () => {
		const database = makeDatabaseService({} as PrismaClient);

		await expect(
			Effect.runPromise(
				database.query({ operation: "Post.List", model: "Post" }, () =>
					Promise.reject(knownRequestError("P2024")),
				),
			),
		).rejects.toMatchObject({
			_tag: "QueryTimedOut",
			operation: "Post.List",
			model: "Post",
		});
	});

	it("maps Prisma initialization errors as connection unavailable", async () => {
		const database = makeDatabaseService({} as PrismaClient);

		await expect(
			Effect.runPromise(
				database.query({ operation: "Post.List", model: "Post" }, () =>
					Promise.reject(
						new Prisma.PrismaClientInitializationError(
							"database unavailable",
							prismaClientVersion,
						),
					),
				),
			),
		).rejects.toMatchObject({
			_tag: "ConnectionUnavailable",
			operation: "Post.List",
			model: "Post",
		});
	});

	it("maps Prisma validation errors without leaking Prisma control flow", async () => {
		const database = makeDatabaseService({} as PrismaClient);

		await expect(
			Effect.runPromise(
				database.mutation({ operation: "Post.Create", model: "Post" }, () =>
					Promise.reject(
						new Prisma.PrismaClientValidationError("invalid query", {
							clientVersion: prismaClientVersion,
						}),
					),
				),
			),
		).rejects.toMatchObject({
			_tag: "DatabaseValidationError",
			operation: "Post.Create",
			model: "Post",
		});
	});

	it("retries transaction write conflicts only when retries are requested", async () => {
		let attempts = 0;
		const client = {
			$transaction: (
				callback: (client: Prisma.TransactionClient) => Promise<string>,
			) => {
				attempts += 1;
				return callback({} as Prisma.TransactionClient);
			},
		} as unknown as PrismaClient;
		const database = makeDatabaseService(client);

		const result = await Effect.runPromise(
			database.transaction(
				{ operation: "Post.Publish", model: "Post" },
				(transaction) =>
					transaction.mutation(
						{ operation: "Post.Update", model: "Post" },
						() =>
							attempts === 1
								? Promise.reject(knownRequestError("P2034"))
								: Promise.resolve("published"),
					),
				{ retries: 1 },
			),
		);

		expect(result).toBe("published");
		expect(attempts).toBe(2);
	});

	it("does not retry transaction write conflicts by default", async () => {
		let attempts = 0;
		const client = {
			$transaction: (
				callback: (client: Prisma.TransactionClient) => Promise<string>,
			) => {
				attempts += 1;
				return callback({} as Prisma.TransactionClient);
			},
		} as unknown as PrismaClient;
		const database = makeDatabaseService(client);

		await expect(
			Effect.runPromise(
				database.transaction(
					{ operation: "Post.Publish", model: "Post" },
					(transaction) =>
						transaction.mutation(
							{ operation: "Post.Update", model: "Post" },
							() => Promise.reject(knownRequestError("P2034")),
						),
				),
			),
		).rejects.toMatchObject({
			_tag: "TransactionWriteConflict",
			operation: "Post.Update",
			model: "Post",
		});

		expect(attempts).toBe(1);
	});

	it("passes through non-database transaction failures from the callback", async () => {
		const client = {
			$transaction: (
				callback: (client: Prisma.TransactionClient) => Promise<never>,
			) => callback({} as Prisma.TransactionClient),
		} as unknown as PrismaClient;
		const database = makeDatabaseService(client);

		await expect(
			Effect.runPromise(
				database.transaction({ operation: "Post.Publish", model: "Post" }, () =>
					Effect.fail(
						new DomainRuleRejected({
							message: "post is already published",
						}),
					),
				),
			),
		).rejects.toBeInstanceOf(DomainRuleRejected);
	});

	it("identifies retryable and constraint database errors", () => {
		const conflict = new Prisma.PrismaClientKnownRequestError(
			"write conflict",
			{
				code: "P2034",
				clientVersion: prismaClientVersion,
			},
		);
		const unique = new Prisma.PrismaClientKnownRequestError(
			"unique constraint",
			{
				code: "P2002",
				clientVersion: prismaClientVersion,
				meta: { target: ["slug"] },
			},
		);
		const database = makeDatabaseService({} as PrismaClient);

		return Effect.runPromise(
			Effect.gen(function* () {
				const retryable = yield* database
					.query({ operation: "Post.Get", model: "Post" }, () =>
						Promise.reject(conflict),
					)
					.pipe(
						Effect.catchIf(
							() => true,
							(error) => Effect.succeed(DatabaseError.isRetryable(error)),
						),
					);
				const constraint = yield* database
					.mutation({ operation: "Post.Create", model: "Post" }, () =>
						Promise.reject(unique),
					)
					.pipe(
						Effect.catchIf(
							() => true,
							(error) =>
								Effect.succeed(DatabaseError.isConstraintViolation(error)),
						),
					);

				expect(retryable).toBe(true);
				expect(constraint).toBe(true);
			}),
		);
	});
});
