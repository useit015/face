# face

Personal portfolio site for Oussama Nahiz, built with Next.js App Router.

## Stack

- Next.js 16 (App Router)
- React 19
- Motion
- Tailwind CSS 4
- TypeScript
- ESLint 9
- Icons from lucide-react and react-icons

## Development

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000. pnpm is required
(`packageManager: pnpm@11.8.0`); other package managers are not supported.

## Verification and production

```bash
pnpm exec eslint .     # lint
pnpm exec tsc --noEmit # typecheck (no typecheck script exists)
pnpm build             # production build
pnpm start             # serve the production build
```

## Data sources

Star counts come from the GitHub REST API, and the contribution graph comes
from the jogruber.de contributions API. Both are cached for 1 hour via
Next.js ISR and degrade silently to empty values if unavailable.

## Structure

- `app/` — routes, layout, global styles (Tailwind theme tokens live in `app/globals.css`)
- `components/` — UI components (server components where possible; `"use client"` only where interactivity is needed)
- `lib/` — site content (`content.ts`) and data helpers (`stars.ts`)
