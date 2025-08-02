# NextCelerator 🚀

A modern, fully-featured Next.js starter template built with the T3 Stack, featuring comprehensive authentication,
beautiful UI components, and developer-first experience.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Database Setup](#database-setup)
- [Authentication System](#authentication-system)
- [Email System](#email-system)
- [API Layer (tRPC)](#api-layer-trpc)
- [UI Components](#ui-components)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

NextCelerator is a production-ready Next.js starter template that combines the power of the T3 Stack with modern authentication using Better Auth. It provides a solid foundation for building web applications with features like user authentication, session management, email verification, account settings, and more.

**Author**: Endalkachew Biruk ([@endalk200](https://github.com/endalk200))

## Tech Stack

### Core Framework

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5.8** - Type-safe JavaScript

### Backend & Database

- **tRPC 11** - End-to-end typesafe APIs
- **Prisma 6.5** - Type-safe database ORM
- **PostgreSQL** - Production database
- **Zod 3.25** - Runtime type validation

### Authentication

- **Better Auth 1.3** - Modern authentication library
- **Session Management** - Secure cookie-based sessions
- **Social Auth** - Google & GitHub OAuth integration
- **Email Verification** - Built-in email verification system

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icon library
- **next-themes** - Dark/light theme support

### Developer Experience

- **TypeScript** - Full type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **pnpm 9.12** - Fast package manager

### Email

- **React Email** - JSX email templates
- **Resend** - Email delivery service

## Features

### 🔐 Authentication System

- **Email/Password Authentication** with secure password requirements
- **Social Authentication** (Google, GitHub)
- **Email Verification** with custom templates
- **Password Reset** functionality
- **Session Management** with automatic refresh
- **Account Linking** - Link multiple auth providers
- **Account Deletion** with email confirmation

### 🎨 Modern UI/UX

- **Dark/Light Theme** support with system preference detection
- **Responsive Design** optimized for all devices
- **Beautiful Components** using shadcn/ui
- **Loading States** and error handling
- **Toast Notifications** for user feedback

### 📧 Email System

- **Verification Emails** for new accounts
- **Password Reset Emails**
- **Email Change Verification**
- **Account Deletion Confirmation**
- **Responsive Email Templates** using React Email

### 🛡️ Security Features

- **CSRF Protection** built into Better Auth
- **Secure Session Handling** with httpOnly cookies
- **Email Verification Required**
- **Rate Limiting** on sensitive operations
- **Middleware Protection** for authenticated routes

### 📊 Dashboard & Settings

- **User Dashboard** with account overview
- **Account Settings** page with:
    - Profile information management
    - Password change functionality
    - Email change with verification
    - Active session management
    - Account linking/unlinking
    - Account deletion

### 🚀 Developer Experience

- **Type Safety** throughout the entire stack
- **Hot Reload** with Turbo mode
- **Database Management** with Prisma Studio
- **API Documentation** via tRPC
- **Environment Validation** with zod

## Prerequisites

- **Node.js** v21.6.0 or higher
- **pnpm** v9.12.3 or higher
- **PostgreSQL** database (local or cloud)
- **Git** for version control

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/endalk200/nextcelerator.git
cd nextcelerator
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the environment variables template:

```bash
cp .env.example .env
```

Configure your `.env` file with the required variables (see [Environment Variables](#environment-variables) section).

### 4. Database Setup

```bash
# Push schema to your database
pnpm db:push

# Or run migrations (for production)
pnpm db:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application running.

## Project Structure

```bash
nextcelerator/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── _components/         # Shared app components
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Better Auth API endpoint
│   │   │   └── trpc/            # tRPC API endpoint
│   │   ├── dashboard/           # Protected dashboard pages
│   │   │   ├── settings/        # Account settings
│   │   │   └── delete-account/  # Account deletion
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── signin/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing page
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── app-sidebar.tsx      # Application sidebar
│   │   └── theme-provider.tsx   # Theme context provider
│   ├── emails/                  # Email templates
│   │   ├── components/          # Email-specific components
│   │   ├── verify-email.tsx
│   │   ├── reset-password.tsx
│   │   ├── change-email-verification.tsx
│   │   └── delete-account-confirmation.tsx
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   │   ├── auth/                # Authentication setup
│   │   │   ├── auth.ts          # Better Auth server config
│   │   │   ├── auth-client.ts   # Better Auth client config
│   │   │   └── index.ts
│   │   ├── utils/               # Utility functions
│   │   └── email.ts             # Email service functions
│   ├── server/                  # Server-side code
│   │   ├── api/                 # tRPC API layer
│   │   │   ├── routers/         # API route definitions
│   │   │   │   └── account.ts   # Account management endpoints
│   │   │   ├── root.ts          # Main API router
│   │   │   └── trpc.ts          # tRPC setup
│   │   └── db.ts                # Database connection
│   ├── styles/                  # Styling
│   │   └── globals.css          # Global styles & Tailwind
│   ├── trpc/                    # tRPC client setup
│   │   ├── react.tsx            # React Query integration
│   │   ├── server.ts            # Server-side client
│   │   └── query-client.ts      # Query client configuration
│   ├── env.js                   # Environment variable validation
│   └── middleware.ts            # Next.js middleware
├── prisma/                      # Database schema & migrations
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── public/                      # Static assets
└── [config files]               # Various configuration files
```

## Database Setup

### Schema Overview

The database uses PostgreSQL with Prisma ORM and includes these main models:

- **User** - User accounts with profile information
- **Session** - User sessions with expiration tracking
- **Account** - Linked authentication providers
- **Verification** - Email verification tokens
- **Post** - Example content model (from T3 template)

### Key Models

```prisma
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  // ... additional fields
}
```

### Database Commands

```bash
# Push schema changes to database (development)
pnpm db:push

# Generate and run migrations (production)
pnpm db:generate
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio

# Reset database (careful!)
npx prisma migrate reset
```

## Authentication System

### Better Auth Configuration

NextCelerator uses Better Auth for a comprehensive authentication system:

#### Server Configuration (`src/lib/auth/auth.ts`)

- **Database Integration** via Prisma adapter
- **Email/Password Authentication** with verification required
- **Social Authentication** (Google, GitHub)
- **Session Management** with 7-day expiration
- **Email Verification** with custom callbacks
- **Account Linking** support
- **Account Deletion** with confirmation workflow

#### Client Configuration (`src/lib/auth/auth-client.ts`)

Exports all authentication functions:

- `signIn`, `signUp`, `signOut`
- `useSession` React hook
- `forgetPassword`, `resetPassword`
- `changeEmail`, `changePassword`
- `deleteUser`, `updateUser`
- `listSessions`, `revokeSession`
- Social account linking/unlinking

### Authentication Flow

1. **Sign Up**: User creates account → Email verification sent → Account activated
2. **Sign In**: Credentials verified → Session created → Redirect to dashboard
3. **Password Reset**: Email sent → Token validated → Password updated → Sessions revoked
4. **Email Change**: Verification sent to current email → New email verified → Email updated
5. **Account Deletion**: Confirmation email → Token validated → Account permanently deleted

### Route Protection

Protected routes use Next.js middleware (`src/middleware.ts`):

```typescript
// Redirects unauthenticated users to sign-in
if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }
}
```

## Email System

### Email Templates

Built with React Email for responsive, accessible templates:

1. **Email Verification** (`verify-email.tsx`) - Welcome & account activation
2. **Password Reset** (`reset-password.tsx`) - Secure password reset
3. **Email Change** (`change-email-verification.tsx`) - Email change confirmation
4. **Account Deletion** (`delete-account-confirmation.tsx`) - Account deletion warning

### Email Service (`src/lib/email.ts`)

Uses Resend for reliable email delivery:

```typescript
// Send verification email
await sendVerificationEmail({
    user: { email: "user@example.com", name: "John" },
    url: "https://app.com/verify?token=...",
    token: "verification-token",
});
```

### Email Configuration

- **From Address**: `NextCelerator <support@support.endalk200.com>`
- **Provider**: Resend API
- **Templates**: React Email components with inline styles
- **Error Handling**: Graceful fallbacks with logging

## Environment Variables

### Required Variables

Create a `.env` file with these variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nextcelerator"

# Better Auth
BETTER_AUTH_SECRET="your-32-character-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Social Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email Service
RESEND_API_KEY="your-resend-api-key"

# Environment
NODE_ENV="development"
```

### Environment Validation

Uses `@t3-oss/env-nextjs` for runtime validation:

- **Type Safety** - Environment variables are typed
- **Validation** - Zod schemas ensure correct values
- **Build Safety** - Build fails with invalid environment

## API Layer (tRPC)

### tRPC Setup

Located in `src/server/api/trpc.ts` with:

- **Context Creation** with session and database access
- **Authentication Middleware** for protected procedures
- **Error Formatting** with Zod validation errors
- **Development Timing** middleware with artificial delays

### Available Procedures

#### Account Router (`src/server/api/routers/account.ts`)

- `getUserInfo` - Get user profile information
- `getLinkedAccounts` - List connected authentication providers
- `getAuthProviders` - Check available auth methods
- `setPassword` - Set password for social auth users

### Usage Examples

```typescript
// Client-side usage
const { data: userInfo } = api.account.getUserInfo.useQuery();

// Server-side usage
const userInfo = await api.account.getUserInfo();
```

### Type Safety

Full end-to-end type safety from database to frontend:

```typescript
// Automatically typed based on tRPC procedures
type UserInfo = RouterOutputs["account"]["getUserInfo"];
```

## UI Components

### shadcn/ui Integration

NextCelerator uses shadcn/ui with the "New York" style:

- **Design System**: Consistent, accessible components
- **Customization**: Easy theme customization via CSS variables
- **Dark Mode**: Built-in dark/light theme support

### Key Components Used

- **Forms** - React Hook Form with Zod validation
- **Data Display** - Cards, badges, tables
- **Navigation** - Sidebar, breadcrumbs, dropdowns
- **Feedback** - Toast notifications, loading states, alerts
- **Overlays** - Modals, tooltips, sheets

### Theme Configuration

```typescript
// Dark theme by default with system preference detection
<ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem
  storageKey="nextcelerator-theme"
>
```

## Development Workflow

### Code Quality

- **TypeScript** - Strict mode enabled with `noUncheckedIndexedAccess`
- **ESLint** - Next.js recommended rules + TypeScript ESLint
- **Prettier** - Code formatting with Tailwind CSS plugin
- **Husky** - Git hooks for pre-commit checks (if configured)

### Database Development

1. **Schema Changes** - Modify `prisma/schema.prisma`
2. **Push Changes** - `pnpm db:push` for development
3. **Generate Migrations** - `pnpm db:generate` for production
4. **Studio** - `pnpm db:studio` for visual database management

### Testing Email Templates

```typescript
// Render email template to HTML for testing
const html = await renderEmailToHtml("verify", {
    username: "Test User",
    verificationUrl: "https://example.com/verify",
});
```

## Scripts

### Development

```bash
pnpm dev              # Start development server with Turbo
pnpm check            # Run linting and type checking
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm typecheck        # Run TypeScript compiler
```

### Database

```bash
pnpm db:push          # Push schema to database (dev)
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations (production)
pnpm db:studio        # Open Prisma Studio
```

### Formatting

```bash
pnpm format:check     # Check code formatting
pnpm format:write     # Format code
```

### Production

```bash
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Build and start production server
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub** - Ensure your code is in a GitHub repository
2. **Connect to Vercel** - Import your repository on Vercel
3. **Environment Variables** - Add all required environment variables in Vercel dashboard
4. **Database** - Use a cloud PostgreSQL provider (Neon, Supabase, Railway)
5. **Deploy** - Vercel automatically builds and deploys

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify** - Full Next.js support
- **Railway** - Includes database hosting
- **DigitalOcean App Platform** - Easy container deployment
- **Docker** - Use the included Dockerfile (if present)

### Environment Setup

Ensure these environment variables are set in production:

- Set `NODE_ENV=production`
- Use production database URL
- Configure proper `BETTER_AUTH_URL` with your domain
- Use production API keys for email and social auth

## Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the existing code style
4. **Run tests and linting** (`pnpm check`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- **Follow TypeScript best practices**
- **Use existing UI components** when possible
- **Write meaningful commit messages**
- **Add proper error handling**
- **Test your changes thoroughly**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by [Endalkachew Biruk](https://endalk200.com)**

For questions or support, please open an issue on GitHub or reach out on social media.
