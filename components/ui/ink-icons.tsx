import { GlyphSvg, glyphs, shiftPath, type Glyph, type GlyphProps } from "@/lib/ink-glyphs";
import { createRng, dotStroke, handCurve, hashSeed, ringStroke, roundedBoxStroke, tickStroke } from "@/lib/ink-sketch";

// Everyday UI icons drawn with the pen on a 16px grid, the same grid as
// the glyphs inside the components (all of which are here too, redrawn
// with the same lean as the rest). Every
// stroke is seeded by the icon's name, so an icon is the same drawing
// wherever it appears, on the server and in the browser.
//
// House rules, so a hundred icons read as one hand: the live area is
// 1.8–14.2 on both axes, boxes have 1.2–1.6 corners, a pull is 1.5 wide
// (1.4 when an icon is busy), and a mark smaller than a pen width is a
// dot, not a shape. Icons are built on first use, so the ones a page
// never draws cost nothing.

type P = readonly [number, number];

const k = (id: string) => hashSeed(`icon-${id}`);

/** A vertex nudged a little, the same way wherever it's used, so pulls that meet still meet. */
function wobble(id: string, [x, y]: P, amount: number): P {
  const r = createRng(hashSeed(`${id}-${x}-${y}`));
  return [x + (r() - 0.5) * 2 * amount, y + (r() - 0.5) * 2 * amount];
}

/** One pull from a to b as a hand makes it: it leans to one side, a little more through one half. */
function pull(id: string, a: P, b: P, bow: number) {
  const r = createRng(k(id));
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(dx, dy) || 1;
  const [nx, ny] = [-dy / len, dx / len];
  // About 6% of its length, kept between a hair and most of a unit, so a short tick still has a lean and a long pull doesn't sag.
  const amp = Math.min(0.8, Math.max(0.2, len * 0.06)) * bow;
  const lean = (r() - 0.5) * 2 * amp;
  const at = (t: number, extra: number): P => {
    const off = lean * Math.sin(Math.PI * t) + (r() - 0.5) * amp * extra;
    return [a[0] + dx * t + nx * off, a[1] + dy * t + ny * off];
  };
  const [c1, c2] = [at(0.3, 0.7), at(0.7, 0.7)];
  const f = (p: P) => `${Math.round(p[0] * 100) / 100} ${Math.round(p[1] * 100) / 100}`;
  return `M${f(a)}C${f(c1)} ${f(c2)} ${f(b)}`;
}

/** One straight pull, not quite straight. */
// `bow` is how much it leans: 0.1 for a short tick, 0.4 (the default) for a long pull.
const line = (id: string, a: P, b: P, bow = 0.4) => pull(id, wobble(`${id}-a`, a, 0.2), wobble(`${id}-b`, b, 0.2), 0.55 + bow * 1.2);

/** Pulls joined without lifting the pen: each corner a little off, each leg leaning its own way. */
function poly(id: string, pts: P[]) {
  const v = pts.map((p) => wobble(id, p, 0.24));
  let d = "";
  for (let i = 1; i < v.length; i++) {
    const leg = pull(`${id}-${i}`, v[i - 1], v[i], 1);
    d += i === 1 ? leg : leg.replace(/^M[^C]*/, "");
  }
  return d;
}

/** A smooth pen line through points. */
const curve = (id: string, pts: P[], closed = false) => handCurve(k(id), pts, { jitter: 0.16, closed });

/** A ring of diameter d centred on (cx, cy). */
const ring = (id: string, cx: number, cy: number, d: number, turns = 1.06) => shiftPath(ringStroke(k(id), d, { turns }), cx - d / 2, cy - d / 2);

/** A rounded box, pulled in one motion. */
const box = (id: string, x: number, y: number, w: number, h: number, r: number) =>
  shiftPath(roundedBoxStroke(k(id), w, h, r, { jitter: 0.17, overrun: 0.05 }), x, y);

/** A small inked dot. */
const dot = (id: string, x: number, y: number, r = 0.9) => shiftPath(dotStroke(k(id), r), x, y);

/** Points round a circle, from angle a0 to a1 (degrees, clockwise from 3 o'clock). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number, steps = 8): P[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  });
}

/** An arrowhead on the end of a line: wings trailing back from `tip`, which is heading at `deg`. */
function head(id: string, tip: P, deg: number, len = 2.8, spread = 38) {
  const wing = (turn: number): P => {
    const a = ((deg + 180 + turn) * Math.PI) / 180;
    return [tip[0] + Math.cos(a) * len, tip[1] + Math.sin(a) * len];
  };
  return poly(id, [wing(spread), tip, wing(-spread)]);
}

/** A crescent moon: the rim of one circle, then the edge of the one biting into it. */
function moon() {
  const [x1, y1, r1] = [7.6, 8.4, 6];
  const [x2, y2, r2] = [11.2, 4.8, 4.9];
  // Where the two circles cross.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const a = (r1 * r1 - r2 * r2 + dist * dist) / (2 * dist);
  const h = Math.sqrt(r1 * r1 - a * a);
  const mx = x1 + (a * dx) / dist;
  const my = y1 + (a * dy) / dist;
  const p: P = [mx + (h * dy) / dist, my - (h * dx) / dist];
  const q: P = [mx - (h * dy) / dist, my + (h * dx) / dist];
  const deg = (c: P, cx: number, cy: number) => (Math.atan2(c[1] - cy, c[0] - cx) * 180) / Math.PI;
  // The outer rim, the long way round from p to q, away from the bite.
  const a0 = deg(p, x1, y1);
  let a1 = deg(q, x1, y1);
  if (a1 < a0) a1 += 360;
  const outer = a1 - a0 > 180 ? arc(x1, y1, r1, a0, a1, 12) : arc(x1, y1, r1, a0 + 360, a1, 12);
  // The bite, the short way back from q to p.
  const b0 = deg(q, x2, y2);
  let b1 = deg(p, x2, y2);
  if (b1 > b0) b1 -= 360;
  const inner = b0 - b1 > 180 ? arc(x2, y2, r2, b0, b1 + 360, 8) : arc(x2, y2, r2, b0, b1, 8);
  return curve("moon", [...outer, ...inner.slice(1)]);
}

/** A pencil lying from bottom-left to top-right: its tip, sides, and the end. */
function pencil() {
  const tip: P = [2.2, 13.8];
  const u: P = [Math.SQRT1_2, -Math.SQRT1_2];
  const n: P = [Math.SQRT1_2, Math.SQRT1_2];
  const at = (d: number, w: number): P => [tip[0] + u[0] * d + n[0] * w, tip[1] + u[1] * d + n[1] * w];
  return [
    poly("pencil-a", [at(3.6, -1.8), at(0, 0), at(3.6, 1.8)]),
    poly("pencil-b", [at(3.6, 1.8), at(14.2, 1.8), at(14.2, -1.8), at(3.6, -1.8)]),
    line("pencil-c", at(11.6, -1.8), at(11.6, 1.8)),
  ];
}

/** A solid dot: a tight spiral that fills in, for bullets and the like. */
function disc(id: string, cx: number, cy: number, r: number) {
  const pts: P[] = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    const a = 0.6 + t * Math.PI * 5.4;
    const rad = r * (1 - t * 0.88);
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  });
  return curve(id, pts);
}

/** An oval round (cx, cy), closed. */
function oval(id: string, cx: number, cy: number, rx: number, ry: number, n = 10) {
  return curve(id, Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2 - Math.PI / 2) * rx, cy + Math.sin((i / n) * Math.PI * 2 - Math.PI / 2) * ry] as const), true);
}

/** Mirrors points left to right across the 16px grid. */
const flip = (pts: P[]): P[] => pts.map(([x, y]) => [16 - x, y]);

/** A point on a line from `tip` heading `deg`, `d` along and `w` to its right-hand side. */
function along(tip: P, deg: number) {
  const a = (deg * Math.PI) / 180;
  return (d: number, w = 0): P => [tip[0] + Math.cos(a) * d - Math.sin(a) * w, tip[1] + Math.sin(a) * d + Math.cos(a) * w];
}

/** A rounded corner of a bracket, a pull of two legs: `a` to `corner` to `b`. */
const corner = (id: string, a: P, c: P, b: P) => poly(id, [a, c, b]);

type Def = Glyph | (() => Glyph);

/** An icon built on first use: its strokes and the weight of the pen. */
const ic =
  (width: number, paths: () => string[]): (() => Glyph) =>
  () => ({ paths: paths(), width });

// Grouped the way you'd look for them; the docs list them in this order.
const icons = {
  // The marks components use inside themselves.
  close: ic(1.7, () => [line("close-a", [3.4, 3.4], [12.6, 12.6], 0.5), line("close-b", [12.5, 3.6], [3.6, 12.4], 0.5)]),
  check: glyphs.check,
  plus: ic(1.7, () => [line("plus-h", [2.6, 8], [13.4, 8.1], 0.5), line("plus-v", [8, 2.6], [8.1, 13.4], 0.5)]),
  minus: ic(1.7, () => [line("minus", [2.6, 8], [13.4, 8.1], 0.5)]),
  "chevron-down": ic(1.6, () => [poly("chev-d", [[3.2, 5.4], [8, 10.6], [12.8, 5.4]])]),
  "chevron-up": ic(1.6, () => [poly("chev-u", [[3.2, 10.6], [8, 5.4], [12.8, 10.6]])]),
  "chevron-right": ic(1.6, () => [poly("chev-r", [[5.6, 3.2], [10.6, 8], [5.6, 12.8]])]),
  "chevron-left": ic(1.6, () => [poly("chev-l", [[10.4, 3.2], [5.4, 8], [10.4, 12.8]])]),
  "chevrons-up-down": ic(1.6, () => [poly("cud-up", [[4.8, 6.2], [8, 2.8], [11.2, 6.2]]), poly("cud-down", [[4.8, 9.8], [8, 13.2], [11.2, 9.8]])]),
  "chevrons-left": ic(1.6, () => [poly("cl-a", [[7.6, 3.4], [3.2, 8], [7.6, 12.6]]), poly("cl-b", [[12.8, 3.4], [8.4, 8], [12.8, 12.6]])]),
  "chevrons-right": ic(1.6, () => [poly("cr-a", [[3.2, 3.4], [7.6, 8], [3.2, 12.6]]), poly("cr-b", [[8.4, 3.4], [12.8, 8], [8.4, 12.6]])]),
  dot: ic(1.5, () => [disc("dot", 8, 8, 2.9)]),
  circle: ic(1.5, () => [ring("circle", 8, 8, 13.2)]),
  "circle-dot": ic(1.5, () => [ring("circle-dot", 8, 8, 13.2), disc("circle-dot-c", 8, 8, 2)]),
  alert: ic(1.8, () => [line("alert", [8, 2.2], [8.2, 9.6], 0.5), disc("alert-dot", 8.2, 13.2, 1.1)]),
  info: ic(1.8, () => [disc("info-dot", 8, 3.4, 1.1), line("info", [7.9, 6.6], [8.1, 13.8], 0.5)]),
  "info-circle": ic(1.5, () => [ring("info-ring", 8, 8, 13.4), disc("info-ring-dot", 8, 4.9, 0.9), line("info-ring-i", [7.9, 7.4], [8.1, 11.6], 0.3)]),
  "alert-circle": ic(1.5, () => [ring("alert-ring", 8, 8, 13.4), line("alert-ring-i", [8, 4.2], [8.1, 9.2], 0.3), disc("alert-ring-dot", 8.1, 11.6, 0.9)]),
  loading: glyphs.loading,

  // Arrows and moving about.
  "arrow-right": ic(1.6, () => [line("arrow-r", [1.8, 8.2], [13.6, 7.9]), poly("arrow-r-head", [[9.4, 3.9], [13.9, 7.9], [9.6, 12.1]])]),
  "arrow-up-right": ic(1.6, () => [line("arrow-ur", [3.2, 12.9], [12.4, 3.7]), poly("arrow-ur-head", [[6.2, 3.4], [12.7, 3.3], [12.8, 9.9]])]),
  "arrow-left": ic(1.6, () => [line("arrow-l", [14.2, 7.9], [2.4, 8.2]), poly("arrow-l-head", [[6.6, 3.9], [2.2, 8.1], [6.5, 12.2]])]),
  "arrow-up": ic(1.6, () => [line("arrow-u", [8.1, 14.2], [7.9, 2.4]), poly("arrow-u-head", [[3.9, 6.6], [8, 2.2], [12.1, 6.5]])]),
  "arrow-down": ic(1.6, () => [line("arrow-d", [7.9, 1.8], [8.1, 13.6]), poly("arrow-d-head", [[3.9, 9.4], [8, 13.8], [12.1, 9.5]])]),
  "arrow-up-down": ic(1.5, () => [line("aud-a", [4.6, 2.4], [4.4, 13.6]), poly("aud-a-head", [[1.9, 11], [4.5, 13.8], [7.1, 11]]), line("aud-b", [11.4, 13.6], [11.6, 2.4]), poly("aud-b-head", [[8.9, 5], [11.5, 2.2], [14.1, 5]])]),
  undo: ic(1.5, () => [poly("undo-head", [[5.8, 2.4], [2.4, 5.8], [5.8, 9.2]]), curve("undo-body", [[2.8, 5.8], [8.6, 5.8], [12, 6.8], [13.6, 9.2], [12.4, 12], [9, 13.2], [5.2, 13.2]])]),
  redo: ic(1.5, () => [poly("redo-head", [[10.2, 2.4], [13.6, 5.8], [10.2, 9.2]]), curve("redo-body", [[13.2, 5.8], [7.4, 5.8], [4, 6.8], [2.4, 9.2], [3.6, 12], [7, 13.2], [10.8, 13.2]])]),
  refresh: ic(1.5, () => {
    const pts = arc(8.9, 7.9, 5.4, -62, 222, 10);
    return [curve("refresh", pts), head("refresh-head", pts[pts.length - 1], 222 + 90, 3.4, 42)];
  }),
  history: ic(1.45, () => {
    const pts = arc(9.2, 8, 5.6, 150, 150 + 290, 12);
    return [curve("history", pts), head("history-head", pts[0], 150 - 90, 3.2, 42), poly("history-hands", [[9.2, 4.8], [9.2, 8.2], [11.4, 9.6]])];
  }),
  maximize: ic(1.5, () => [corner("max-a", [2.2, 6], [2.2, 2.2], [6, 2.2]), corner("max-b", [10, 2.2], [13.8, 2.2], [13.8, 6]), corner("max-c", [13.8, 10], [13.8, 13.8], [10, 13.8]), corner("max-d", [6, 13.8], [2.2, 13.8], [2.2, 10])]),
  minimize: ic(1.5, () => [corner("min-a", [2.2, 6.2], [6.2, 6.2], [6.2, 2.2]), corner("min-b", [9.8, 2.2], [9.8, 6.2], [13.8, 6.2]), corner("min-c", [13.8, 9.8], [9.8, 9.8], [9.8, 13.8]), corner("min-d", [6.2, 13.8], [6.2, 9.8], [2.2, 9.8])]),
  "log-in": ic(1.5, () => [poly("login-door", [[9.6, 2.4], [13.6, 2.4], [13.6, 13.6], [9.6, 13.6]]), line("login-arrow", [2.2, 8], [9.4, 8.1]), poly("login-head", [[6.4, 5], [9.6, 8], [6.4, 11]])]),
  "log-out": ic(1.5, () => [poly("logout-door", [[6.4, 2.4], [2.4, 2.4], [2.4, 13.6], [6.4, 13.6]]), line("logout-arrow", [6.6, 8], [13.8, 8.1]), poly("logout-head", [[10.8, 5], [13.9, 8], [10.8, 11]])]),
  "external-link": ic(1.5, () => [poly("ext-box", [[7, 2.6], [2.4, 2.6], [2.4, 13.6], [13.4, 13.6], [13.4, 9]]), line("ext-arrow", [7.6, 8.4], [13.8, 2.2]), poly("ext-head", [[9.6, 2.1], [13.9, 2.1], [13.9, 6.4]])]),
  home: ic(1.5, () => [poly("home-roof", [[1.6, 8.2], [8, 2], [14.4, 8.2]]), poly("home-walls", [[3.6, 6.4], [3.6, 14], [12.4, 14], [12.4, 6.4]]), poly("home-door", [[6.6, 14], [6.6, 10.2], [9.4, 10.2], [9.4, 14]])]),
  menu: ic(1.6, () => [line("menu-1", [2.2, 4], [13.8, 3.9]), line("menu-2", [2.2, 8], [13.8, 8.1]), line("menu-3", [2.2, 12.1], [13.8, 12])]),
  more: ic(1.5, () => [dot("more-1", 3.4, 8), dot("more-2", 8, 8), dot("more-3", 12.6, 8)]),
  "more-vertical": ic(1.5, () => [dot("more-v1", 8, 3.4), dot("more-v2", 8, 8), dot("more-v3", 8, 12.6)]),
  sidebar: ic(1.5, () => [box("sidebar-box", 1.8, 2.4, 12.4, 11.2, 1.6), line("sidebar-rule", [6, 2.8], [5.9, 13.2])]),
  grid: ic(1.5, () => [box("grid-a", 2.2, 2.2, 4.8, 4.8, 1.2), box("grid-b", 9, 2.2, 4.8, 4.8, 1.2), box("grid-c", 2.2, 9, 4.8, 4.8, 1.2), box("grid-d", 9, 9, 4.8, 4.8, 1.2)]),
  list: ic(1.5, () => [disc("list-d1", 3, 4, 0.8), line("list-1", [6, 4], [13.8, 3.9]), disc("list-d2", 3, 8, 0.8), line("list-2", [6, 8], [13.8, 8.1]), disc("list-d3", 3, 12, 0.8), line("list-3", [6, 12.1], [13.8, 12])]),
  table: ic(1.45, () => [box("table-box", 1.8, 2.6, 12.4, 10.8, 1.4), line("table-row", [2.2, 6.4], [13.8, 6.3]), line("table-col", [6.2, 6.6], [6.1, 13])]),
  layers: ic(1.45, () => [poly("layers-top", [[8, 2], [14.2, 5.2], [8, 8.4], [1.8, 5.2], [8, 2]]), poly("layers-mid", [[1.8, 8.2], [8, 11.4], [14.2, 8.2]]), poly("layers-low", [[1.8, 11], [8, 14.2], [14.2, 11]])]),

  // Doing things.
  search: ic(1.6, () => [ring("search-ring", 6.8, 6.8, 9.6), line("search-handle", [10.5, 10.5], [14.2, 14.2])]),
  "zoom-in": ic(1.5, () => [ring("zin-ring", 6.8, 6.8, 9.6), line("zin-handle", [10.5, 10.5], [14.2, 14.2]), line("zin-h", [4.4, 6.8], [9.2, 6.8], 0.2), line("zin-v", [6.8, 4.4], [6.8, 9.2], 0.2)]),
  "zoom-out": ic(1.5, () => [ring("zout-ring", 6.8, 6.8, 9.6), line("zout-handle", [10.5, 10.5], [14.2, 14.2]), line("zout-h", [4.4, 6.8], [9.2, 6.8], 0.2)]),
  filter: ic(1.45, () => [poly("filter", [[1.8, 2.6], [14.2, 2.6], [9.4, 8.4], [9.4, 13.6], [6.6, 12.2], [6.6, 8.4], [1.8, 2.6]])]),
  settings: ic(1.4, () => [
    line("set-1a", [1.8, 4], [3.4, 4]), ring("set-1k", 5, 4, 3), line("set-1b", [6.6, 4], [14.2, 4]),
    line("set-2a", [1.8, 8], [9, 8]), ring("set-2k", 10.6, 8, 3), line("set-2b", [12.2, 8], [14.2, 8]),
    line("set-3a", [1.8, 12], [5.8, 12]), ring("set-3k", 7.4, 12, 3), line("set-3b", [9, 12], [14.2, 12]),
  ]),
  "toggle-left": ic(1.5, () => [box("tgl-box", 1.6, 4.2, 12.8, 7.6, 3.8), ring("tgl-knob", 5.4, 8, 3.2)]),
  "toggle-right": ic(1.5, () => [box("tgr-box", 1.6, 4.2, 12.8, 7.6, 3.8), ring("tgr-knob", 10.6, 8, 3.2)]),
  "plus-circle": ic(1.5, () => [ring("pc-ring", 8, 8, 13.4), line("pc-v", [8, 4.8], [8.1, 11.2], 0.2), line("pc-h", [4.8, 8], [11.2, 8.1], 0.2)]),
  "minus-circle": ic(1.5, () => [ring("mc-ring", 8, 8, 13.4), line("mc-h", [4.8, 8], [11.2, 8.1], 0.2)]),
  "check-circle": ic(1.5, () => [ring("check-ring", 8, 8, 13.4), shiftPath(tickStroke(k("check-c"), 6), 5, 5.4)]),
  "x-circle": ic(1.5, () => [ring("x-ring", 8, 8, 13.4), line("x-a", [5.6, 5.6], [10.4, 10.4]), line("x-b", [10.4, 5.7], [5.7, 10.3])]),
  "check-square": ic(1.5, () => [box("cs-box", 2.2, 2.2, 11.6, 11.6, 2), shiftPath(tickStroke(k("cs-tick"), 6), 5, 5.4)]),
  ban: ic(1.5, () => [ring("ban-ring", 8, 8, 13.4), line("ban-bar", [3.9, 3.9], [12.1, 12.1], 0.2)]),
  "help-circle": ic(1.5, () => [ring("help-ring", 8, 8, 13.4), curve("help-q", [[6, 6.4], [6.3, 4.9], [7.7, 4.3], [9.1, 4.7], [9.8, 5.9], [9.2, 7.2], [8.1, 8], [8, 9.2]]), disc("help-dot", 8, 11.6, 0.7)]),
  loader: ic(1.5, () => Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    return line(`loader-${i}`, [8 + Math.cos(a) * 3.6, 8 + Math.sin(a) * 3.6], [8 + Math.cos(a) * 6.4, 8 + Math.sin(a) * 6.4], 0.2);
  })),
  power: ic(1.5, () => [curve("power-arc", arc(8, 8.4, 5.6, -50, 230, 12)), line("power-bar", [8, 1.8], [8.1, 7.4], 0.2)]),
  trash: ic(1.45, () => [
    line("trash-lid", [1.8, 4.2], [14.2, 4]),
    poly("trash-handle", [[5.8, 4], [6.2, 2], [9.8, 2], [10.2, 4]]),
    poly("trash-can", [[3.4, 4.2], [4.3, 14.2], [11.7, 14.2], [12.6, 4.2]]),
    line("trash-i", [6.4, 6.8], [6.7, 11.8]),
    line("trash-ii", [9.6, 6.8], [9.3, 11.8]),
  ]),
  copy: ic(1.5, () => [box("copy-front", 2, 5.6, 8.4, 8.6, 1.4), poly("copy-back", [[5.6, 5.2], [5.6, 2], [14, 2], [14, 10.4], [10.9, 10.4]])]),
  clipboard: ic(1.45, () => [box("clip-box", 2.8, 2.8, 10.4, 11.4, 1.5), box("clip-top", 5.8, 1.6, 4.4, 2.8, 1), line("clip-a", [5.6, 8], [10.4, 8.1], 0.2), line("clip-b", [5.6, 11], [9, 10.9], 0.2)]),
  save: ic(1.45, () => [poly("save-body", [[2.4, 2.4], [10.8, 2.4], [13.6, 5.2], [13.6, 13.6], [2.4, 13.6], [2.4, 2.4]]), poly("save-top", [[5, 2.6], [5, 5.8], [10, 5.8], [10, 2.6]]), poly("save-label", [[4.6, 13.4], [4.6, 9], [11.4, 9], [11.4, 13.4]])]),
  edit: ic(1.45, () => {
    const at = along([6.4, 9.6], -45);
    return [poly("edit-box", [[8, 2.6], [3.6, 2.6], [2.4, 3.8], [2.4, 12.4], [3.6, 13.6], [12.2, 13.6], [13.4, 12.4], [13.4, 8.2]]), poly("edit-tip", [at(2.8, -1.4), at(0, 0), at(2.8, 1.4)]), poly("edit-body", [at(2.8, 1.4), at(8.2, 1.4), at(8.2, -1.4), at(2.8, -1.4)])];
  }),
  pencil: ic(1.45, pencil),
  pen: ic(1.45, () => {
    const at = along([2.2, 13.8], -45);
    return [poly("pen-tip", [at(2.8, -1.5), at(0, 0), at(2.8, 1.5)]), poly("pen-barrel", [at(2.8, 1.5), at(13.2, 1.5), at(13.2, -1.5), at(2.8, -1.5)]), line("pen-grip", at(5.4, -1.5), at(5.4, 1.5)), line("pen-click", at(13.6, 0), at(15, 0), 0.1)];
  }),
  eraser: ic(1.45, () => [poly("eraser-body", [[2.2, 9.6], [8.6, 3.2], [13.2, 7.8], [8, 13], [5.2, 13], [2.2, 9.6]]), line("eraser-band", [5.6, 6.2], [10.4, 11], 0.2)]),
  ruler: ic(1.45, () => {
    const at = along([2, 10.4], -45);
    return [poly("ruler-box", [at(0, 0), at(11.8, 0), at(11.8, 5), at(0, 5), at(0, 0)]), line("ruler-1", at(3, 0), at(3, 2.2), 0.1), line("ruler-2", at(6, 0), at(6, 2.2), 0.1), line("ruler-3", at(9, 0), at(9, 2.2), 0.1)];
  }),
  scissors: ic(1.45, () => [ring("sc-ring-a", 4, 4.2, 3.4), ring("sc-ring-b", 4, 11.8, 3.4), line("sc-blade-a", [5.6, 5.4], [14, 11.4]), line("sc-blade-b", [5.6, 10.6], [14, 4.6])]),
  paperclip: ic(1.45, () => [curve("paperclip", [[10.4, 5.2], [5.6, 10], [4.8, 11.6], [5.4, 13], [7, 13.2], [8.2, 12.4], [12.8, 7.6], [13.4, 5.4], [12.4, 3.4], [10.4, 2.8], [8.6, 3.4], [3.6, 8.4], [2.8, 10.6]])]),
  pin: ic(1.5, () => [curve("pin", [[8, 14.4], [4.6, 10.2], [3.4, 7.2], [4.2, 4], [6.6, 2.2], [9.4, 2.2], [11.8, 4], [12.6, 7.2], [11.4, 10.2], [8, 14.4]]), ring("pin-hole", 8, 6.6, 3)]),
  flag: ic(1.5, () => [line("flag-pole", [3.2, 14.2], [3.4, 1.8]), curve("flag-top", [[3.4, 2.8], [6.2, 2], [9, 3.4], [12.8, 2.8]]), line("flag-edge", [12.8, 2.8], [12.7, 9.2], 0.2), curve("flag-bottom", [[12.7, 9.2], [9, 9.8], [6.2, 8.4], [3.4, 9.2]])]),
  tag: ic(1.45, () => [poly("tag-body", [[2.4, 2.4], [8.4, 2.4], [13.8, 7.8], [8.4, 13.2], [2.4, 7.2], [2.4, 2.4]]), ring("tag-hole", 5.4, 5.4, 2)]),
  archive: ic(1.45, () => [box("archive-lid", 1.8, 2.6, 12.4, 3.6, 1), poly("archive-body", [[3, 6.2], [3, 13.6], [13, 13.6], [13, 6.2]]), line("archive-grip", [6.4, 9.2], [9.6, 9.3], 0.2)]),
  inbox: ic(1.45, () => [poly("inbox-tray", [[1.8, 9.2], [4.2, 3], [11.8, 3], [14.2, 9.2], [14.2, 13.4], [1.8, 13.4], [1.8, 9.2]]), poly("inbox-slot", [[1.8, 9.4], [5.6, 9.4], [6.4, 11.2], [9.6, 11.2], [10.4, 9.4], [14.2, 9.4]])]),
  download: ic(1.5, () => [line("dl-shaft", [8, 1.8], [8, 10.2]), poly("dl-head", [[4.6, 7], [8, 10.4], [11.4, 7]]), poly("dl-tray", [[2, 10.6], [2, 14], [14, 14], [14, 10.6]])]),
  upload: ic(1.5, () => [line("ul-shaft", [8, 10.4], [8, 2]), poly("ul-head", [[4.6, 5.4], [8, 2], [11.4, 5.4]]), poly("ul-tray", [[2, 10.6], [2, 14], [14, 14], [14, 10.6]])]),
  share: ic(1.45, () => [ring("share-a", 12, 3.8, 3.4), ring("share-b", 4, 8, 3.4), ring("share-c", 12, 12.2, 3.4), line("share-l1", [5.6, 7.1], [10.4, 4.7], 0.2), line("share-l2", [5.6, 8.9], [10.4, 11.3], 0.2)]),
  link: ic(1.45, () => {
    // Two open loops that hook into each other, and the bar through the join.
    const u: P = [Math.SQRT1_2, -Math.SQRT1_2];
    const n: P = [Math.SQRT1_2, Math.SQRT1_2];
    const [h, r] = [2.3, 2];
    const loop = (id: string, c: P, s: number) => {
      const at = (x: number, y: number): P => [c[0] + s * (u[0] * x + n[0] * y), c[1] + s * (u[1] * x + n[1] * y)];
      const cap = Array.from({ length: 7 }, (_, i) => {
        const t = Math.PI / 2 - (i / 6) * Math.PI;
        return at(h + Math.cos(t) * r, Math.sin(t) * r);
      });
      return curve(id, [at(-h, r), at(0, r), ...cap, at(0, -r), at(-h, -r)]);
    };
    return [loop("link-a", [10.3, 5.7], 1), loop("link-b", [5.7, 10.3], -1), line("link-bar", [6.9, 9.1], [9.1, 6.9], 0.1)];
  }),
  key: ic(1.45, () => [ring("key-head", 4.8, 11.2, 5), line("key-shaft", [6.8, 9.2], [14, 2], 0.2), line("key-t1", [11.4, 4.6], [13.4, 6.6], 0.1), line("key-t2", [9.6, 6.4], [11.2, 8], 0.1)]),
  lock: ic(1.5, () => [box("lock-body", 2.8, 7.2, 10.4, 7.2, 1.2), curve("lock-shackle", [[5, 7.2], [5, 4.8], [6, 2.9], [8, 2.2], [10, 2.9], [11, 4.8], [11, 7.2]]), dot("lock-hole", 8, 10.8, 0.8)]),
  unlock: ic(1.5, () => [box("unlock-body", 2.8, 7.2, 10.4, 7.2, 1.2), curve("unlock-shackle", [[5, 7.2], [5, 4.8], [6, 2.9], [8, 2.2], [10, 2.9], [11, 4.4]]), dot("unlock-hole", 8, 10.8, 0.8)]),
  shield: ic(1.5, () => [curve("shield", [[8, 1.8], [11.6, 3], [13.4, 3.6], [13.2, 8], [11.6, 11.4], [8, 14.2], [4.4, 11.4], [2.8, 8], [2.6, 3.6], [4.4, 3], [8, 1.8]]), shiftPath(tickStroke(k("shield-tick"), 5), 5.4, 5.4)]),
  eye: ic(1.45, () => [curve("eye-lids", [[1.4, 8], [4.4, 4.4], [8, 3.4], [11.6, 4.4], [14.6, 8], [11.6, 11.6], [8, 12.6], [4.4, 11.6]], true), ring("eye-pupil", 8, 8, 4.4)]),
  "eye-off": ic(1.45, () => [curve("eyeoff-lids", [[1.4, 8], [4.4, 4.4], [8, 3.4], [11.6, 4.4], [14.6, 8], [11.6, 11.6], [8, 12.6], [4.4, 11.6]], true), ring("eyeoff-pupil", 8, 8, 4.4), line("eyeoff-bar", [2.6, 13.4], [13.4, 2.6], 0.2)]),

  // People and talk.
  user: ic(1.5, () => [ring("user-head", 8, 5.2, 5.6), curve("user-body", [[2.4, 14.4], [3.4, 11.2], [5.6, 9.8], [8, 9.5], [10.4, 9.8], [12.6, 11.2], [13.6, 14.4]])]),
  users: ic(1.45, () => [ring("users-head", 6, 5.2, 4.8), curve("users-body", [[1.6, 14.2], [2.4, 11.2], [4, 9.8], [6, 9.5], [8, 9.8], [9.6, 11.2], [10.4, 14.2]]), curve("users-head2", [[10.2, 2.6], [11.8, 2.8], [12.8, 4.4], [12.2, 6.2], [10.8, 7]]), curve("users-body2", [[11.8, 9.6], [13.2, 10.6], [14.2, 14.2]])]),
  "user-plus": ic(1.45, () => [ring("up-head", 6, 5.2, 4.8), curve("up-body", [[1.6, 14.2], [2.4, 11.2], [4, 9.8], [6, 9.5], [8, 9.8], [9.6, 11.2], [10.4, 14.2]]), line("up-v", [12.4, 4.4], [12.5, 8.6], 0.2), line("up-h", [10.3, 6.5], [14.5, 6.6], 0.2)]),
  smile: ic(1.45, () => [ring("smile-ring", 8, 8, 13.4), curve("smile-mouth", arc(8, 7.4, 3.8, 30, 150, 6)), disc("smile-l", 5.8, 6.2, 0.6), disc("smile-r", 10.2, 6.2, 0.6)]),
  frown: ic(1.45, () => [ring("frown-ring", 8, 8, 13.4), curve("frown-mouth", arc(8, 12.4, 3.4, 210, 330, 6)), disc("frown-l", 5.8, 6.2, 0.6), disc("frown-r", 10.2, 6.2, 0.6)]),
  message: ic(1.45, () => [box("msg-box", 1.8, 2.2, 12.4, 9.2, 2.2), poly("msg-tail", [[4.6, 11.2], [4.6, 14.2], [7.8, 11.3]])]),
  "message-circle": ic(1.45, () => [curve("mc-bubble", arc(8, 7.6, 5.8, 148, 148 + 306, 14)), poly("mc-tail", [[6.4, 13.2], [2.2, 14], [3, 10.4]])]),
  mail: ic(1.5, () => [box("mail-box", 1.8, 3.4, 12.4, 9.4, 1.2), poly("mail-flap", [[2.3, 4.3], [8, 9.1], [13.7, 4.3]])]),
  send: ic(1.5, () => [poly("send-a", [[7.4, 8.6], [1.8, 6.8], [14.2, 1.8], [9.4, 14.2], [7.4, 8.6], [14.2, 1.8]])]),
  bell: ic(1.45, () => [
    curve("bell", [[2.4, 12], [3.8, 10.2], [4.2, 6.8], [5.2, 4], [8, 2.6], [10.8, 4], [11.8, 6.8], [12.2, 10.2], [13.6, 12]]),
    line("bell-rim", [2.2, 12.1], [13.8, 11.9]),
    curve("bell-clapper", [[6.5, 13.6], [8, 14.6], [9.5, 13.6]]),
  ]),
  phone: ic(1.45, () => [box("phone-box", 4, 1.8, 8, 12.4, 1.8), line("phone-bar", [6.8, 11.8], [9.2, 11.8], 0.1)]),
  at: ic(1.45, () => [ring("at-core", 8, 8, 4.4), curve("at-tail", [[10.2, 5.8], [10.3, 9.2], [11.4, 10.2], [12.8, 9.6], [13.8, 8], ...arc(8, 8, 5.9, 0, -295, 16).slice(1)])]),
  hash: ic(1.5, () => [line("hash-a", [6.2, 2.2], [5, 13.8]), line("hash-b", [11, 2.2], [9.8, 13.8]), line("hash-c", [2.4, 5.8], [13.6, 5.7]), line("hash-d", [2.2, 10.2], [13.4, 10.3])]),

  // Making and writing.
  type: ic(1.5, () => [line("type-bar", [2.8, 3.6], [13.2, 3.4]), line("type-stem", [8, 3.6], [8.1, 13.6]), line("type-foot", [5.8, 13.6], [10.2, 13.6], 0.1)]),
  bold: ic(1.6, () => [line("bold-stem", [4.6, 2.2], [4.5, 13.8], 0.2), curve("bold-top", [[4.6, 2.4], [8.8, 2.4], [10.8, 3.6], [10.8, 5.8], [9, 7.6], [4.6, 7.6]]), curve("bold-bottom", [[4.6, 7.6], [9.6, 7.6], [11.6, 8.8], [11.6, 11.4], [9.6, 13.6], [4.6, 13.6]])]),
  italic: ic(1.5, () => [line("it-top", [6.6, 2.4], [11.8, 2.4], 0.1), line("it-bottom", [4.2, 13.6], [9.4, 13.6], 0.1), line("it-stem", [9.4, 2.6], [6.6, 13.4], 0.2)]),
  underline: ic(1.5, () => [curve("ul-u", [[4.6, 2.2], [4.6, 7.4], [5.4, 10.6], [8, 11.6], [10.6, 10.6], [11.4, 7.4], [11.4, 2.2]]), line("ul-bar", [2.8, 14], [13.2, 13.9], 0.2)]),
  "align-left": ic(1.5, () => [line("al-1", [2.2, 3.4], [13.8, 3.3]), line("al-2", [2.2, 6.5], [9.2, 6.6]), line("al-3", [2.2, 9.6], [13.8, 9.5]), line("al-4", [2.2, 12.7], [8.4, 12.8])]),
  "align-center": ic(1.5, () => [line("ac-1", [2.2, 3.4], [13.8, 3.3]), line("ac-2", [4.4, 6.5], [11.6, 6.6]), line("ac-3", [2.2, 9.6], [13.8, 9.5]), line("ac-4", [5, 12.7], [11, 12.8])]),
  book: ic(1.45, () => [curve("book-l", [[8, 3.6], [5.8, 2.6], [2.4, 2.8], [2.4, 12.4], [5.8, 12.2], [8, 13.4]]), curve("book-r", [[8, 3.6], [10.2, 2.6], [13.6, 2.8], [13.6, 12.4], [10.2, 12.2], [8, 13.4]]), line("book-spine", [8, 3.6], [8.1, 13.4], 0.1)]),
  notebook: ic(1.45, () => [box("nb-box", 3.4, 1.8, 9.8, 12.4, 1.5), line("nb-r1", [1.8, 5], [4.8, 5], 0.1), line("nb-r2", [1.8, 8], [4.8, 8], 0.1), line("nb-r3", [1.8, 11], [4.8, 11], 0.1), line("nb-t1", [7.2, 5], [11, 5.1], 0.2), line("nb-t2", [7.2, 8], [10.4, 8], 0.2)]),
  file: ic(1.45, () => [poly("file", [[9.4, 1.8], [3.2, 1.8], [3.2, 14.2], [12.8, 14.2], [12.8, 5.2], [9.4, 1.8]]), poly("file-fold", [[9.4, 2], [9.4, 5.2], [12.6, 5.2]])]),
  "file-text": ic(1.4, () => [poly("ft-file", [[9.4, 1.8], [3.2, 1.8], [3.2, 14.2], [12.8, 14.2], [12.8, 5.2], [9.4, 1.8]]), poly("ft-fold", [[9.4, 2], [9.4, 5.2], [12.6, 5.2]]), line("ft-a", [5.6, 8.6], [10.4, 8.6], 0.2), line("ft-b", [5.6, 11.4], [10.4, 11.4], 0.2)]),
  folder: ic(1.45, () => [poly("folder", [[1.8, 5.6], [1.8, 13.6], [14.2, 13.6], [14.2, 5.6], [7.8, 5.6], [6.4, 3.2], [1.8, 3.2], [1.8, 5.6]])]),
  image: ic(1.45, () => [box("image-box", 1.8, 2.6, 12.4, 10.8, 1.2), poly("image-hills", [[2.2, 12.4], [5.8, 8.2], [8.6, 10.8], [10.4, 9], [13.8, 12.4]]), ring("image-sun", 10.6, 6, 2.6)]),
  camera: ic(1.45, () => [box("cam-body", 1.8, 4.4, 12.4, 9, 1.5), poly("cam-bump", [[5.4, 4.5], [6.4, 2.4], [9.6, 2.4], [10.6, 4.5]]), ring("cam-lens", 8, 8.9, 4.2)]),
  video: ic(1.45, () => [box("video-box", 1.6, 3.6, 8.8, 8.8, 1.6), poly("video-lens", [[10.6, 6.6], [14.2, 4.4], [14.2, 11.6], [10.6, 9.4]])]),
  music: ic(1.45, () => [ring("music-a", 3.8, 11.8, 3.2), ring("music-b", 10.6, 10.4, 3.2), line("music-stem-a", [5.4, 11.4], [5.4, 3.6], 0.2), line("music-stem-b", [12.2, 10], [12.2, 2.2], 0.2), line("music-beam", [5.4, 3.8], [12.2, 2.4], 0.2)]),
  volume: ic(1.45, () => [poly("vol-body", [[1.8, 6], [4.6, 6], [8, 3], [8, 13], [4.6, 10], [1.8, 10], [1.8, 6]]), curve("vol-a", arc(8, 8, 3.8, -48, 48, 5)), curve("vol-b", arc(8, 8, 6.3, -48, 48, 6))]),
  mic: ic(1.45, () => [box("mic-body", 5.6, 1.8, 4.8, 7.6, 2.4), curve("mic-cup", arc(8, 7.4, 5, 0, 180, 8)), line("mic-stand", [8, 12.4], [8, 14.2], 0.1)]),
  palette: ic(1.45, () => [curve("palette", [[8, 1.8], [12.6, 3], [14.4, 6.8], [12.8, 9.6], [10.6, 9.4], [9.6, 10.6], [10.4, 12.6], [8, 14.2], [4, 13], [2, 9], [3, 4.6], [8, 1.8]]), disc("pal-a", 5, 7, 0.7), disc("pal-b", 7.8, 4.6, 0.7), disc("pal-c", 11, 5.6, 0.7), disc("pal-d", 5.2, 10.4, 0.7)]),
  wand: ic(1.45, () => {
    const at = along([2.4, 13.6], -45);
    return [poly("wand-stick", [at(0, -0.9), at(8.8, -0.9), at(8.8, 0.9), at(0, 0.9), at(0, -0.9)]), line("wand-s1", [11.6, 1.8], [11.6, 5], 0.1), line("wand-s2", [10, 3.4], [13.2, 3.4], 0.1), line("wand-s3", [13.4, 8.2], [13.4, 10.6], 0.1), line("wand-s4", [12.2, 9.4], [14.6, 9.4], 0.1)];
  }),
  sparkle: ic(1.4, () => [
    curve("sparkle", [[7, 1.8], [7.7, 6.6], [12.2, 7.6], [7.7, 8.6], [7, 14.2], [6.3, 8.6], [1.8, 7.6], [6.3, 6.6], [7, 1.8]]),
    line("sparkle-a", [12.6, 1.6], [12.6, 5]),
    line("sparkle-b", [10.9, 3.3], [14.3, 3.3]),
  ]),
  heart: ic(1.5, () => [
    curve("heart", [
      [8, 13.8], [4.6, 10.8], [2.2, 8.2], [1.8, 5.4], [3.2, 3.2], [5.6, 2.7], [7.3, 3.9], [8, 5.6],
      [8.7, 3.9], [10.4, 2.7], [12.8, 3.2], [14.2, 5.4], [13.8, 8.2], [11.4, 10.8], [8, 13.8],
    ]),
  ]),
  star: ic(1.4, () => [
    poly(
      "star",
      Array.from({ length: 11 }, (_, i) => {
        const a = ((i * 36 - 90) * Math.PI) / 180;
        const r = i % 2 ? 3 : 6.6;
        return [8 + Math.cos(a) * r, 8.6 + Math.sin(a) * r] as const;
      }),
    ),
  ]),
  bookmark: ic(1.45, () => [poly("bookmark", [[3.8, 1.8], [12.2, 1.8], [12.2, 14.2], [8, 10.8], [3.8, 14.2], [3.8, 1.8]])]),
  gift: ic(1.45, () => [box("gift-lid", 2, 5.2, 12, 3, 1), poly("gift-body", [[3.2, 8.2], [3.2, 14], [12.8, 14], [12.8, 8.2]]), line("gift-ribbon", [8, 5.2], [8.1, 14], 0.1), curve("gift-bow", [[8, 5], [6, 2.4], [4.4, 3.4], [5.6, 5], [8, 5], [10.4, 5], [11.6, 3.4], [10, 2.4], [8, 5]])]),
  trophy: ic(1.45, () => [poly("trophy-cup", [[4.4, 2.2], [11.6, 2.2], [11.6, 6.2], [10, 8.6], [8, 9.4], [6, 8.6], [4.4, 6.2], [4.4, 2.2]]), curve("trophy-l", [[4.4, 3.6], [2.2, 3.6], [2.4, 6], [5, 7]]), curve("trophy-r", [[11.6, 3.6], [13.8, 3.6], [13.6, 6], [11, 7]]), line("trophy-stem", [8, 9.6], [8, 12.2], 0.1), line("trophy-base", [5, 13.8], [11, 13.8], 0.1)]),
  award: ic(1.45, () => [ring("award-ring", 8, 6.2, 7.6), poly("award-ribbon", [[5.6, 10.4], [4.4, 14.2], [8, 12.4], [11.6, 14.2], [10.4, 10.4]])]),

  // Places and things.
  globe: ic(1.45, () => [ring("globe-ring", 8, 8, 13), oval("globe-meridian", 8, 8, 3, 6.4), line("globe-equator", [1.8, 8], [14.2, 8.1], 0.2)]),
  map: ic(1.45, () => [poly("map-body", [[1.8, 3.6], [5.6, 2.2], [10.4, 3.8], [14.2, 2.4], [14.2, 12.4], [10.4, 13.8], [5.6, 12.2], [1.8, 13.6], [1.8, 3.6]]), line("map-fold-a", [5.6, 2.4], [5.7, 12.2], 0.2), line("map-fold-b", [10.4, 3.8], [10.3, 13.6], 0.2)]),
  compass: ic(1.45, () => [ring("compass-ring", 8, 8, 13.2), poly("compass-needle", [[10.6, 5.4], [9.2, 9.2], [5.4, 10.6], [6.8, 6.8], [10.6, 5.4]])]),
  target: ic(1.45, () => [ring("target-a", 8, 8, 13.2), ring("target-b", 8, 8, 7.4), disc("target-c", 8, 8, 0.9)]),
  mountain: ic(1.45, () => [poly("mountain", [[1.6, 13.4], [6, 4.8], [8.8, 9.6], [10.4, 7], [14.4, 13.4], [1.6, 13.4]])]),
  sun: ic(1.5, () => [
    ring("sun-ring", 8, 8, 6.2),
    ...Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4 + 0.2;
      return line(`sun-ray-${i}`, [8 + Math.cos(a) * 4.8, 8 + Math.sin(a) * 4.8], [8 + Math.cos(a) * 6.8, 8 + Math.sin(a) * 6.8], 0.2);
    }),
  ]),
  moon: ic(1.5, () => [moon()]),
  cloud: ic(1.45, () => [curve("cloud", [[4.4, 12.6], [2.8, 11.6], [2.2, 9.6], [3.4, 7.8], [5.2, 7.4], [5.8, 5.2], [7.8, 3.8], [10.2, 4.4], [11.2, 6.4], [13, 7], [14, 8.8], [13.6, 11], [11.8, 12.6], [4.4, 12.6]])]),
  zap: ic(1.45, () => [poly("zap", [[9.4, 1.8], [3, 9], [7.6, 9], [6.6, 14.2], [13, 6.8], [8.4, 6.8], [9.4, 1.8]])]),
  flame: ic(1.45, () => [curve("flame", [[8, 1.8], [11.8, 5.8], [12.6, 9.2], [11.2, 12.6], [8, 14.2], [4.8, 12.6], [3.4, 9.2], [4.6, 6.8], [6.2, 8.2], [6.8, 5.4], [8, 1.8]])]),
  droplet: ic(1.45, () => [curve("droplet", [[8, 1.8], [11.6, 6.4], [12.6, 9.2], [11.4, 12.2], [8, 13.8], [4.6, 12.2], [3.4, 9.2], [4.4, 6.4], [8, 1.8]])]),
  leaf: ic(1.45, () => [curve("leaf", [[3, 13], [3.4, 8], [6, 4.4], [10, 2.6], [13.4, 2.4], [13.2, 6.2], [11.6, 10.2], [8, 12.6], [3.8, 13]]), line("leaf-vein", [2.4, 14], [9.2, 7.2], 0.2)]),
  hourglass: ic(1.45, () => [poly("hourglass", [[3.8, 2], [12.2, 2], [12.2, 3.6], [8, 8], [12.2, 12.4], [12.2, 14], [3.8, 14], [3.8, 12.4], [8, 8], [3.8, 3.6], [3.8, 2]])]),
  calendar: ic(1.45, () => [
    box("cal-box", 1.8, 3.2, 12.4, 11, 1.2),
    line("cal-rule", [2.2, 6.8], [13.8, 6.7]),
    line("cal-ring-a", [5, 1.6], [5.1, 4.6]),
    line("cal-ring-b", [11, 1.6], [10.9, 4.6]),
    disc("cal-d1", 5.4, 10.4, 0.7),
    disc("cal-d2", 10.6, 10.4, 0.7),
  ]),
  clock: ic(1.5, () => [ring("clock-ring", 8, 8, 13), poly("clock-hands", [[8, 4.2], [8, 8.2], [10.8, 10]])]),
  battery: ic(1.45, () => [box("bat-box", 1.6, 4.4, 11.6, 7.2, 1.6), line("bat-nub", [14.6, 7], [14.6, 9], 0.1), line("bat-a", [4.2, 6.9], [4.2, 9.2], 0.1), line("bat-b", [6.8, 6.9], [6.8, 9.2], 0.1)]),
  wifi: ic(1.5, () => [curve("wifi-a", arc(8, 12.4, 3.2, -128, -52, 5)), curve("wifi-b", arc(8, 12.4, 6.2, -128, -52, 6)), curve("wifi-c", arc(8, 12.4, 9.3, -128, -52, 7)), disc("wifi-dot", 8, 12.6, 0.8)]),
  cart: ic(1.45, () => [poly("cart-body", [[1.6, 2.6], [3.4, 2.6], [5, 10.4], [12.4, 10.4], [13.8, 5], [4, 5]]), disc("cart-w1", 6, 13.2, 0.9), disc("cart-w2", 11.4, 13.2, 0.9)]),
  "credit-card": ic(1.45, () => [box("cc-box", 1.6, 3.2, 12.8, 9.6, 1.6), line("cc-stripe", [1.8, 6.6], [14.2, 6.5], 0.2), line("cc-num", [3.8, 10], [6.8, 10], 0.1)]),
  wallet: ic(1.45, () => [box("wallet-box", 1.8, 3.4, 12.4, 9.8, 1.6), box("wallet-clasp", 8.8, 6.4, 4.6, 3.6, 1.2)]),
  package: ic(1.45, () => [poly("pkg-hex", [[8, 1.8], [13.8, 4.8], [13.8, 11.2], [8, 14.2], [2.2, 11.2], [2.2, 4.8], [8, 1.8]]), poly("pkg-top", [[2.4, 4.9], [8, 8], [13.6, 4.9]]), line("pkg-edge", [8, 8], [8.1, 14], 0.1)]),
  briefcase: ic(1.45, () => [box("brief-box", 1.8, 4.8, 12.4, 8.8, 1.4), poly("brief-handle", [[5.6, 4.8], [5.6, 2.4], [10.4, 2.4], [10.4, 4.8]]), line("brief-band", [1.9, 8.6], [14.1, 8.5], 0.2)]),
  lightbulb: ic(1.45, () => [curve("bulb", [[5.6, 10.4], [4, 8.6], [3.6, 6.2], [5, 3.6], [8, 2.4], [11, 3.6], [12.4, 6.2], [12, 8.6], [10.4, 10.4], [10.2, 11.6], [5.8, 11.6], [5.6, 10.4]]), line("bulb-base", [6, 13.4], [10, 13.4], 0.1)]),
  coffee: ic(1.45, () => [poly("coffee-cup", [[2.6, 5.6], [3.6, 12.6], [4.6, 13.8], [9.4, 13.8], [10.4, 12.6], [11.4, 5.6]]), line("coffee-rim", [2.2, 5.6], [11.8, 5.5], 0.2), curve("coffee-handle", [[11.2, 6.8], [13.6, 7], [13.8, 9.6], [10.8, 10.6]]), curve("coffee-steam", [[5.2, 1.8], [6, 3], [5.2, 4.2]])]),
  percent: ic(1.5, () => [ring("pct-a", 4.6, 4.6, 3.2), ring("pct-b", 11.4, 11.4, 3.2), line("pct-bar", [12.6, 3.4], [3.4, 12.6], 0.2)]),
  asterisk: ic(1.5, () => [line("ast-a", [8, 1.8], [8.1, 14.2], 0.2), line("ast-b", [2.6, 4.9], [13.4, 11.1], 0.2), line("ast-c", [2.6, 11.1], [13.4, 4.9], 0.2)]),

  // Building software.
  code: ic(1.5, () => [poly("code-l", [[5.2, 4.2], [1.8, 8], [5.2, 11.8]]), poly("code-r", [[10.8, 4.2], [14.2, 8], [10.8, 11.8]]), line("code-slash", [9.3, 2.8], [6.7, 13.2])]),
  terminal: ic(1.6, () => [poly("term-prompt", [[2.2, 4], [6, 7.8], [2.2, 11.6]]), line("term-cursor", [7.8, 12.2], [13.8, 12.1])]),
  braces: ic(1.5, () => {
    const left: P[] = [[6.8, 2.2], [5.4, 2.6], [5.2, 4.2], [5.2, 6.4], [3.6, 8], [5.2, 9.6], [5.2, 11.8], [5.4, 13.4], [6.8, 13.8]];
    return [curve("braces-l", left), curve("braces-r", flip(left))];
  }),
  command: ic(1.4, () => {
    const loop = (id: string, flipX: boolean, flipY: boolean) => {
      const pts: P[] = [[6.2, 6.2], [4.2, 6.2], [2.8, 5.2], [2.8, 3.6], [4.2, 2.6], [5.8, 3], [6.2, 4.4], [6.2, 6.2]];
      return curve(id, pts.map(([x, y]) => [flipX ? 16 - x : x, flipY ? 16 - y : y] as P));
    };
    return [poly("cmd-square", [[6.2, 6.2], [9.8, 6.2], [9.8, 9.8], [6.2, 9.8], [6.2, 6.2]]), loop("cmd-tl", false, false), loop("cmd-tr", true, false), loop("cmd-bl", false, true), loop("cmd-br", true, true)];
  }),
  "git-branch": ic(1.45, () => [line("gb-line", [4, 2], [4.1, 10.8], 0.2), ring("gb-a", 4, 12.4, 3.2), ring("gb-b", 12, 4.6, 3.2), curve("gb-curve", [[12, 6.3], [11.8, 9], [9.4, 10.6], [6.8, 11.6], [5.6, 12]])]),
  database: ic(1.45, () => [oval("db-top", 8, 3.8, 5.6, 2, 10), line("db-l", [2.4, 3.8], [2.4, 12.2], 0.2), line("db-r", [13.6, 3.8], [13.6, 12.2], 0.2), curve("db-mid", [[2.4, 8], [5, 9.8], [11, 9.8], [13.6, 8]]), curve("db-bottom", [[2.4, 12.2], [5, 14], [11, 14], [13.6, 12.2]])]),
  server: ic(1.45, () => [box("srv-a", 1.8, 2.4, 12.4, 4.8, 1.2), box("srv-b", 1.8, 8.8, 12.4, 4.8, 1.2), line("srv-la", [4.2, 4.8], [5.2, 4.8], 0.1), line("srv-lb", [4.2, 11.2], [5.2, 11.2], 0.1)]),
  cpu: ic(1.4, () => [box("cpu-box", 3.8, 3.8, 8.4, 8.4, 1.4), box("cpu-core", 6.4, 6.4, 3.2, 3.2, 0.8), ...[6.4, 9.6].flatMap((x, i) => [line(`cpu-t${i}`, [x, 1.8], [x, 3.8], 0.1), line(`cpu-b${i}`, [x, 12.2], [x, 14.2], 0.1)]), ...[6.4, 9.6].flatMap((y, i) => [line(`cpu-l${i}`, [1.8, y], [3.8, y], 0.1), line(`cpu-r${i}`, [12.2, y], [14.2, y], 0.1)])]),
  bug: ic(1.45, () => [oval("bug-body", 8, 9, 3.4, 4.4), line("bug-ant-a", [6.8, 5], [5.4, 2.2], 0.1), line("bug-ant-b", [9.2, 5], [10.6, 2.2], 0.1), line("bug-l1", [4.6, 7.4], [2.2, 6.2], 0.1), line("bug-l2", [4.6, 9.6], [2, 9.6], 0.1), line("bug-l3", [5, 12], [2.8, 13.4], 0.1), line("bug-r1", [11.4, 7.4], [13.8, 6.2], 0.1), line("bug-r2", [11.4, 9.6], [14, 9.6], 0.1), line("bug-r3", [11, 12], [13.2, 13.4], 0.1)]),
  "bar-chart": ic(1.5, () => [poly("bc-axis", [[2.2, 2], [2.2, 13.8], [14, 13.8]]), line("bc-a", [5.6, 12], [5.5, 8.2], 0.2), line("bc-b", [8.6, 12], [8.7, 4.8], 0.2), line("bc-c", [11.6, 12], [11.5, 9.6], 0.2)]),
  "line-chart": ic(1.5, () => [poly("lc-axis", [[2.2, 2], [2.2, 13.8], [14, 13.8]]), poly("lc-line", [[4.6, 10.6], [7.2, 7.4], [9.2, 9.2], [13, 4.6]])]),
  "pie-chart": ic(1.45, () => [ring("pie-ring", 8, 8, 13), line("pie-a", [8, 1.6], [8.1, 8], 0.2), line("pie-b", [8.1, 8], [13.4, 10.8], 0.2)]),
} satisfies Record<string, Def>;

export type IconName = keyof typeof icons;

/** Every icon's name, grouped the way the docs show them. */
export const iconNames = Object.keys(icons) as IconName[];

const built = new Map<string, Glyph>();

function glyphFor(name: IconName): Glyph {
  const def: Def = icons[name];
  if (typeof def !== "function") return def;
  let glyph = built.get(name);
  if (!glyph) {
    glyph = def();
    built.set(name, glyph);
  }
  return glyph;
}

/**
 * A pen-drawn icon. Size it with a class (`size-5`); it takes the text
 * colour. `draw="mount"` draws it in as it appears; `label` names it for
 * screen readers when it stands alone.
 */
export function InkIcon({ name, ...props }: GlyphProps & { name: IconName }) {
  return <GlyphSvg glyph={glyphFor(name)} name={name} {...props} />;
}
