// Deterministic "ballpoint" geometry. Every shape is derived from a seed, so
// the server and the client draw the exact same wobble (no hydration drift),
// and the same box keeps its personality across renders and resizes.

type Pt = readonly [number, number];
export type Rng = () => number;

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(input: string | number): number {
  const s = String(input);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const n1 = (v: number) => Math.round(v * 10) / 10;
const pt = (p: Pt) => `${n1(p[0])} ${n1(p[1])}`;
const spread = (r: Rng, amount: number) => (r() - 0.5) * 2 * amount;

/** One hand-pulled stroke from a to b: jittered ends, a gentle bow, optional overshoot. */
function strokeSegment(
  r: Rng,
  a: Pt,
  b: Pt,
  { bow = 1, jitter = 0.8, overshoot = 0 }: { bow?: number; jitter?: number; overshoot?: number } = {},
) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const o1 = overshoot * (0.3 + r() * 0.7);
  const o2 = overshoot * (0.3 + r() * 0.7);
  const s: Pt = [a[0] - ux * o1 + spread(r, jitter), a[1] - uy * o1 + spread(r, jitter)];
  const e: Pt = [b[0] + ux * o2 + spread(r, jitter), b[1] + uy * o2 + spread(r, jitter)];
  const amp = Math.min(len * 0.018, 2.4) * bow;
  const bias = spread(r, amp);
  const c1: Pt = [s[0] + dx * 0.32 + nx * (bias + spread(r, amp * 0.5)), s[1] + dy * 0.32 + ny * (bias + spread(r, amp * 0.5))];
  const c2: Pt = [s[0] + dx * 0.68 + nx * (bias + spread(r, amp * 0.5)), s[1] + dy * 0.68 + ny * (bias + spread(r, amp * 0.5))];
  return { s, c1, c2, e };
}

/** A single straight-ish pen line. */
export function lineStroke(seed: number, a: Pt, b: Pt, opts?: { bow?: number; jitter?: number; overshoot?: number }) {
  const { s, c1, c2, e } = strokeSegment(createRng(seed), a, b, opts);
  return `M${pt(s)}C${pt(c1)} ${pt(c2)} ${pt(e)}`;
}

/**
 * A box drawn in one continuous motion: each side runs a little past its
 * corner and the pen ticks back into the next side, so the corners cross the
 * way quick ballpoint boxes do.
 */
export function boxStroke(seed: number, w: number, h: number, { overshoot = 2.4, bow = 1, jitter = 0.7 } = {}) {
  const r = createRng(seed);
  const corners: Pt[] = [
    [spread(r, jitter), spread(r, jitter)],
    [w + spread(r, jitter), spread(r, jitter)],
    [w + spread(r, jitter), h + spread(r, jitter)],
    [spread(r, jitter), h + spread(r, jitter)],
  ];
  let d = "";
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const seg = strokeSegment(r, a, b, { bow, jitter: jitter * 0.5, overshoot });
    d += i === 0 ? `M${pt(seg.s)}` : `L${pt(seg.s)}`;
    d += `C${pt(seg.c1)} ${pt(seg.c2)} ${pt(seg.e)}`;
  }
  return d;
}

/** Catmull-Rom through points, emitted as cubic Béziers. */
function smooth(points: Pt[]) {
  if (points.length < 2) return "";
  let d = `M${pt(points[0])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
}

/** A loose loop around a box — the "circle it with a pen" gesture. */
export function loopStroke(seed: number, w: number, h: number, { turns = 1.12, pad = 4 } = {}) {
  const r = createRng(seed);
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 + pad;
  const ry = h / 2 + pad;
  const start = -Math.PI * (0.62 + r() * 0.2);
  const steps = 16;
  const phase = r() * Math.PI * 2;
  const points: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + t * turns * Math.PI * 2;
    const k = 1 + 0.055 * Math.sin(a * 2 + phase) - t * 0.07 + spread(r, 0.018);
    points.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smooth(points);
}

/**
 * Heading underline, the way a hand underlines with emphasis: one pull
 * rising to the right, a sharp snap back under itself, then on past the end
 * of the word, gone over a second time, with a stray dash where the pen
 * lifted. Starts a little left of the word, the way the pen lands early.
 */
export function underlineStroke(seed: number, w: number, { hook = true } = {}) {
  const r = createRng(seed);
  const start: Pt = [-9 - r() * 4, 5.5 + spread(r, 0.8)];
  const turn: Pt = [w * (0.5 + r() * 0.12), 1.6 + spread(r, 0.6)];
  const first = strokeSegment(r, start, turn, { bow: 0.5, jitter: 0.3 });
  let d = `M${pt(first.s)}C${pt(first.c1)} ${pt(first.c2)} ${pt(first.e)}`;
  if (!hook) return d;
  // Snap back: short, sharp, a touch lower.
  const back: Pt = [turn[0] - w * (0.13 + r() * 0.06), 5 + spread(r, 0.6)];
  d += `L${pt(back)}`;
  const end: Pt = [w * (1.05 + r() * 0.05), 0.6 + spread(r, 0.5)];
  const second = strokeSegment(r, back, end, { bow: 0.5, jitter: 0.3 });
  d += `C${pt(second.c1)} ${pt(second.c2)} ${pt(second.e)}`;
  // A lighter second pass over the first run, and the stray dash.
  const again = strokeSegment(r, [w * 0.04, 4.4 + spread(r, 0.5)], [turn[0] - w * 0.06, 2.4], { bow: 0.4, jitter: 0.4 });
  d += `M${pt(again.s)}C${pt(again.c1)} ${pt(again.c2)} ${pt(again.e)}`;
  const dashX = end[0] + 3 + r() * 3;
  d += `M${pt([dashX, end[1] + 0.4])}L${pt([dashX + 5 + r() * 4, end[1] + 0.1])}`;
  return d;
}

/** Link underline: one relaxed stroke with a slight lift at the end. */
export function linkStroke(seed: number, w: number) {
  const r = createRng(seed);
  const y = 2 + spread(r, 0.4);
  const seg = strokeSegment(r, [-1, y], [w + 1.5, y - 0.8 - r() * 0.8], { bow: 1.2, jitter: 0.3 });
  return `M${pt(seg.s)}C${pt(seg.c1)} ${pt(seg.c2)} ${pt(seg.e)}`;
}

/** A gently wandering horizontal rule. */
export function ruleStroke(seed: number, w: number) {
  const r = createRng(seed);
  const n = Math.max(3, Math.round(w / 140));
  const points: Pt[] = [];
  for (let i = 0; i <= n; i++) points.push([(w * i) / n + (i === 0 || i === n ? 0 : spread(r, 8)), 1.5 + spread(r, 0.9)]);
  return smooth(points);
}

/** A near-vertical divider stroke. */
export function verticalStroke(seed: number, h: number) {
  return lineStroke(seed, [1.5, 0], [1.5, h], { bow: 0.6, jitter: 0.5, overshoot: 1 });
}

/**
 * Back-and-forth colouring-in strokes filling a w×h box, overrunning the
 * edges a touch, like shading a button solid with a pen.
 */
export function scribbleFill(seed: number, w: number, h: number, { gap = 3.4, slant = 0.45, overrun = 1.6 } = {}) {
  const r = createRng(seed);
  const run = h * slant;
  let x = -run - 2;
  let top = true;
  let d = `M${pt([x + run, -overrun])}`;
  while (x < w + 2) {
    x += gap * (0.8 + r() * 0.4);
    const p: Pt = top ? [x, h + overrun + spread(r, 0.8)] : [x + run, -overrun + spread(r, 0.8)];
    d += `L${pt(p)}`;
    top = !top;
  }
  return d;
}

/** Parallel hatch strokes across a w×h box, returned one path per stroke. */
export function hatchStrokes(seed: number, w: number, h: number, { gap = 5, angle = -48, jitter = 0.8, inset = 0 } = {}) {
  const r = createRng(seed);
  const t = Math.tan((angle * Math.PI) / 180);
  const lines: string[] = [];
  const span = Math.abs(t) * h;
  for (let c = -span; c < w + span; c += gap * (0.85 + r() * 0.3)) {
    // Line: x = c + y * t (t negative leans right-to-left going down).
    const pts: Pt[] = [];
    for (const y of [inset, h - inset]) {
      const x = c + (y - inset) * t;
      pts.push([x, y]);
    }
    let [a, b] = pts;
    const clip = (p: Pt, q: Pt): Pt => {
      let [x, y] = p;
      if (x < inset) {
        y = p[1] + ((inset - p[0]) * (q[1] - p[1])) / (q[0] - p[0]);
        x = inset;
      } else if (x > w - inset) {
        y = p[1] + ((w - inset - p[0]) * (q[1] - p[1])) / (q[0] - p[0]);
        x = w - inset;
      }
      return [x, y];
    };
    a = clip(a, b);
    b = clip(b, a);
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 3) continue;
    const seg = strokeSegment(r, a, b, { bow: 0.5, jitter });
    lines.push(`M${pt(seg.s)}C${pt(seg.c1)} ${pt(seg.c2)} ${pt(seg.e)}`);
  }
  return lines;
}

/** A long timeline stroke ending in a two-flick arrowhead. */
export function arrowStroke(seed: number, w: number, y = 6) {
  const r = createRng(seed);
  const shaft = strokeSegment(r, [0, y], [w, y + spread(r, 0.8)], { bow: 0.35, jitter: 0.5 });
  const tip = shaft.e;
  const head = `M${pt([tip[0] - 9 + spread(r, 1), tip[1] - 5.5 + spread(r, 0.8)])}Q${pt([tip[0] - 3, tip[1] - 1.5])} ${pt([tip[0] + 1, tip[1]])}Q${pt([tip[0] - 3, tip[1] + 1.8])} ${pt([tip[0] - 8.5 + spread(r, 1), tip[1] + 5 + spread(r, 0.8)])}`;
  return { shaft: `M${pt(shaft.s)}C${pt(shaft.c1)} ${pt(shaft.c2)} ${pt(shaft.e)}`, head };
}

/** A small filled ink dot: a tight scribbled spiral. */
export function dotStroke(seed: number, radius = 3) {
  const r = createRng(seed);
  const points: Pt[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * Math.PI * 4.2 + r() * 0.3;
    const k = radius * (1 - t * 0.75) + spread(r, 0.25);
    points.push([Math.cos(a) * k, Math.sin(a) * k]);
  }
  return smooth(points);
}

/** An irregular ink blot with a few droplets, in a 0–100 box, for masks. */
export function blotPath(seed: number) {
  const r = createRng(seed);
  const points: Pt[] = [];
  const steps = 22;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const k = 38 + spread(r, 5) + (r() > 0.8 ? 4 + r() * 5 : 0);
    points.push([50 + Math.cos(a) * k, 50 + Math.sin(a) * k]);
  }
  points.push(points[0], points[1], points[2]);
  let d = smooth(points.slice(1)) + "Z";
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const dist = 44 + r() * 5;
    const rad = 0.8 + r() * 2.2;
    const cx = 50 + Math.cos(a) * dist;
    const cy = 50 + Math.sin(a) * dist;
    d += `M${n1(cx - rad)} ${n1(cy)}a${n1(rad)} ${n1(rad)} 0 1 0 ${n1(rad * 2)} 0a${n1(rad)} ${n1(rad)} 0 1 0 ${n1(-rad * 2)} 0Z`;
  }
  return d;
}

/**
 * A box drawn as four separate pulls, the pen lifted between sides: each
 * line runs well past its corners, so corners cross like a quick sketch.
 * `shift` nudges the whole pass, for re-traced outlines that don't line up.
 */
export function crossedBoxStroke(
  seed: number,
  w: number,
  h: number,
  { overshoot = 5, jitter = 1.2, shift = [0, 0] as Pt } = {},
) {
  const r = createRng(seed);
  const [sx, sy] = shift;
  const c: Pt[] = [
    [sx + spread(r, jitter), sy + spread(r, jitter)],
    [w + sx + spread(r, jitter), sy + spread(r, jitter)],
    [w + sx + spread(r, jitter), h + sy + spread(r, jitter)],
    [sx + spread(r, jitter), h + sy + spread(r, jitter)],
  ];
  let d = "";
  // Top, right, bottom, left — in the order a hand tends to go.
  for (const [a, b] of [[0, 1], [1, 2], [3, 2], [0, 3]] as const) {
    const seg = strokeSegment(r, c[a], c[b], { bow: 1.1, jitter: jitter * 0.4, overshoot });
    d += `M${pt(seg.s)}C${pt(seg.c1)} ${pt(seg.c2)} ${pt(seg.e)}`;
  }
  return d;
}

/**
 * Shading a box solid with a ballpoint: long shallow strokes swept back and
 * forth without lifting the pen, at uneven spacing so streaks of paper show.
 */
export function shadeFill(seed: number, w: number, h: number, { gap = 2.6, angle = -16, overrun = 3 } = {}) {
  const r = createRng(seed);
  const t = Math.tan((angle * Math.PI) / 180);
  // Strokes are near-horizontal lines y = c + x·t, stepped down the box.
  const span = Math.abs(t) * w;
  let c = -overrun - (t < 0 ? 0 : span);
  const end = h + overrun + (t < 0 ? span : 0);
  let forward = true;
  let d = "";
  while (c < end) {
    const x0 = -overrun - r() * 2;
    const x1 = w + overrun + r() * 2;
    const a: Pt = [x0, c + x0 * t + spread(r, 0.6)];
    const b: Pt = [x1, c + x1 * t + spread(r, 0.6)];
    const [p, q] = forward ? [a, b] : [b, a];
    const seg = strokeSegment(r, p, q, { bow: 0.6, jitter: 0.4 });
    d += d ? `L${pt(seg.s)}` : `M${pt(seg.s)}`;
    d += `C${pt(seg.c1)} ${pt(seg.c2)} ${pt(seg.e)}`;
    forward = !forward;
    c += gap * (0.6 + r() * 0.9);
  }
  return d;
}

/** A few short shadow ticks across one corner of a box (bottom-right). */
export function cornerTicks(seed: number, w: number, h: number, { count = 5, len = 7 } = {}) {
  const r = createRng(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = w - 6 - i * (4.2 + r() * 1.4);
    const y = h + 1 + spread(r, 0.8);
    const seg = strokeSegment(r, [x - len * 0.45, y + len * 0.5], [x + len * 0.45, y - len * 0.5], { bow: 0.3, jitter: 0.4 });
    d += `M${pt(seg.s)}C${pt(seg.c1)} ${pt(seg.c2)} ${pt(seg.e)}`;
  }
  return d;
}

/**
 * Margin scrawls as pen pulls (feed to inkPulls). The kinds of marks a page
 * collects while someone gets a ballpoint going.
 */

/** Fast back-and-forth with sharp turns, drifting as the hand moves on. */
export function zigzagPulls(seed: number, w: number, h: number, { passes = 6, vertical = true } = {}): Pt[][] {
  const r = createRng(seed);
  const pts: Pt[] = [];
  const length = vertical ? h : w;
  const breadth = vertical ? w : h;
  let along = 0;
  for (let i = 0; i <= passes; i++) {
    // Uneven reach on both sides, and the hand runs ahead on the out-stroke.
    const swing = i % 2 ? breadth * (0.5 + r() * 0.5) : breadth * r() * 0.3;
    pts.push(vertical ? [swing, along] : [along, swing]);
    along = Math.min(length, along + (length / passes) * (i % 2 ? 0.3 + r() * 0.5 : 0.9 + r() * 0.9));
  }
  return [pts];
}

/** A corner worked over: long leaning pulls, a fan of flicks, a jagged cross. */
export function cornerPulls(seed: number, w: number, h: number): Pt[][] {
  const r = createRng(seed);
  const out: Pt[][] = [];
  for (let i = 0; i < 4; i++) {
    const x = w * (0.16 + i * 0.07 + r() * 0.06);
    out.push([
      [x + w * 0.05, h * r() * 0.06],
      [x - w * 0.06 + spread(r, 2), h * (0.95 - i * 0.15 - r() * 0.1)],
    ]);
  }
  const ox = w * 0.08;
  const oy = h * 0.22;
  for (let i = 0; i < 3; i++) {
    const a = -0.5 + i * 0.24 + spread(r, 0.08);
    const len = w * (0.8 + r() * 0.3);
    out.push([
      [ox + spread(r, 3), oy + spread(r, 3)],
      [ox + Math.cos(a) * len, oy + Math.sin(a) * len],
    ]);
  }
  out.push(...zigzagPulls(seed + 1, w * 0.9, h * 0.14, { passes: 7, vertical: false }));
  return out;
}

/** A star scratched in a hurry: four or five pulls through roughly one point. */
export function starPulls(seed: number, w: number, h: number): Pt[][] {
  const r = createRng(seed);
  const n = 4 + Math.round(r());
  const out: Pt[][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI + spread(r, 0.25);
    const rx = (w / 2) * (0.7 + r() * 0.3);
    const ry = (h / 2) * (0.7 + r() * 0.3);
    const ox = w / 2 + spread(r, w * 0.07);
    const oy = h / 2 + spread(r, h * 0.07);
    out.push([
      [ox - Math.cos(a) * rx, oy - Math.sin(a) * ry],
      [ox + Math.cos(a) * rx, oy + Math.sin(a) * ry],
    ]);
  }
  return out;
}

/** A patch of parallel slashes, like shading struck into a corner. */
export function slashPulls(seed: number, w: number, h: number, { count = 7 } = {}): Pt[][] {
  const r = createRng(seed);
  const out: Pt[][] = [];
  for (let i = 0; i < count; i++) {
    const x = (w / count) * i + spread(r, 1.5);
    const len = h * (0.55 + r() * 0.45);
    const top = (h - len) * r();
    out.push([
      [x + h * 0.35, top],
      [x, top + len],
    ]);
  }
  return out;
}

/** Three quick emphasis dashes fanning out, like the marks beside a signature. */
export function flickPulls(seed: number): Pt[][] {
  const r = createRng(seed);
  return [
    [[3 + spread(r, 1), 14], [10 + spread(r, 1), 2]],
    [[10, 19 + spread(r, 1)], [22, 12 + spread(r, 1)]],
    [[13, 25 + spread(r, 0.8)], [25, 24 + spread(r, 0.8)]],
  ];
}

/** Two or three tiny scratches, the pen touched down and lifted. */
export function speckPulls(seed: number): Pt[][] {
  const r = createRng(seed);
  const out: Pt[][] = [];
  for (let i = 0; i < 3; i++) {
    const x = 3 + i * (7 + r() * 6);
    const y = 4 + spread(r, 2.5);
    const a = r() * Math.PI;
    const l = 1.5 + r() * 2.5;
    out.push([
      [x - Math.cos(a) * l, y - Math.sin(a) * l],
      [x + Math.cos(a) * l, y + Math.sin(a) * l],
    ]);
  }
  return out;
}

/**
 * The footer's signature rule: a long, gently wandering line pulled twice,
 * the second pass starting late and drifting off the first, running out into
 * a worried knot at the right end. Fits 0…w by roughly -34…16.
 */
export function signaturePulls(seed: number, w: number): { rule: Pt[][]; knot: Pt[][] } {
  const r = createRng(seed);
  const pass = (y: number, from: number, to: number) => {
    const n = Math.max(4, Math.round((to - from) / 90));
    const pts: Pt[] = [];
    for (let i = 0; i <= n; i++) pts.push([from + ((to - from) * i) / n + (i && i < n ? spread(r, 10) : 0), y + spread(r, 0.9)]);
    return pts;
  };
  const rule = [pass(5, 0, w - 30), pass(5.8, w * (0.3 + r() * 0.15), w - 8)];
  // The knot: fast slanted back-and-forth climbing up and right, worried
  // over twice, with flat pulls through its foot where the rule ran in.
  const kx = w - 96;
  const zig = (offset: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const cx = kx + 10 + t * 70 + offset;
      const cy = 4 - t * 22;
      const reach = 6 + Math.sin(t * Math.PI) * 13 + r() * 5;
      const side = i % 2 ? 1 : -1;
      pts.push([cx + side * reach * 0.55 + spread(r, 3), cy + side * reach + spread(r, 2)]);
    }
    return pts;
  };
  const flat: Pt[][] = [0, 1, 2].map((i) => [
    [kx - 40 - r() * 40, 5 + spread(r, 1.5)],
    [w - 4 + r() * 4, 2 - i * 2.5 + spread(r, 1.5)],
  ]);
  return { rule, knot: [zig(0), ...flat, zig(5)] };
}

// ─── Ballpoint ink ──────────────────────────────────────────────────────
// A uniform SVG stroke reads as a vector line. A pen doesn't draw like that:
// it lands light, presses through the stroke, and lifts off thin; it pools a
// little where it turns. These helpers build strokes as filled ribbons whose
// width follows that pressure, plus the centreline used to draw them on.

type Seg = { s: Pt; c1: Pt; c2: Pt; e: Pt };
type InkPt = { x: number; y: number; w: number };

const cubicAt = ({ s, c1, c2, e }: Seg, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * s[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * e[0],
    u * u * u * s[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * e[1],
  ];
};

const segPath = ({ s, c1, c2, e }: Seg) => `M${pt(s)}C${pt(c1)} ${pt(c2)} ${pt(e)}`;

/**
 * Sample a stroke with a pressure profile: `land` and `lift` are how much of
 * the stroke the pen takes to reach full pressure and to leave the paper
 * (0 keeps it full at that end, for strokes that join another).
 */
function pressured(r: Rng, seg: Seg, weight: number, { land = 0.12, lift = 0.25, from = 0.35, to = 0.12 } = {}): InkPt[] {
  const len = Math.hypot(seg.e[0] - seg.s[0], seg.e[1] - seg.s[1]);
  const n = Math.max(10, Math.round(len / 3));
  const phase = r() * Math.PI * 2;
  const freq = 2 + r() * 3;
  const out: InkPt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const [x, y] = cubicAt(seg, t);
    let p = 1;
    if (land > 0 && t < land) p = from + (1 - from) * Math.sin(((t / land) * Math.PI) / 2);
    if (lift > 0 && t > 1 - lift) p = Math.min(p, to + (1 - to) * Math.cos((((t - (1 - lift)) / lift) * Math.PI) / 2));
    // The hand's pressure wanders a little along the stroke.
    const wobble = 1 + 0.16 * Math.sin(t * freq * Math.PI + phase);
    out.push({ x, y, w: weight * p * wobble });
  }
  return out;
}

/** Outline a pressured centreline as one filled shape, with rounded ends. */
function ribbon(pts: InkPt[]) {
  const n = pts.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  const dirs: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(i - 1, 0)];
    const b = pts[Math.min(i + 1, n - 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const tx = (b.x - a.x) / len;
    const ty = (b.y - a.y) / len;
    const h = pts[i].w / 2;
    dirs.push([tx, ty]);
    left.push([pts[i].x - ty * h, pts[i].y + tx * h]);
    right.push([pts[i].x + ty * h, pts[i].y - tx * h]);
  }
  const tip = (i: number, sign: number): Pt => [pts[i].x + dirs[i][0] * sign * pts[i].w * 0.7, pts[i].y + dirs[i][1] * sign * pts[i].w * 0.7];
  let d = `M${pt(left[0])}`;
  for (let i = 1; i < n; i++) d += `L${pt(left[i])}`;
  d += `Q${pt(tip(n - 1, 1))} ${pt(right[n - 1])}`;
  for (let i = n - 2; i >= 0; i--) d += `L${pt(right[i])}`;
  d += `Q${pt(tip(0, -1))} ${pt(left[0])}Z`;
  return d;
}

const blob = (p: Pt, rad: number) =>
  `M${n1(p[0] - rad)} ${n1(p[1])}a${n1(rad)} ${n1(rad)} 0 1 0 ${n1(rad * 2)} 0a${n1(rad)} ${n1(rad)} 0 1 0 ${n1(-rad * 2)} 0Z`;

export type InkStroke = {
  /** Filled ribbons (several subpaths), and how dark this pass is. */
  ink: string;
  opacity: number;
  /** Centreline the draw-on mask follows, and when it runs. */
  guide: string;
  at: number;
  dur: number;
};

/**
 * Heading underline, the way a hand underlines with emphasis: the pen lands
 * a little left of the word and below it, pulls right and up, snaps back
 * under itself, then runs on past the end and lifts off thin. A lighter
 * second pass goes over the first run, and a stray dash follows the lift.
 * Fits roughly -18…w+18 by -2…16.
 */
export function underlineInk(seed: number, w: number, { weight = 2.5 } = {}): InkStroke[] {
  const r = createRng(seed);
  const start: Pt = [-12 - r() * 4, 12.5 + spread(r, 0.8)];
  const turn: Pt = [w * (0.5 + r() * 0.12), 3.6 + spread(r, 0.6)];
  // The snap is short and steep — a flick, not a second line.
  const back: Pt = [turn[0] - Math.min(38, Math.max(15, w * (0.07 + r() * 0.04))), 10.2 + spread(r, 0.6)];
  const end: Pt = [w * (1.03 + r() * 0.04) + 4, -0.6 + spread(r, 0.6)];

  const run = strokeSegment(r, start, turn, { bow: 0.7, jitter: 0.25 });
  const snap = strokeSegment(r, turn, back, { bow: 0.15, jitter: 0.15 });
  const out = strokeSegment(r, back, end, { bow: 0.6, jitter: 0.25 });
  // The second pass lands later and lifts sooner, a pen width under the first.
  const again = strokeSegment(r, [-6 + r() * 6, 14 + spread(r, 0.5)], [turn[0] - w * 0.08, 6.4 + spread(r, 0.5)], {
    bow: 0.6,
    jitter: 0.3,
  });
  const dx = end[0] + 5 + r() * 4;
  const dash = strokeSegment(r, [dx, end[1] + 0.6], [dx + 7 + r() * 5, end[1] + 0.1], { bow: 0.2, jitter: 0.2 });

  const main =
    ribbon(pressured(r, run, weight, { land: 0.1, lift: 0, from: 0.3 })) +
    ribbon(pressured(r, snap, weight * 0.85, { land: 0, lift: 0 })) +
    ribbon(pressured(r, out, weight, { land: 0, lift: 0.3, to: 0.1 })) +
    // Ink pools where the pen turns.
    blob(turn, weight * 0.62) +
    blob(back, weight * 0.55);

  return [
    { ink: main, opacity: 0.95, guide: segPath(run) + `L${pt(snap.e)}` + `C${pt(out.c1)} ${pt(out.c2)} ${pt(out.e)}`, at: 0, dur: 620 },
    { ink: ribbon(pressured(r, again, weight * 0.7, { land: 0.15, lift: 0.3 })), opacity: 0.7, guide: segPath(again), at: 520, dur: 260 },
    { ink: ribbon(pressured(r, dash, weight * 0.7, { land: 0.3, lift: 0.5, from: 0.2 })), opacity: 0.85, guide: segPath(dash), at: 640, dur: 90 },
  ];
}

/**
 * Any set of pen pulls in ballpoint ink. Each pull is a polyline the pen
 * follows without lifting: each leg is a slightly bowed stroke, the pen
 * lands light on the first and lifts thin off the last, and ink pools at
 * sharp turns. Pulls are drawn one after another, `gap` ms apart.
 */
export function inkPulls(
  seed: number,
  pulls: Pt[][],
  { weight = 1.3, opacity = 0.9, dur = 160, gap = 70, bow = 0.6, retrace = 0, wander = 1.6 } = {},
): InkStroke[] {
  const r = createRng(seed);
  // Scrawls get gone over: some pulls are traced again straight after, a
  // little off the first line, lighter, and not quite to either end.
  const all: { pts: Pt[]; again: boolean }[] = [];
  for (const pts of pulls) {
    all.push({ pts, again: false });
    if (r() < retrace) {
      const again = pts.map((p) => [p[0] + spread(r, wander), p[1] + spread(r, wander)] as Pt);
      const trim = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      again[0] = trim(again[0], again[1], r() * 0.25);
      const n = again.length - 1;
      again[n] = trim(again[n], again[n - 1], r() * 0.2);
      all.push({ pts: again, again: true });
    }
  }
  let at = 0;
  return all.map(({ pts, again }) => {
    const pw = again ? weight * 0.75 : weight;
    let ink = "";
    let guide = `M${pt(pts[0])}`;
    let length = 0;
    const legs = pts.length - 1;
    for (let i = 0; i < legs; i++) {
      const seg = strokeSegment(r, pts[i], pts[i + 1], { bow, jitter: 0.2 });
      seg.s = pts[i];
      if (i < legs - 1) seg.e = pts[i + 1];
      ink += ribbon(
        pressured(r, seg, pw, {
          land: i === 0 ? 0.25 : 0,
          lift: i === legs - 1 ? 0.35 : 0,
          from: 0.3,
          to: 0.08,
        }),
      );
      guide += `C${pt(seg.c1)} ${pt(seg.c2)} ${pt(seg.e)}`;
      length += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      if (i > 0) {
        const a = pts[i - 1];
        const b = pts[i];
        const c = pts[i + 1];
        const cos =
          ((b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1])) /
          ((Math.hypot(b[0] - a[0], b[1] - a[1]) * Math.hypot(c[0] - b[0], c[1] - b[1])) || 1);
        if (cos < 0.3) ink += blob(b, pw * 0.55);
      }
    }
    const pass = {
      ink,
      opacity: opacity * (again ? 0.6 : 0.85 + r() * 0.15),
      guide,
      at,
      dur: Math.round(dur * Math.min(2.4, Math.max(0.6, length / 60)) * (again ? 0.7 : 1)),
    };
    at += pass.dur * (again ? 0.9 : 0.6) + gap;
    return pass;
  });
}
