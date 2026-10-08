## Design Context

### Users
Tech evaluators — CTOs, founding engineers, senior hiring managers. They skim for
signal (shipped products, scale, leadership) but are connoisseurs of craft: they
notice details, open devtools, and judge the portfolio by its own implementation.

### Brand Personality
Refined with dry humor. Quiet confidence, warm wit, zero exclamation marks.
Three words: precise, assured, understated.

### Aesthetic Direction
A page drawn in blue ballpoint. One ink on warm cream paper by day; pale ink on
a night-navy page by night, both first-class. Everything else is the same ink
at lighter pressure (`ink-2` … `ink-5`, mixed in oklab so the hue never
drifts). Gaegu, an upright monoline print hand, is the whole type system:
700 for the name, block-capital section titles, and company names, 400 for
everything else, on Ballpoint's scale: 17 for meta, 20 for body, 25 for
company and project names, 28 for section titles (it runs small, so the
scale sits a step up). A hair of text-stroke gives it ballpoint weight.

Pen-test scrawls (jagged zigzags, a scratched star, a dead-pen coil, slashes,
a worked-over corner) sit in the margins on wider screens, the way a page
collects them while someone gets a ballpoint going.

Every line — boxes, underlines, timelines, hatching, the contribution grid — is
drawn by [Ballpoint](https://ballpoint.st9wd.com) components from seeded
strokes (`lib/ink-sketch.ts`), so it is deterministic
(identical on server and client), resizes cleanly, and can draw itself in.
Icons and the portrait are hand-drawn raster art stored as alpha masks, so
they take the current ink colour.

Anti-references: sticker-bomb doodle overload, fake paper photos, marker
"comic" fonts, rounded-card grids, anything that reads "AI-generated
landing page".

### Design Principles
1. **Signal over noise** — every element earns its place; restraint is the aesthetic.
2. **Delight whispers** — under 1s, discoverable rather than announced, never blocking.
3. **Craft is the proof** — the page's own polish substantiates the bio's claims.
4. **Dry humor, not jokes** — wit lives in copy and margin notes, never in loud visuals.
5. **Reward curiosity** — engineers who inspect, hover, and poke should find a small payoff
   (the margins take ink; the console knows).

### Motion vocabulary
Tokens live in `app/globals.css` (`--ease-out`, `--ease-out-expo`, `--ease-in`,
`--ease-pen`, `--ease-write`, `--dur-*`). Exponential ease-outs for arrivals, a
quicker ease-in for exits (~70% of the entrance), no bounce or overshoot, and
only transform/opacity for movement so entrances stay on the compositor.

- **Write**: headings are revealed by a feathered mask sweeping left to right.
- **Draw**: strokes run their `stroke-dashoffset` from 1 to 0 on the pen curve;
  long strokes (the timeline) use the steadier writing curve.
- **Land**: blocks settle in with a 3px rise and a fade.
- **Choreography**: the hero plays from first paint (no JS wait), finished in
  ~1.3s; the Experience stops land exactly as the timeline's pen reaches them.
- **Box**: hover and focus rule a pen box round icons and skills; links get a second pass.
- **Lift**: buttons rise off a drawn block shadow; pressing flattens them.
- **Boil**: hovered icons jitter a few frames a second, as hand-drawn animation does.
- **Blot**: theme changes spread an ink blot from the toggle (View Transitions).
- Reduced motion keeps short crossfades; strokes and handwriting appear finished.
