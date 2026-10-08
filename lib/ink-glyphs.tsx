import { Stroke, type DrawMode } from "@/lib/ink";
import { chevronStroke, crossStroke, dashStroke, dotStroke, hashSeed, lineStroke, plusStroke, ringStroke, tickStroke } from "@/lib/ink-sketch";

// Small icons drawn with the pen on a 16px grid: the close cross, ticks,
// chevrons and the like that components need inside their controls.
// Server-safe, and seeded by name, so a glyph is the same drawing wherever
// it appears. @ballpoint/ink-icons draws a fuller set on the same grid.

/** A glyph: its pen strokes, drawn in order, and how heavy the pen is. */
export type Glyph = { paths: string[]; width: number };

const seed = (name: string) => hashSeed(`glyph-${name}`);

/** Moves a stroke path by (dx, dy). Every number pair in our stroke paths is an absolute x,y point. */
export function shiftPath(d: string, dx: number, dy: number) {
  return d.replace(/(-?\d*\.?\d+)[ ,](-?\d*\.?\d+)/g, (_, x: string, y: string) => `${+(+x + dx).toFixed(2)} ${+(+y + dy).toFixed(2)}`);
}

const shift = shiftPath;

export const glyphs = {
  close: { paths: [shift(crossStroke(seed("close"), 12, { inset: 0.1 }), 2, 2)], width: 1.7 },
  check: { paths: [shift(tickStroke(seed("check"), 11), 2.5, 3.2)], width: 1.8 },
  "chevron-down": { paths: [shift(chevronStroke(seed("down"), 10, 6, "down"), 3, 5)], width: 1.6 },
  "chevron-up": { paths: [shift(chevronStroke(seed("up"), 10, 6, "up"), 3, 5)], width: 1.6 },
  "chevron-right": { paths: [shift(chevronStroke(seed("right"), 6, 10, "right"), 5, 3)], width: 1.6 },
  "chevron-left": { paths: [shift(chevronStroke(seed("left"), 6, 10, "left"), 5, 3)], width: 1.6 },
  dot: { paths: [shift(dotStroke(seed("dot"), 3.2), 8, 8)], width: 1.6 },
  minus: { paths: [shift(dashStroke(seed("minus"), 12), 2, 8)], width: 1.7 },
  plus: { paths: [shift(plusStroke(seed("plus"), 12), 2, 2)], width: 1.7 },
  // An exclamation mark and an i: a pull and a dot, the dot below or above.
  alert: { paths: [lineStroke(seed("alert"), [8, 2.2], [8.2, 9.6], { bow: 0.4, jitter: 0.2 }), shift(dotStroke(seed("alert-dot"), 1.1), 8.2, 13.2)], width: 1.8 },
  info: { paths: [shift(dotStroke(seed("info-dot"), 1.1), 8, 3.2), lineStroke(seed("info"), [7.9, 6.6], [8.1, 13.8], { bow: 0.4, jitter: 0.2 })], width: 1.8 },
  // The same, ringed: for alerts and notes.
  "info-circle": {
    paths: [shift(ringStroke(seed("info-ring"), 14, { turns: 1.06 }), 1, 1), shift(dotStroke(seed("info-ring-dot"), 0.9), 8, 4.9), lineStroke(seed("info-ring-i"), [7.9, 7.4], [8.1, 11.6], { bow: 0.3, jitter: 0.15 })],
    width: 1.5,
  },
  "alert-circle": {
    paths: [shift(ringStroke(seed("alert-ring"), 14, { turns: 1.06 }), 1, 1), lineStroke(seed("alert-ring-i"), [8, 4.2], [8.1, 9.2], { bow: 0.3, jitter: 0.15 }), shift(dotStroke(seed("alert-ring-dot"), 0.9), 8.1, 11.6)],
    width: 1.5,
  },
  // Arrows: a pull with a head flicked on the end.
  "arrow-right": { paths: [lineStroke(seed("arrow-r"), [1.8, 8.2], [13.6, 7.9], { bow: 0.4, jitter: 0.1 }), "M9.4 3.9C11 5.4 12.4 6.7 13.9 7.9C12.4 9.2 11 10.5 9.6 12.1"], width: 1.6 },
  "arrow-up-right": { paths: [lineStroke(seed("arrow-ur"), [3.2, 12.9], [12.4, 3.7], { bow: 0.4, jitter: 0.1 }), "M6.2 3.4C8.4 3.5 10.6 3.4 12.7 3.3C12.8 5.5 12.7 7.7 12.8 9.9"], width: 1.6 },
  // A loop to spin while something loads.
  loading: { paths: [shift(ringStroke(seed("loading"), 12, { turns: 0.8 }), 2, 2)], width: 1.6 },
} satisfies Record<string, Glyph>;

export type GlyphName = keyof typeof glyphs;

export type GlyphProps = {
  /** When it draws itself in: "mount" as it appears, "checked" while its parent carries data-checked, and so on. */
  draw?: DrawMode;
  /** ms each stroke takes. */
  duration?: number;
  className?: string;
  /** Names the icon for screen readers. Without it the icon is decorative. */
  label?: string;
};

/** Renders a glyph on the 16px grid. InkGlyph and InkIcon are this with a name. */
export function GlyphSvg({ glyph, name, draw = "none", duration = 240, className, label }: GlyphProps & { glyph: Glyph; name: string }) {
  // Strokes follow one another; a busy icon keeps the whole drawing short.
  const gap = Math.min(140, 560 / glyph.paths.length);
  return (
    <svg
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
      viewBox="0 0 16 16"
      // 16px unless a class or the surrounding component sizes it.
      width={16}
      height={16}
      data-slot="ink-glyph"
      data-glyph={name}
      className={["ink-glyph shrink-0", className].filter(Boolean).join(" ")}
    >
      {glyph.paths.map((d, i) => (
        <Stroke key={i} d={d} draw={draw} delay={Math.round(i * gap)} duration={duration} width={glyph.width} />
      ))}
    </svg>
  );
}

/**
 * A pen-drawn icon that sits in the flow like any other icon: components
 * size it as they would a lucide one (16px on its own). `draw` makes
 * it draw itself in: "mount" as it appears, "checked" while its parent
 * carries data-checked (a menu's checkbox item indicator, say).
 */
export function InkGlyph({ name, ...props }: GlyphProps & { name: GlyphName }) {
  return <GlyphSvg glyph={glyphs[name]} name={name} {...props} />;
}
