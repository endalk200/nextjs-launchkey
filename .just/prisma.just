# Prisma module

# Run migrations (deploy for prod)
@db-migrate:
	pnpm db:migrate

# Generate client
@db-generate:
	pnpm db:generate

# Push schema (dev only)
@db-push:
	pnpm db:push

# Prisma studio
@db-studio:
	pnpm db:studio
