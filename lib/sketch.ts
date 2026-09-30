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

/** Heading underline: a quick stroke to the right that hooks back underneath itself. */
export function underlineStroke(seed: number, w: number, { hook = true } = {}) {
  const r = createRng(seed);
  const y0 = 1.5 + spread(r, 0.6);
  const out = strokeSegment(r, [-3, y0], [w + 4, y0 - 1.2 - r() * 1.2], { bow: 0.8, jitter: 0.4 });
  let d = `M${pt(out.s)}C${pt(out.c1)} ${pt(out.c2)} ${pt(out.e)}`;
  if (hook) {
    const back = strokeSegment(r, [out.e[0] - 7 - r() * 4, out.e[1] + 3.2], [w * (0.12 + r() * 0.2), y0 + 4 + r() * 1.2], { bow: 0.6, jitter: 0.4 });
    d += `L${pt(back.s)}C${pt(back.c1)} ${pt(back.c2)} ${pt(back.e)}`;
  }
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
