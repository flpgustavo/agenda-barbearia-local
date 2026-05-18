# Technology Stack

**Analysis Date:** 2026-04-16

## Languages

**Primary:**
- TypeScript 5.x - All application code (React components, services, hooks, models)
- JavaScript - Service Worker for PWA (`src/app/sw.ts`)

**Secondary:**
- CSS - Global styles with Tailwind CSS v4 (`src/app/globals.css`)

## Runtime

**Environment:**
- Node.js 20.x (based on `@types/node`)

**Package Manager:**
- npm (based on package.json structure)
- Lockfile: Not detected (no package-lock.json in root)

## Frameworks

**Core:**
- Next.js 15.5.2 - Full-stack React framework with App Router
- React 19.2.3 - UI library
- React DOM 19.2.3 - React renderer for the browser

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind
- tw-animate-css 1.4.0 - Animation utilities
- class-variance-authority 0.7.1 - Class variance utility for component variants
- clsx 2.1.1 - Conditional class names utility
- tailwind-merge 3.4.0 - Merge Tailwind classes without conflicts

**UI Components:**
- Radix UI 1.4.3 - Unstyled, accessible UI primitives
  - @radix-ui/react-dialog - Modal/dialog component
  - @radix-ui/react-dropdown-menu - Dropdown menus
  - @radix-ui/react-select - Select dropdowns
  - @radix-ui/react-popover - Popover component
  - @radix-ui/react-avatar - Avatar component
  - @radix-ui/react-progress - Progress bar
  - @radix-ui/react-radio-group - Radio button groups
  - @radix-ui/react-scroll-area - Scrollable container
  - @radix-ui/react-separator - Horizontal separator
  - @radix-ui/react-slot - Slot component for composition
  - @radix-ui/react-label - Label component
  - @radix-ui/react-alert-dialog - Alert dialog
- cmdk 1.1.1 - Command palette component
- vaul 1.1.2 - Drawer component for mobile-first UI

**Animation:**
- framer-motion 12.23.26 - Motion library for React animations

**Icons:**
- lucide-react 0.555.0 - Icon library

**Data Fetching:**
- @tanstack/react-query 5.91.3 - Async state management and caching
- @tanstack/react-query-devtools 5.91.3 - React Query DevTools

**Database:**
- dexie 4.2.1 - Wrapper for IndexedDB
- dexie-react-hooks 4.2.0 - React hooks for Dexie

**PWA:**
- @serwist/next 9.2.3 - Service Worker integration for Next.js
- @serwist/precaching 9.2.3 - Precaching for Service Worker
- @serwist/sw 9.2.3 - Service Worker core

**Theming:**
- next-themes 0.4.6 - Theme management for Next.js

**Forms/Validation:**
- react-imask 7.6.1 - Input mask library

**Utilities:**
- date-fns 4.1.0 - Date manipulation library
- uuid 13.0.0 - UUID generation
- sonner 2.0.7 - Toast notifications

**Build/Dev:**
- @opennextjs/cloudflare 1.16.5 - Cloudflare Pages adapter for Next.js
- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- eslint 9 - JavaScript/TypeScript linter
- eslint-config-next 16.0.5 - Next.js ESLint configuration
- serwist 9.2.3 - Service Worker types
- baseline-browser-mapping 2.9.0 - Browser compatibility mapping for linting
- cypress 15.8.0 - E2E testing framework

## Configuration Files

**Build:**
- `next.config.ts` - Next.js configuration with Serwist PWA plugin, standalone output, unoptimized images, ignores build errors for TypeScript/ESLint
- `postcss.config.mjs` - PostCSS with @tailwindcss/postcss plugin
- `open-next.config.ts` - Cloudflare Pages deployment configuration
- `tsconfig.json` - TypeScript config with ES2017 target, bundler module resolution, webworker lib, @/* path alias

**Testing:**
- `cypress.config.ts` - Cypress E2E testing configuration

**Root files:**
- `eslint.config.mjs` - ESLint flat config

## Platform Requirements

**Development:**
- Node.js 20.x or higher
- npm for package management

**Production:**
- Next.js standalone output mode
- Deployment target: Cloudflare Pages (via @opennextjs/cloudflare)
- Service Worker for PWA offline capability

---

*Stack analysis: 2026-04-16*