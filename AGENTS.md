AGENTS: how to build, lint, test, and code here

- Package manager: pnpm 9. Use pnpm for all scripts.
- Build: `pnpm build` (Next.js). Preview: `pnpm preview`.
- Dev server: `pnpm dev` (Next.js with Turbo). Start prod: `pnpm start` after build.
- Lint: `pnpm lint` (eslint 9 + next config). Auto-fix: `pnpm lint:fix`.
- Type checks: `pnpm typecheck` or `pnpm check` (runs lint + tsc --noEmit).
- Format: `pnpm format:check` and `pnpm format:write` (Prettier 3 + tailwind plugin).
- Tests: No test runner is configured. If you add Vitest/Jest, prefer Vitest. Single test example (after setup): `pnpm vitest run path/to/file.test.ts`.
- DB (Prisma): `pnpm db:generate` (migrate dev), `pnpm db:migrate` (deploy), `pnpm db:push`, `pnpm db:studio`. Postinstall runs `prisma generate`.

Code style rules (enforced by eslint, prettier, tsconfig):

- Imports: absolute/aliased only if configured; default to relative within src. Group std libs, external, internal; keep type-only imports using `import type { X } from '...'`.
- Formatting: Prettier is source of truth (no semicolon prefs specified -> use Prettier defaults). Tailwind class order via prettier-plugin-tailwindcss.
- Types: strict TS (tsconfig). Prefer explicit types for exports/public APIs. Use `neverthrow` Result for recoverable errors; avoid throwing across boundaries.
- Naming: components PascalCase; files kebab-case except React components may use same-name file. Hooks use useX. Zod schemas `XSchema`. Env modules in `src/env.js`.
- React/Next: use Server Components by default; client components start with 'use client'. Keep `server-only` for server-only modules. Avoid `any` and implicit `any`.
- TRPC: procedures in `src/server/api/routers`; keep input/output schemas with zod and serialize with superjson.
- Error handling: map Prisma errors via `src/lib/utils/prisma-errors.ts`; surface user-safe messages; log internal details server-side only.
- Emails: templates in `src/emails`; use Resend via `src/lib/email.ts`.

Keep .env variables out of VCS; use `.env.example` as reference.
