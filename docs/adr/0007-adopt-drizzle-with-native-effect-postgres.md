# Adopt Drizzle with Native Effect Postgres

`@app/database` uses Drizzle ORM's native `effect-postgres` driver for
application repositories. Query builders are Effects and are yielded directly
inside repository programs. `DatabaseLive` supplies the Drizzle database from
`@effect/sql-pg`'s `PgClient`; the database package no longer wraps every query
and mutation in a custom Promise bridge or reimplements PostgreSQL error
classification.

The physical schema is owned by
`packages/database/src/schema.ts`. Drizzle Kit generates the single migration
history under `packages/database/drizzle`. Domain packages continue to own
repository contracts and persistence implementations. Repositories select only
the fields their domain models need, map missing `RETURNING` rows to domain
not-found errors, and otherwise retain Drizzle/Effect SQL failures until the
service boundary translates them into public domain errors.

Effect SQL's structured `SqlError` reasons are the source of database
retryability. A Drizzle query failure contains the underlying Effect cause, so
`@app/database` only unwraps that cause when a domain service needs the
`isRetryable` policy. It does not maintain another application-specific catalog
of PostgreSQL or driver error codes.

## Better Auth

Better Auth's `user`, `session`, `account`, and `verification` tables are
first-class tables in the shared Drizzle schema and migration history. Better
Auth receives those exact tables through `drizzleAdapter` with PostgreSQL,
camel-case physical columns, and transaction support enabled. The adapter is a
Promise-oriented integration boundary, so it uses Drizzle's `node-postgres`
client rather than converting native Effect queries back into Promises.

Better Auth 1.7 identifies an account by `issuer` plus `providerAccountId`.
The clean baseline creates those columns and their compound unique index
directly. The application currently enables only email/password credentials,
for which Better Auth uses `local:credential`.

Database joins remain disabled for Better Auth. They are an optional
optimization and require Drizzle relation metadata. The non-join adapter path is
smaller and covers the current authentication flows; joins can be adopted in a
separate measured change if database latency justifies the added relation
surface.

The Effect repository pool and Better Auth adapter pool each allow at most five
connections, for a maximum of ten PostgreSQL connections in a process that
loads both. Both clients fail connection attempts after five seconds and
release idle connections after thirty seconds.

## Greenfield cutover

The project has no users or database data to preserve. The first Drizzle
migration creates the complete application and Better Auth 1.7 schema on an
empty PostgreSQL database. It deliberately contains no Prisma adoption logic,
Better Auth 1.6 data conversion, synthetic users, or backward-compatibility
columns. A future populated-database migration must be designed and reviewed
separately rather than expanding this baseline.

## Version policy

Native Effect support is currently on Drizzle 1 release candidates and requires
a compatible Effect 4 beta. The repository pins the compatibility set exactly:

- `drizzle-orm` and `drizzle-kit` `1.0.0-rc.4`
- `effect`, `@effect/sql-pg`, `@effect/vitest`, and
  `@effect/opentelemetry` `4.0.0-beta.101`
- `better-auth` and `@better-auth/drizzle-adapter` `1.7.0-rc.2`

These versions must be upgraded together after checking their peer ranges,
version-matched source, generated SQL, and Better Auth's generated reference
schema.

## Consequences

The runtime database boundary is substantially smaller: connection lifecycle,
transactions, query execution, and PostgreSQL failure classification come from
Drizzle and Effect SQL. Repository integration tests apply real Drizzle
migrations to PostgreSQL. Auth integration tests exercise sign-up, account
creation, verification, session creation, and password-reset verification
storage through Better Auth 1.7's real Drizzle adapter. Browser E2E tests
continue through the same migrated tables.

This decision supersedes ADRs 0003, 0004, and 0005 and the Prisma-specific test
details in ADR 0006.
