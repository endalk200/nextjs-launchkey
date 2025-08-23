# syntax=docker/dockerfile:1.7

# -------- Base (pinned Node, PNPM, corepack) --------
FROM node:20-alpine AS base
ENV NODE_ENV=production
# Enable corepack and set pnpm version to match repo
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# -------- Dependencies (only prod deps installed) --------
FROM base AS deps
# Install OS deps for Prisma engines
RUN apk add --no-cache libc6-compat openssl
# Copy lockfile and manifest first for better caching
COPY package.json pnpm-lock.yaml .npmrc ./
# Install only production deps; but prisma generate needs dev prisma
# We will install all deps here for build, then prune in later stage
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# -------- Build (Next.js build with standalone output) --------
FROM deps AS build
# Copy the rest of the source
COPY . .
# Set Prisma to use correct binary target for linux musl
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary \
    PRISMA_GENERATE_SKIP_ENV_VALIDATION=1 \
    NEXT_TELEMETRY_DISABLED=1
# Generate Prisma client and build Next.js
RUN pnpm prisma generate && pnpm build

# After build, install only production deps and prune dev
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm prune --prod

# -------- Runtime (distroless-ish small image) --------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy built app from build stage
# Next standalone output is in .next/standalone and static assets in .next/static
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# Prisma schema and generated client (when using standalone) already included under node_modules
# But include prisma folder for migration/edge cases
COPY --from=build /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Set ownership to non-root
RUN chown -R nextjs:nextjs /app
USER nextjs

# Default runtime envs
ENV PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

# Start the server
CMD ["node", "server.js"]
