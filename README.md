# face

Personal portfolio site for Oussama Nahiz, drawn in blue ballpoint and built
with Next.js App Router.

## Stack

- Next.js 16 (App Router)
- React 19
- Motion
- Tailwind CSS 4
- TypeScript
- ESLint 9
- Kalam (via `next/font`)

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

- `lib/sketch.ts` — seeded stroke geometry (boxes, underlines, loops, hatching,
  arrows, the theme-change ink blot). Same seed, same wobble, on server and client.
- `components/ink/` — SVG primitives built on it. Strokes use `pathLength=1`
  and draw themselves in when their `Reveal` scrolls into view, on hover, or
  when an expandable opens (see the "Sketch strokes" and "Reveal" sections of
  `app/globals.css`).
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
- `public/paper.svg` — the seamless paper tile (tooth, fibres, specks).
- `components/paper-doodles.tsx` — drag on empty paper (mouse or pen) to leave
  ink that fades after a few seconds.

## Structure

- `app/` — routes, layout, global styles (theme tokens live in `app/globals.css`)
- `components/` — UI components (server components where possible; `"use client"` only where interactivity is needed)
- `components/ink/` — sketch primitives (strokes, boxes, glyphs, headings, links)
- `lib/` — site content (`content.ts`), stroke geometry (`sketch.ts`), data helpers
- `assets/` — fonts and art used only by the generated Open Graph image
