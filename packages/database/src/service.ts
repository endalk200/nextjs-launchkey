import { PrismaPg } from "@prisma/adapter-pg";
import { Context, Data, Effect, Layer } from "effect";
import { PrismaClient } from "./generated/client.ts";

export class DatabaseConfigurationError extends Data.TaggedError(
	"DatabaseConfigurationError",
)<{
	readonly message: string;
}> {}

export class DatabaseConnectionError extends Data.TaggedError(
	"DatabaseConnectionError",
)<{
	readonly cause: unknown;
}> {}

export class PrismaService extends Context.Service<
	PrismaService,
	{
		readonly client: PrismaClient;
	}
>()("app/PrismaService") {}

const readDatabaseUrl = Effect.gen(function* () {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		return yield* new DatabaseConfigurationError({
			message: "DATABASE_URL is required",
		});
	}

	let parsed: URL;

	try {
		parsed = new URL(databaseUrl);
	} catch {
		return yield* new DatabaseConfigurationError({
			message: "DATABASE_URL must be a valid URL",
		});
	}

	if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
		return yield* new DatabaseConfigurationError({
			message:
				"DATABASE_URL must use the postgresql:// or postgres:// protocol",
		});
	}

	return databaseUrl;
});

const acquirePrismaClient = readDatabaseUrl.pipe(
	Effect.flatMap((databaseUrl) =>
		Effect.tryPromise({
			try: async () => {
				const adapter = new PrismaPg({ connectionString: databaseUrl });
				const client = new PrismaClient({ adapter });

				await client.$connect();

				return { client };
			},
			catch: (cause) => new DatabaseConnectionError({ cause }),
		}),
	),
);

export const PrismaServiceLive = Layer.effect(
	PrismaService,
	Effect.acquireRelease(acquirePrismaClient, ({ client }) =>
		Effect.promise(() => client.$disconnect()).pipe(Effect.orDie),
	),
);
