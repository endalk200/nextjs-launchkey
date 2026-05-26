# Standardize JavaScript Toolchain

We use Bun as the only package manager, Node.js as the application runtime, and Biome as the linting and formatting tool. Bun gives the workspace one fast installer and lockfile without mixing npm, pnpm, or Yarn state; Node remains the runtime because the Next.js ecosystem and deployment targets are optimized around it; Biome replaces separate ESLint and Prettier setup so linting and formatting share one configuration and one command surface.

## Consequences

Package installation and script execution should use `bun` and the committed `bun.lock`. Application code should continue to target Node.js runtime behavior, not Bun-specific runtime APIs. Formatting and linting rules should be expressed through Biome config, with check commands kept read-only and fix/write commands used for mutation.
