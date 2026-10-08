# face

Personal portfolio site for Oussama Nahiz, drawn in blue ballpoint and built
with Next.js App Router.

## Stack

- Next.js 16 (App Router)
- React 19
- [Ballpoint](https://ballpoint.st9wd.com) components on Base UI, installed
  with the shadcn CLI from the `@ballpoint` registry (`components.json`)
- Tailwind CSS 4
- TypeScript
- ESLint 9
- Gaegu (Latin subset, self-hosted in `app/fonts/`)

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

## How the drawing works

- `components/ui/`, `lib/ink*.ts(x)`, `hooks/use-ink-box.ts` — Ballpoint, as
  `shadcn add @ballpoint/<name>` installed it: buttons, the timeline, section
  headings, the contribution grid, frames, tooltips, the theme toggle and the
  engine they share (seeded strokes, same wobble on server and client, drawn
  in as they scroll into view). They're this repo's code now; local changes
  are noted where they're made. Update one with
  `pnpm dlx shadcn@latest add @ballpoint/<name> --overwrite`.
- `app/globals.css` — Ballpoint's base (tokens, stroke and handwriting CSS),
  then this page's own: the paper, the glyph atlas, and the hero's load
  choreography, which runs in CSS alone so it never waits for the script.
- `components/` — the page's sections built from those parts, plus its own
  pieces: the expanding sections (`expandable.tsx`, which flies shared items
  between the short and full versions), the footer signature and flicks
  (`marks.tsx`), the cursor-following portrait, and the paper doodles.
- `public/ink/glyphs.webp` (+ `glyphs@3x.webp`), `public/ink/projects.webp` —
  hand-drawn icons packed into alpha-mask atlases (index in `lib/ink-atlas.json`),
  rendered with `mask-image` so they take the current ink colour in either theme.
- `public/avatar/ink/sheet-{light,dark}.webp` — the `<cursor-avatar>` portrait:
  nine ballpoint poses redrawn from the original photo sheet, stored as ink
  masks with the backdrop hatching baked in and knocked out around the figure,
  so nothing shows through the face. Light is blue ink on paper; dark is its
  own white-ink drawing on the night paper (the light drawn in pale strokes,
  hair and shadows left as paper). Both follow the
  cursor together and theme CSS picks one. `still-*.webp` are the centre pose,
  rendered on the server until the sheets load.
- `public/paper/` — Ballpoint's pre-painted paper: a fine tooth over soft
  crinkle relief, calibrated so each averages out to its theme's `--paper`.
  Painted on the root, so the paper scrolls with the page.
- `components/paper-doodles.tsx` — the cursor turns into a pen over empty paper;
  drag (mouse or stylus) to leave grainy ballpoint ink that dries and fades.

## Structure

- `app/` — routes, layout, global styles (theme tokens live in `app/globals.css`)
- `components/` — the page's sections (server components where possible; `"use client"` only where interactivity is needed)
- `components/ui/` — Ballpoint components
- `lib/` — site content (`content.ts`), Ballpoint's stroke engine (`ink-sketch.ts`, `ink.tsx`), data helpers
- `assets/` — fonts and art used only by the generated Open Graph image
