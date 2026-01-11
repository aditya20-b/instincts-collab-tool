# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Instincts Collab Tool** - a self-service management dashboard for the Instincts 2026 website repository. It allows authenticated GitHub collaborators to manage Vercel deployments, environment variables, and view repository information.

## Tech Stack

- **Next.js 16.1.1** with App Router and React 19
- **TypeScript** (strict mode)
- **Tailwind CSS 4** via PostCSS
- **NextAuth 4** with GitHub OAuth
- **Octokit** for GitHub API
- Custom Vercel API wrapper in `/lib/vercel.ts`

## Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint
```

## Architecture

### Authentication Flow
1. User authenticates via GitHub OAuth (NextAuth at `/api/auth/[...nextauth]`)
2. Session provider wraps the app (`/components/SessionProvider.tsx`)
3. API routes validate session with `getServerSession(authOptions)` from `/lib/auth.ts`
4. Dashboard access requires user to be a collaborator on the target GitHub repo

### API Structure
All API routes are in `/app/api/` and follow a RESTful pattern:

- **GitHub APIs**: `/api/check-collaborator`, `/api/add-collaborator`, `/api/collaborators`, `/api/commits`, `/api/stats`
- **Vercel APIs**: `/api/vercel/deployments`, `/api/vercel/env`, `/api/vercel/redeploy`, `/api/vercel/rollback`, `/api/vercel/projects`

API responses follow this pattern:
```typescript
// Success: { success: true, data: {...} }
// Error: { error: "message" }
```

### Component Pattern
All components in `/components/` are client components (marked with `"use client"`). They fetch data from API routes and manage their own loading/error states.

### External Integrations
- **GitHub API**: Via Octokit in API routes, uses `GITHUB_PAT` for repo access
- **Vercel API**: Via wrapper in `/lib/vercel.ts`, uses `VERCEL_TOKEN`

## Key Files

- `/lib/auth.ts` - NextAuth configuration with GitHub provider
- `/lib/vercel.ts` - Complete Vercel API wrapper (deployments, env vars, projects)
- `/app/page.tsx` - Main dashboard with authentication gate and tab navigation

## Environment Variables

Required in `.env.local` (see `.env.example`):

```
GITHUB_CLIENT_ID          # GitHub OAuth App client ID
GITHUB_CLIENT_SECRET      # GitHub OAuth App secret
GITHUB_PAT                # Personal Access Token with 'repo' scope
NEXTAUTH_SECRET           # Random secret for NextAuth
NEXTAUTH_URL              # App URL (http://localhost:3000 for dev)
GITHUB_REPO_OWNER         # Target repo owner (aditya20-b)
GITHUB_REPO_NAME          # Target repo name (instincts-website-2026)
VERCEL_TOKEN              # Vercel API token
TARGET_VERCEL_PROJECT     # Vercel project name
```

## Path Alias

The `@/*` alias maps to the project root, so `@/lib/auth` imports from `/lib/auth.ts`.
