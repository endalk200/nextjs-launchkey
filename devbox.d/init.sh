#!/usr/bin/env bash
# Devbox project initialization hook
set -euo pipefail

# Enable corepack and pin pnpm based on package.json's packageManager field
corepack enable >/dev/null 2>&1 || true
PNPM_VERSION=""
if command -v jq >/dev/null 2>&1 && [ -f package.json ]; then
  PNPM_VERSION=$(jq -r '.packageManager | capture("(?<name>[^@]+)@(?<ver>.+)").ver' package.json 2>/dev/null || echo "")
fi
if [ -z "$PNPM_VERSION" ]; then
  PNPM_VERSION="9.12.3"
fi
corepack prepare "pnpm@${PNPM_VERSION}" --activate

export NEXT_TELEMETRY_DISABLED=1
export PRISMA_GENERATE_SKIP_ENV_VALIDATION=1

# Print tool versions for visibility
node -v || true
pnpm -v || true
jq --version || true
