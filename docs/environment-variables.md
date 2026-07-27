# Environment variables

The repository uses one local environment file: `.env` at the repository
root. Package-local files such as `apps/web/.env` are intentionally
unsupported.

Copy the committed template before starting local development:

```sh
cp .env.example .env
```

Fill in the required values, then run commands from the repository root. The
same file is loaded for Next.js development and builds, Vitest, Storybook,
Playwright, and Drizzle migration commands. Variables already supplied by the
shell, CI, Docker, or the hosting platform take precedence over `.env`.

Do not commit `.env`. It contains database credentials, authentication secrets,
email credentials, and observability tokens.

## Required application variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | None | PostgreSQL URL used by the application, integration paths, Drizzle migrations, and Drizzle Studio. |
| `BETTER_AUTH_SECRET` | Yes | None | Server-only secret used by Better Auth to sign and encrypt authentication data. Use at least 32 cryptographically random characters. |
| `BETTER_AUTH_URL` | Yes | None | Canonical server URL Better Auth uses for callbacks and trusted-origin behavior, for example `http://localhost:3000`. |
| `NEXT_PUBLIC_APP_URL` | Yes | None | Canonical public application URL. Next.js embeds this value into browser code, so it must not contain secrets. Playwright also uses it as `baseURL`. |
| `AUTH_EMAIL_FROM` | Yes | None | Sender identity for authentication email, for example `LaunchKey <auth@example.com>`. The address or domain must be verified with the email provider in production. |
| `RESEND_API_KEY` | Yes | None | Server-only Resend API key used for authentication email. |

The application validates these values when server configuration is imported.
Missing values, empty strings, and malformed URLs fail fast with the variable
name in the error.

## Browser PostHog

All browser PostHog features are disabled when
`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is absent. Adding it enables analytics,
privacy-masked session replay, browser exception capture, and trace-header
correlation.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | No | None | Public PostHog project token used by `posthog-js`. This token is intended to be present in browser code; it is not a personal API key. |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | `/insights` | Browser ingestion host. `/insights` uses the Next.js reverse proxy configured by this app. A full regional ingestion URL can be used instead. |
| `NEXT_PUBLIC_POSTHOG_UI_HOST` | No | `https://us.posthog.com` | PostHog application host used for links and UI integration. Use `https://eu.posthog.com` for an EU project. |

Values beginning with `NEXT_PUBLIC_` are compiled into the client bundle.
Never place a personal API key, database password, authentication secret, or
private ingestion credential in one of them.

## Server-side PostHog errors

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `POSTHOG_PROJECT_TOKEN` | No | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Optional server-only project-token override for immediate server exception capture. |
| `POSTHOG_HOST` | No | `https://us.i.posthog.com` | Regional PostHog event ingestion host used by `posthog-node`. Use `https://eu.i.posthog.com` for EU. |

Server error tracking is disabled when neither project-token variable is set.
Telemetry failures are swallowed so they cannot change application responses.

## OpenTelemetry traces and logs

The Node.js runtime exports OTLP over HTTP. Signal-specific endpoints take
precedence over the base endpoint.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | No | `http://localhost:4318` | Base OTLP/HTTP collector URL. The app appends `/v1/traces` and `/v1/logs`. |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | No | Base URL plus `/v1/traces` | Complete trace ingestion URL. |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` | No | Base URL plus `/v1/logs` | Complete log ingestion URL. |
| `OTEL_EXPORTER_OTLP_TRACES_HEADERS` | No | None | Comma-separated `Key=Value` headers sent with trace exports. |
| `OTEL_EXPORTER_OTLP_LOGS_HEADERS` | No | None | Comma-separated `Key=Value` headers sent with log exports. |
| `OTEL_SERVICE_NAME` | No | `nextjs-launchkey-web` | Service identity attached to trace and log resources. |
| `OTEL_SERVICE_VERSION` | No | Release fallback chain | Deployed version attached to telemetry. |
| `OTEL_DEPLOYMENT_ENVIRONMENT` | No | `VERCEL_ENV`, then `NODE_ENV`, then `development` | Deployment environment attached to telemetry. |
| `OTEL_TRACES_SAMPLER` | No | `parentbased_always_on` behavior | Root sampling strategy. Accepted values are `always_off`, `always_on`, `parentbased_always_on`, `parentbased_traceidratio`, and `traceidratio`. Parent decisions are always preserved. |
| `OTEL_TRACES_SAMPLER_ARG` | No | `1` | Sampling ratio from `0` to `1` for ratio-based samplers. |
| `NEXT_OTEL_VERBOSE` | No | Disabled | Next.js diagnostic instrumentation switch. Set to `1` only temporarily; it creates many internal framework spans. |

`OTEL_EXPORTER_OTLP_TRACES_HEADER` and
`OTEL_EXPORTER_OTLP_LOGS_HEADER` remain supported as deprecated compatibility
aliases. New configuration must use the standard plural `*_HEADERS` names.

For local Belfry:

```dotenv
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:27686"
```

For direct PostHog Cloud US export:

```dotenv
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://us.i.posthog.com/i/v1/traces"
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="https://us.i.posthog.com/i/v1/logs"
OTEL_EXPORTER_OTLP_TRACES_HEADERS="Authorization=Bearer <project-token>"
OTEL_EXPORTER_OTLP_LOGS_HEADERS="Authorization=Bearer <project-token>"
```

Use the EU ingestion host for an EU PostHog project. Header values are
server-only secrets even when the underlying project token may also be used by
the browser.

Static assets, development framework traffic, the PostHog proxy, and other
known-noisy request roots are filtered before export. HTTP query strings and
sensitive request headers are removed from exported span attributes.

## Source maps and releases

Source-map upload happens during a production Next.js build. It uses a personal
API key and project ID; neither is needed at application runtime.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `POSTHOG_API_KEY` | For source-map upload | None | Secret personal API key with the PostHog error-tracking/source-map permission. Build-time only; never expose it as `NEXT_PUBLIC_*`. |
| `POSTHOG_PROJECT_ID` | For source-map upload | None | Numeric PostHog project ID paired with the personal API key. |
| `POSTHOG_UI_HOST` | No | `https://us.posthog.com` | PostHog application host used by the uploader. |
| `POSTHOG_RELEASE_VERSION` | No | `VERCEL_GIT_COMMIT_SHA`, then `GITHUB_SHA` | Stable release identifier shared by source maps, server exceptions, and OTel service version. Prefer the deployed Git SHA. |
| `POSTHOG_SOURCE_MAPS_ENABLED` | No | Automatic | `true` requires both credentials and uploads in production; `false` disables uploads; unset uploads in production when both credentials exist. Uploaded maps are deleted from the build output afterward. |

For Vercel, set `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID` as build
environment variables and let `VERCEL_GIT_COMMIT_SHA` provide the release. In
GitHub Actions, `GITHUB_SHA` is the automatic fallback. Set
`POSTHOG_RELEASE_VERSION` explicitly only when the deploy platform does not
provide a suitable immutable version.

## Platform-managed variables

These variables are consumed but normally should not be written to local
`.env`:

| Variable | Provider | Use |
| --- | --- | --- |
| `NODE_ENV` | Next.js/runtime | Selects development, test, or production behavior. The application treats other or absent values as development during validation. |
| `CI` | CI provider | Enables Playwright's CI retries, forbids focused tests, and prevents reuse of an existing dev server. |
| `VERCEL_ENV` | Vercel | Fallback deployment-environment resource attribute. |
| `VERCEL_GIT_COMMIT_SHA` | Vercel | Preferred automatic release/version fallback. |
| `GITHUB_SHA` | GitHub Actions | Release/version fallback when no explicit or Vercel version exists. |
| `NEXT_RUNTIME` | Next.js | Selects Node.js versus Edge instrumentation registration. Do not set manually. |

## Loading and precedence

The loader resolves `.env` from the repository root rather than from the
current working directory. This makes root commands and direct workspace
commands behave consistently.

Precedence is:

1. Variables already present in the process environment.
2. Values read from root `.env`.
3. Application defaults described above.

Turbo tracks the root `.env` as a build input and tracks output-affecting
public/release variables in its build environment configuration. Secrets used
only to authorize source-map upload pass through without becoming part of the
cache key.

After changing browser-exposed variables, restart the development server.
After changing build-time variables or source-map settings, run a fresh
production build.

## Common problems

- **The app reports a required variable as missing:** confirm the file is
  exactly `<repository>/.env`, not `apps/web/.env`, and that its value is not
  blank.
- **Browser events do not arrive:** set
  `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, restart Next.js, and confirm the PostHog
  region matches the configured hosts.
- **Traces arrive but logs do not:** verify that the log endpoint ends in
  `/i/v1/logs` for direct PostHog export and that
  `OTEL_EXPORTER_OTLP_LOGS_HEADERS` is set.
- **Source maps do not upload:** use a production build, provide both
  `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID`, and keep the personal key
  server/build-only.
- **A deployment ignores `.env`:** this is expected. Configure the same names
  in the deployment platform; platform values take precedence and no checked-in
  production env file is required.
