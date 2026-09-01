# Plan 002: Set theme-color meta to match the active theme on first paint

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: This plan was written against a working tree
> that contained uncommitted changes on top of commit `2d317f3`. Run
> `git status --short` and compare the "Current state" excerpts below against
> the live code in each listed file. On a mismatch, treat it as a STOP
> condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `2d317f3`, 2026-09-01

## Why this matters

The browser UI (Safari/Chrome toolbar on mobile and desktop) is tinted via
the `theme-color` meta tag. Today it is hardcoded to the light background
color, and it is only updated when the user clicks the theme toggle. A user
whose system prefers dark (or who previously saved dark) gets a light
browser bar over the dark page on every load — a visible, recurring glitch
for dark-mode visitors, which on a portfolio is exactly the first impression
you don't want.

## Current state

- `app/layout.tsx` — root layout. Three relevant pieces (excerpt):

  ```tsx
  // app/layout.tsx:36-38
  export const viewport: Viewport = {
    themeColor: "#faf8f2",
  };

  // app/layout.tsx:42 — inline script that applies the saved/system theme
  // BEFORE first paint (runs in <head>):
  const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

  // app/layout.tsx:51-54 — the scripts are injected into <head>
  //   <head>
  //     <script dangerouslySetInnerHTML={{ __html: jsClassScript }} />
  //     <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  //   </head>
  ```

  Next.js renders `viewport.themeColor` as
  `<meta name="theme-color" content="#faf8f2">` in the head.

- `components/theme-toggle.tsx` — the client toggle. On click it flips the
  `dark` class, saves to localStorage, and updates the meta tag (excerpt):

  ```tsx
  // components/theme-toggle.tsx:24-33
  function toggle() {
    const next = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next ? themeColors.dark : themeColors.light);
    window.dispatchEvent(new Event("themechange"));
  }

  // components/theme-toggle.tsx:6
  const themeColors = { light: "#faf8f2", dark: "#0b0b0b" } as const;
  ```

  So the toggle path is already correct — only the initial load is wrong.

- Theme colors are defined in two places that must stay in sync:
  `app/globals.css` (`--background: oklch(0.977 0.005 85)` ≈ `#faf8f2` in
  light; `--background: #0b0b0b` in dark) and the hex literals in
  `theme-toggle.tsx:6` and `layout.tsx:37`. This plan keeps that existing
  (slightly duplicated) arrangement — do not refactor the color system.

- The repo's AGENTS.md warns that this Next.js version (16.3.3) may differ
  from training-data conventions. Before editing, skim
  `node_modules/next/dist/docs/` for the `viewport`/`themeColor` export if
  anything below errors on typecheck.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm exec tsc --noEmit` | exit 0, no output   |
| Lint      | `pnpm exec eslint .`     | exit 0, no output   |
| Build     | `pnpm build`             | exit 0              |
| Dev server (manual check) | `pnpm dev` | serves at http://localhost:3000 |

## Scope

**In scope** (the only files you should modify):
- `app/layout.tsx`

**Out of scope** (do NOT touch, even though they look related):
- `components/theme-toggle.tsx` — its toggle behavior is already correct;
  keep its meta-selector (`'meta[name="theme-color"]'`) working unchanged.
- `app/globals.css` — theme variables stay as they are.
- Do NOT switch to Next's `viewport.themeColor` media-query array form —
  that renders **two** meta tags, which would break the toggle's
  `querySelector('meta[name="theme-color"]')` single-match update.

## Git workflow

- Branch: `advisor/002-theme-color-first-paint`
- Commit style: one-line imperative summary, e.g.
  `Set theme-color meta to match active theme before first paint`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extend the inline theme script to set the meta tag

In `app/layout.tsx`, replace the `themeScript` constant (line 42) with a
version that, after toggling the class, also updates the theme-color meta.
Keep the same style: single-line IIFE, defensive try/catch, no dependencies.
Target shape:

```ts
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#0b0b0b":"#faf8f2")}catch(e){}})()`;
```

Requirements for the final code:
- The class-toggle logic must be byte-identical in behavior to the current
  script (saved `theme` key wins; else `prefers-color-scheme`).
- The meta update must be inside the same `try` block, after the class
  toggle, so it runs before first paint.
- The hex values must be exactly `#0b0b0b` (dark) and `#faf8f2` (light),
  matching `themeColors` in `components/theme-toggle.tsx:6`.
- Leave `export const viewport` with its light default `#faf8f2` unchanged —
  it is the correct static fallback and what the SSR HTML contains.

**Verify**: `pnpm exec tsc --noEmit` → exit 0, no output.
**Verify**: `pnpm exec eslint .` → exit 0, no output (in particular no
`react/no-danger` or quote-escaping errors from the template literal).

### Step 2: Verify the rendered head

**Verify**: `pnpm build` → exit 0.
**Verify**: `grep -c 'name="theme-color"' .next/server/app/index.html` (or
the prerendered HTML under `.next/server/app/` if the path differs) →
returns exactly `1` — one single meta tag, so the toggle's querySelector
keeps working.

### Step 3: Manual behavioral check (dev server)

Run `pnpm dev`, open http://localhost:3000, and confirm:

1. With OS appearance set to **dark** and no saved theme: page renders dark
   AND the browser chrome bar is dark (check the rendered
   `meta[name=theme-color]` content is `#0b0b0b` via devtools).
2. Click the toggle: page flips to light AND the meta content becomes
   `#faf8f2`.
3. Reload with the saved light theme: meta is `#faf8f2` immediately.

**Verify**: all three observations hold. If step 1 shows a light bar while
the page is dark, the script is not updating the meta before paint — recheck
that the meta update line is inside the `try` and the script tag is still
before `</head>`.

## Test plan

No test framework exists in this repo; none is to be added by this plan.
Verification is the gates above plus the manual check in Step 3.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm exec eslint .` exits 0
- [ ] `pnpm build` exits 0
- [ ] Prerendered HTML contains exactly one `theme-color` meta tag
- [ ] `app/layout.tsx` contains `#0b0b0b` inside `themeScript` (dark value
      applied at load)
- [ ] `components/theme-toggle.tsx` is unmodified (`git status`)
- [ ] No files outside the in-scope list are modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts in "Current state" do not match the live code (drift).
- `pnpm exec tsc --noEmit` fails on the `viewport` export in a way that
  suggests this Next version changed the Metadata/Viewport API — read the
  docs at `node_modules/next/dist/docs/` first, and if the API truly
  differs, STOP rather than redesigning the approach.
- The prerendered HTML contains zero or multiple `theme-color` meta tags
  after your change (the toggle depends on exactly one).
- You find yourself wanting to change `components/theme-toggle.tsx` or the
  color variables in `globals.css`.

## Maintenance notes

- The theme hex values now live in three places (`globals.css`, the
  `themeScript` string, and `theme-toggle.tsx:6`). If the background color
  ever changes, all three must change together — a reviewer should check
  this in any PR that touches theme colors. Consolidating them (e.g.
  reading a CSS variable in the script) was deliberately deferred as it
  complicates the no-flash inline script.
- If a third theme is ever added, both the script and the toggle need
  restructuring — flag it to the owner rather than improvising.
