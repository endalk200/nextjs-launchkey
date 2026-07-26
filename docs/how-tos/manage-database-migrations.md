# Manage Database Migrations

The Drizzle schema is `packages/database/src/schema.ts`. It includes both
application tables and Better Auth's core tables. Do not run Better Auth's
database migrator separately: with a Drizzle adapter, Better Auth generates a
reference schema and Drizzle Kit owns the actual migration history.

## Change the schema

1. Edit `packages/database/src/schema.ts`.
2. Generate a migration with `bun db:generate`.
3. Review the generated SQL and snapshot under `packages/database/drizzle`.
4. Run `bun run test:integration` so the migration and real repository/adapter
   paths execute against PostgreSQL.
5. Apply locally with `bun db:migrate:dev`.

Production and CI apply committed migrations with:

```sh
bun db:migrate:deploy
```

`db:generate` is intentionally offline. Commands that connect to PostgreSQL use
`drizzle.migrate.config.ts` and fail immediately unless `DATABASE_URL` is a
valid `postgres:` or `postgresql:` URL with a host and database name. There is
no localhost fallback.

Drizzle Kit has a `drop` command for deleting migration files; it is not a
database reset command. The project intentionally does not expose it as
`db:migrate:reset`.

## Check Better Auth schema changes

Whenever Better Auth, its Drizzle adapter, or an auth plugin changes, generate a
temporary reference schema using the same release line as the installed
packages:

```sh
bunx --bun auth@1.7.0-rc.2 generate \
  --config packages/domains/auth/src/server/auth.ts \
  --output /tmp/launchkey-better-auth-schema.ts \
  --yes
```

Compare its core tables and indexes with
`packages/database/src/schema.ts`, then represent intentional changes through a
Drizzle migration. Keep `camelCase: true` on the adapter while the existing auth
columns use camel-case physical names. Plugin-provided tables and fields must
also be added to the shared schema before enabling a plugin.

## Greenfield Prisma-to-Drizzle cutover

This project has no users or database data to preserve. The initial Drizzle
migration is therefore a clean Better Auth 1.7 and application-schema baseline;
it does not adopt Prisma tables, migrate Better Auth 1.6 accounts, create
synthetic users, or retain backward-compatibility columns.

1. Stop any local application process connected to the old development
   database.
2. Create an empty PostgreSQL database (or replace the disposable local
   database).
3. Set `DATABASE_URL` to that database.
4. Apply `bun db:migrate:deploy`.
5. Run `bun run test:integration` and `bun run test:e2e`.

Do not apply the baseline over a populated Prisma database. If data preservation
becomes a requirement later, write a separately reviewed data migration rather
than adding legacy branches to the greenfield baseline.
