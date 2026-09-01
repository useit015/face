# Plan 003: Make contribution-graph cells keyboard-accessible and screen-reader labeled

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

- **Priority**: P2
- **Effort**: S-M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (accessibility)
- **Planned at**: commit `2d317f3`, 2026-09-01

## Why this matters

The contribution graph renders ~365 day cells as plain `<div>`s whose
tooltip text ("3 contributions on Feb 2nd, 2026") exists only in a
mouse-hover state, and the tooltip element is `aria-hidden`. Keyboard users
can never see a day's value, and screen readers get no information at all
about any day. The graph is inside a link to the GitHub profile, so
screen-reader users currently hear just "link, View GitHub profile" with no
idea what data it shows. This plan gives each day an accessible name and
makes the tooltip work on keyboard focus as well as hover.

## Current state

- `components/contribution-cells.tsx` — client component rendering the
  cells and the tooltip (excerpt, the core of the problem):

  ```tsx
  // components/contribution-cells.tsx:36-40
  function tooltipText(day: ContributionDay) {
    const date = formatDay(day.date);
    if (day.count === 0) return `No contributions on ${date}`;
    return `${day.count} ${day.count === 1 ? "contribution" : "contributions"} on ${date}`;
  }

  // components/contribution-cells.tsx:52-72 (inside the weeks map)
  day ? (
    <div
      key={day.date}
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = Math.min(Math.max(r.left + r.width / 2, 90), window.innerWidth - 90);
        setTip({ x, y: r.top, text: tooltipText(day) });
      }}
      onMouseLeave={() => setTip(null)}
      className={`size-[10px] rounded-[2px] squircle ${LEVEL_CLASS[day.level]} transition-[box-shadow] duration-100 hover:ring-1 hover:ring-foreground/50`}
    />
  ) : (
    <div key={`${wi}-${di}`} className="size-[10px]" />
  ),

  // components/contribution-cells.tsx:74-82 — tooltip is aria-hidden
  {tip && (
    <div aria-hidden="true" className="pointer-events-none fixed z-50 ..." style={...}>
      {tip.text}
    </div>
  )}
  ```

- The existing hover-logic reuses `e.currentTarget.getBoundingClientRect()`
  and clamps x into `[90, window.innerWidth - 90]` to keep the tooltip on
  screen. Preserve exactly that positioning behavior for focus events.

- `components/contribution-graph.tsx` — the server component that wraps the
  cells in `<a href={contact.github} ... title="View GitHub profile">` and
  computes `weeks: (ContributionDay | null)[][]`. Not modified by this plan
  except for one ARIA attribute (Step 3).

- Repo conventions to match: `className` conditional via template literals,
  no comments in code, double quotes, semicolons. Client interactivity is
  plain React state — no new dependencies. Focus styles across the codebase
  use `focus-visible:ring-3 focus-visible:ring-ring/50` (see the toggle
  button in `components/theme-toggle.tsx:41`) — reuse that exact pattern.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm exec tsc --noEmit` | exit 0, no output   |
| Lint      | `pnpm exec eslint .`     | exit 0, no output   |
| Build     | `pnpm build`             | exit 0              |
| Dev server (manual check) | `pnpm dev` | http://localhost:3000 |

## Scope

**In scope** (the only files you should modify):
- `components/contribution-cells.tsx`
- `components/contribution-graph.tsx` (one attribute addition only, Step 3)

**Out of scope** (do NOT touch, even though they look related):
- `app/globals.css` — do not add focus CSS; the Tailwind
  `focus-visible:ring-*` utilities cover it.
- `lib/content.ts`, `lib/stars.ts` — unrelated.
- Do NOT restructure the grid, change cell sizes, or touch the
  `scroll-fade-x` / `no-scrollbar` utilities.
- Do NOT convert the outer `<a>` wrapper into something else — the whole
  graph links to the GitHub profile by design.

## Git workflow

- Branch: `advisor/003-contribution-a11y`
- Commit style: one-line imperative summary, e.g.
  `Make contribution cells keyboard-focusable with accessible labels and focus tooltips`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Give each day cell an accessible name and keyboard focus

In `components/contribution-cells.tsx`, for the real-day branch of the map
(the `day ? (...)` arm), change the `<div>` to:

- add `role="img"` and `aria-label={tooltipText(day)}`
- add `tabIndex={0}`
- add the existing focus-ring utilities to `className`:
  `focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`

Leave the null-day placeholder div (`key={`${wi}-${di}`}`) untouched — it is
grid padding and must stay unfocusable and unlabeled.

Target shape (partial, showing only the changed props):

```tsx
<div
  key={day.date}
  role="img"
  aria-label={tooltipText(day)}
  tabIndex={0}
  onMouseEnter={(e) => { /* unchanged */ }}
  onMouseLeave={() => setTip(null)}
  onFocus={(e) => { /* same body as onMouseEnter, see Step 2 */ }}
  onBlur={() => setTip(null)}
  className={`size-[10px] rounded-[2px] squircle ${LEVEL_CLASS[day.level]} transition-[box-shadow] duration-100 hover:ring-1 hover:ring-foreground/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`}
/>
```

**Verify**: `pnpm exec tsc --noEmit` → exit 0, no output.

### Step 2: Show the tooltip on focus and hide it on blur

Add `onFocus` and `onBlur` handlers mirroring the mouse handlers. The focus
handler body is identical to the `onMouseEnter` body (read
`getBoundingClientRect`, clamp x to `[90, window.innerWidth - 90]`, call
`setTip`); the blur handler is `() => setTip(null)`. To avoid duplicating
the positioning logic, extract the handler body into a local function that
takes the event target element:

```tsx
const showTip = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  const x = Math.min(Math.max(r.left + r.width / 2, 90), window.innerWidth - 90);
  setTip({ x, y: r.top, text: /* needs the day — see note */ });
};
```

Note: `tooltipText` needs the specific `day`, so the cleanest shape is a
factory inside the map callback (the map already closes over `day`):

```tsx
const show = (e: { currentTarget: HTMLElement }) => {
  const r = e.currentTarget.getBoundingClientRect();
  const x = Math.min(Math.max(r.left + r.width / 2, 90), window.innerWidth - 90);
  setTip({ x, y: r.top, text: tooltipText(day) });
};
// then: onMouseEnter={show} onFocus={show} onMouseLeave={() => setTip(null)} onBlur={() => setTip(null)}
```

Keep the tooltip element `aria-hidden="true"` — it stays decorative since
the day cell itself now carries the accessible name.

**Verify**: `pnpm exec tsc --noEmit` → exit 0, no output; `pnpm exec eslint .` → exit 0, no output.

### Step 3: Name the graph for assistive tech

In `components/contribution-graph.tsx`, the summary paragraph already
announces the year total visually:

```tsx
// components/contribution-graph.tsx:96-98
<p className="mt-1.5 text-[12px] text-muted-foreground">
  {total.toLocaleString("en-US")} in {new Date().getFullYear()}
</p>
```

Do not change that paragraph. Instead, leave the link's `title` as is and
make no further changes here **unless** `pnpm exec eslint .` or the manual
check reveals that `role="img"` cells inside a link cause an
axe/lint complaint; in that case STOP and report instead of restructuring
(see STOP conditions).

**Verify**: `pnpm build` → exit 0.

### Step 4: Manual behavioral check (dev server)

Run `pnpm dev`, open http://localhost:3000, and confirm:

1. Pressing Tab moves focus onto contribution day cells (skip-through is
   fine — there are ~365; verify a handful of focus stops land on cells).
2. When a cell has focus, the tooltip appears above it with text like
   "3 contributions on Feb 2nd, 2026", positioned like the hover tooltip.
3. Shift+Tab out / Tab away hides the tooltip.
4. Hover behavior is unchanged from before.
5. In devtools, a cell's accessibility name equals its tooltip text.

**Verify**: all five observations hold.

## Test plan

No test framework exists in this repo; none is to be added by this plan.
Verification is the gates above plus the manual checks in Step 4.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm exec eslint .` exits 0
- [ ] `pnpm build` exits 0
- [ ] `grep -n 'role="img"' components/contribution-cells.tsx` returns 1 match
- [ ] `grep -n 'tabIndex={0}' components/contribution-cells.tsx` returns 1 match
- [ ] `grep -n 'aria-label={tooltipText(day)}' components/contribution-cells.tsx` returns 1 match
- [ ] `grep -n 'onFocus' components/contribution-cells.tsx` returns at least 1 match
- [ ] The null-day placeholder has no `tabIndex` (`grep -n 'wi}-${di'` line's
      element must not gain interactive props)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts in "Current state" do not match the live code (drift).
- Tabbing through ~365 focusable cells is judged unusable by the operator —
  the alternative design (a single visually-hidden summary region instead of
  per-cell labels) is a product decision, not an executor improvisation.
  Note: if the operator is unavailable, prefer shipping the per-cell labels
  as specified over inventing alternatives, and flag the concern in the
  report.
- Focus-visible styling cannot be achieved with the existing Tailwind
  utilities (e.g. a config regression) — do not write custom CSS.
- Any lint rule rejects `role="img"` on a div or the tabIndex approach —
  report the rule name and stop.
- `components/contribution-graph.tsx` no longer renders
  `ContributionCells` with the `weeks` prop shown above.

## Maintenance notes

- Future change to tooltip copy must keep `tooltipText` as the single source
  for both the visual tooltip and the `aria-label` — do not fork the strings.
- If the graph later switches to per-cell links or buttons, the
  `role="img"` + `tabIndex` approach must be revisited (interactive
  elements should not be given `role="img"`).
- Reviewer should scrutinize: no layout shift from the focus ring
  (`ring-*` is box-shadow-based, so none is expected), and that the
  placeholder cells remain non-interactive.
