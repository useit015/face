# Plan 004: Replace boilerplate README with real project documentation

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: This plan was written against a working tree
> that contained uncommitted changes on top of commit `2d317f3`. Run
> `git status --short` and compare the "Current state" facts below against
> the live repo (README.md content, scripts in package.json). On a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `2d317f3`, 2026-09-01

## Why this matters

`README.md` is the untouched create-next-app template: it tells a reader to
edit `app/page.tsx`, mentions npm/yarn/bun interchangeably, and describes
the default Geist-font scaffold. This repo is a personal portfolio site with
a specific stack (pnpm, Tailwind 4, Motion, external GitHub/contribution
APIs) and a known set of scripts. A wrong README actively misleads anyone
(opening a PR, an executor agent, or the owner in six months) about how to
run and deploy the project.

## Current state

- `README.md` — 36 lines of stock template text. It contains no
  project-specific information. Entire file to be replaced.
- `package.json` — the authoritative scripts (excerpt):

  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "packageManager": "pnpm@11.8.0"
  ```

  There is **no** typecheck script; typechecking is done with
  `pnpm exec tsc --noEmit`.
- `pnpm-workspace.yaml` exists with `allowBuilds` entries (sharp, unrs-resolver
  set to false) — pnpm is the only supported package manager.
- Stack facts verified during recon: Next.js `16.3.3` (App Router),
  React `19.2.8`, `motion` (Framer Motion successor) `^13.1.1`,
  Tailwind CSS `^4` via `@tailwindcss/postcss`, `lucide-react` +
  `react-icons` for icons, TypeScript `^5`, ESLint `^9` with
  `eslint-config-next`.
- Deployment target: Vercel is the assumed default for create-next-app
  projects, but no deployment config exists in the repo — the README should
  say "deploys as a standard Next.js app" without claiming a specific host
  beyond mentioning `next build`/`next start`.
- Runtime data dependencies (document these): GitHub REST API
  (`api.github.com`, repo stars, unauthenticated, 1-hour ISR cache) and the
  jogruber.de GitHub contributions API (contribution graph, same cache).
  Both degrade gracefully to zero/empty on failure — worth one sentence in
  the README.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Lint      | `pnpm exec eslint .`     | exit 0, no output   |
| Build     | `pnpm build`             | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `README.md` (full rewrite)

**Out of scope** (do NOT touch):
- `package.json` — do not add a typecheck script or any other script as
  part of a docs plan.
- `CLAUDE.md` / `AGENTS.md` — agent-instruction files; `CLAUDE.md` is a
  one-line pointer to `AGENTS.md` and `AGENTS.md` is auto-managed by
  `next dev`.
- Any source file, config, or CI definition.

## Git workflow

- Branch: `advisor/004-readme`
- Commit style: one-line imperative summary, e.g.
  `Replace boilerplate README with project-specific docs`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Rewrite README.md

Replace the entire file with the structure below. Keep it under ~60 lines;
this is a small project and an over-long README is its own failure mode.
Use the exact facts from "Current state" — do not invent commands, versions,
or scripts that are not in `package.json`.

Required sections, in order:

1. **Title + one-liner**: `# face` followed by a single sentence:
   "Personal portfolio site for Oussama Nahiz, built with Next.js App
   Router."
2. **Stack**: bullet list — Next.js 16 (App Router), React 19, Motion,
   Tailwind CSS 4, TypeScript, ESLint 9. State icons come from
   lucide-react and react-icons.
3. **Development**:
   ```bash
   pnpm install
   pnpm dev
   ```
   then: open http://localhost:3000. Note pnpm is required
   (`packageManager: pnpm@11.8.0`).
4. **Verification / production**: document exactly these commands and what
   they do:
   - `pnpm exec eslint .` — lint
   - `pnpm exec tsc --noEmit` — typecheck (no script exists; call it out)
   - `pnpm build` — production build
   - `pnpm start` — serve the production build
5. **Data sources**: two sentences — star counts come from the GitHub REST
   API and the contribution graph from the jogruber.de contributions API,
   both cached for 1 hour via Next.js ISR and both degrading silently to
   empty values if unavailable.
6. **Structure**: 3–5 bullets mapping directories to purpose:
   - `app/` — routes, layout, global styles (Tailwind theme tokens live in
     `app/globals.css`)
   - `components/` — UI components (server components where possible;
     `"use client"` only where interactivity is needed)
   - `lib/` — site content (`content.ts`) and data helpers (`stars.ts`)
   - `plans/` — improvement plans (only mention if the directory exists in
     the final tree)

Style constraints: no emojis, no badges, no license section (the repo has
none), no table of contents. Markdown, sentence-case headings.

**Verify**: `grep -c "create-next-app\|npm run dev\|yarn dev\|bun dev" README.md` → `0`
(no template text survives).

### Step 2: Final gates

**Verify**: `pnpm build` → exit 0 (README changes cannot break the build;
this gate proves nothing else was touched).
**Verify**: `git status --short` → only `README.md` is modified relative to
what was already dirty before you started, plus nothing new.

## Test plan

No tests — documentation-only plan. Verification is the grep gate in Step 1
and the build gate in Step 2.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "create-next-app\|npm run dev\|yarn dev\|bun dev" README.md` returns `0`
- [ ] `grep -c "pnpm exec tsc --noEmit" README.md` returns `1`
- [ ] `grep -c "jogruber" README.md` returns `1`
- [ ] `pnpm build` exits 0
- [ ] No files other than `README.md` were changed by you (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `package.json` scripts differ from the excerpt above (drift) — the README
  must never document scripts that don't exist.
- The `plans/` directory no longer exists (section 6 depends on it).
- You cannot verify a stack fact from "Current state" against the repo
  (e.g. versions changed) — use the value you can verify from
  `package.json`, and if that conflicts with this plan, STOP and report.

## Maintenance notes

- The README states pnpm and specific major versions; bump them in the same
  commit as any dependency major upgrade so the docs never lag.
- If a `typecheck` script is ever added to `package.json`, update the README
  to use `pnpm typecheck` instead of the direct `tsc` invocation.
