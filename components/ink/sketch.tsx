import type { CSSProperties, ReactNode, Ref } from "react";
import {
  arrowStroke,
  boxStroke,
  dotStroke,
  hashSeed,
  hatchStrokes,
  lineStroke,
  ruleStroke,
  underlineStroke,
  verticalStroke,
} from "@/lib/sketch";

// Server-safe sketch primitives. Each renders an absolutely positioned SVG
// overlay whose strokes can draw themselves in:
// - "reveal": when the nearest [data-reveal] ancestor scrolls into view
// - "hover":  when the nearest .ink-hover ancestor is hovered or focused
// - "static": always fully drawn

export type DrawMode = "reveal" | "hover" | "static";

const modeClass: Record<DrawMode, string> = {
  reveal: "draw",
  hover: "hover-draw",
  static: "",
};

export function Stroke({
  d,
  mode = "reveal",
  delay = 0,
  duration = 500,
  width,
  opacity,
  className = "",
}: {
  d: string;
  mode?: DrawMode;
  delay?: number;
  duration?: number;
  width?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <path
      d={d}
      pathLength={1}
      className={`${modeClass[mode]} ${className}`}
      strokeWidth={width}
      opacity={opacity}
      style={{ "--dd": `${delay}ms`, "--d": `${duration}ms` } as CSSProperties}
    />
  );
}

export function SketchSvg({
  box,
  className = "",
  style,
  children,
  stretch = false,
  ref,
}: {
  /** [x, y, w, h] in user units */
  box: [number, number, number, number];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  stretch?: boolean;
  ref?: Ref<SVGSVGElement>;
}) {
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      focusable="false"
      viewBox={box.join(" ")}
      preserveAspectRatio={stretch ? "none" : undefined}
      className={`sketch pointer-events-none absolute overflow-visible ${className}`}
      style={style}
    >
      {children}
    </svg>
  );
}

/** Fixed-size box outline, drawn in two passes like a quick pen box. */
export function SketchBox({
  w,
  h,
  seed,
  mode = "reveal",
  delay = 0,
  passes = 2,
  className = "",
  pad = 4,
}: {
  w: number;
  h: number;
  seed: string | number;
  mode?: DrawMode;
  delay?: number;
  passes?: 1 | 2;
  className?: string;
  pad?: number;
}) {
  const s = hashSeed(seed);
  return (
    <SketchSvg
      box={[-pad, -pad, w + pad * 2, h + pad * 2]}
      className={className}
      style={{ left: -pad, top: -pad, width: w + pad * 2, height: h + pad * 2 }}
    >
      <Stroke d={boxStroke(s, w, h)} mode={mode} delay={delay} duration={520} />
      {passes === 2 && (
        <Stroke
          d={boxStroke(s + 1, w, h, { overshoot: 1.6 })}
          mode={mode}
          delay={delay + 380}
          duration={420}
          opacity={0.5}
          width={0.9}
        />
      )}
    </SketchSvg>
  );
}

/** A hand-drawn icon tile: box + glyph, the way the reference sketches them. */
export function IconTile({
  seed,
  size = 36,
  delay = 0,
  mode = "reveal",
  children,
  className = "",
}: {
  seed: string | number;
  size?: number;
  delay?: number;
  mode?: DrawMode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <SketchBox w={size} h={size} seed={seed} delay={delay} mode={mode} pad={3} />
      {children}
    </span>
  );
}

/**
 * Heading underline swoosh. Stretches horizontally to its positioned parent,
 * so it always spans the heading; `w` only shapes the curve.
 */
export function Underline({
  w = 120,
  seed,
  delay = 0,
  hook = true,
  className = "",
}: {
  w?: number;
  seed: string | number;
  delay?: number;
  hook?: boolean;
  className?: string;
}) {
  return (
    <SketchSvg
      box={[-6, -4, w + 16, 14]}
      stretch
      className={className}
      style={{ left: -6, width: "calc(100% + 16px)", height: 14 }}
    >
      <Stroke d={underlineStroke(hashSeed(seed), w, { hook })} delay={delay} duration={560} />
    </SketchSvg>
  );
}

/** A full-width wandering rule (stretches horizontally only, so strokes stay even). */
export function Rule({ seed, delay = 0, className = "" }: { seed: string | number; delay?: number; className?: string }) {
  const w = 700;
  return (
    <SketchSvg box={[0, -1, w, 5]} stretch className={`left-0 h-[5px] w-full ${className}`}>
      <Stroke d={ruleStroke(hashSeed(seed), w)} delay={delay} duration={700} width={1} opacity={0.55} className="rule-stroke" />
    </SketchSvg>
  );
}

export function VRule({ seed, h = 22, delay = 0, className = "" }: { seed: string | number; h?: number; delay?: number; className?: string }) {
  return (
    <SketchSvg box={[0, -1, 3, h + 2]} className={className} style={{ width: 3, height: h + 2 }}>
      <Stroke d={verticalStroke(hashSeed(seed), h)} delay={delay} duration={260} width={1.2} opacity={0.7} />
    </SketchSvg>
  );
}

/** Timeline shaft with a flicked arrowhead; stretches horizontally. */
export function TimelineArrow({ seed, delay = 0, className = "" }: { seed: string | number; delay?: number; className?: string }) {
  const w = 700;
  const { shaft, head } = arrowStroke(hashSeed(seed), w - 2, 6);
  return (
    <SketchSvg box={[0, 0, w, 12]} stretch className={`w-full ${className}`}>
      <Stroke d={shaft} delay={delay} duration={1000} className="steady" />
      <Stroke d={head} delay={delay + 950} duration={200} />
    </SketchSvg>
  );
}

export function InkDot({ seed, r = 3.2, delay = 0, className = "" }: { seed: string | number; r?: number; delay?: number; className?: string }) {
  const box = r + 2;
  return (
    <SketchSvg box={[-box, -box, box * 2, box * 2]} className={className} style={{ width: box * 2, height: box * 2 }}>
      <Stroke d={dotStroke(hashSeed(seed), r)} delay={delay} duration={260} width={1.5} />
    </SketchSvg>
  );
}

export function Hatch({
  w,
  h,
  seed,
  gap = 5,
  angle = -48,
  delay = 0,
  stagger = 14,
  className = "",
  opacity = 0.5,
}: {
  w: number;
  h: number;
  seed: string | number;
  gap?: number;
  angle?: number;
  delay?: number;
  stagger?: number;
  className?: string;
  opacity?: number;
}) {
  const lines = hatchStrokes(hashSeed(seed), w, h, { gap, angle });
  return (
    <SketchSvg box={[0, 0, w, h]} className={className} style={{ width: w, height: h }}>
      {lines.map((d, i) => (
        <Stroke key={i} d={d} delay={delay + i * stagger} duration={160} width={0.9} opacity={opacity} />
      ))}
    </SketchSvg>
  );
}

/** Short flick marks, like the quick emphasis strokes beside a signature. */
export function Flicks({ seed, delay = 0, className = "" }: { seed: string | number; delay?: number; className?: string }) {
  const s = hashSeed(seed);
  const marks = [
    lineStroke(s, [2, 16], [10, 3], { bow: 0.4, jitter: 0.6 }),
    lineStroke(s + 1, [9, 19], [21, 10], { bow: 0.4, jitter: 0.6 }),
    lineStroke(s + 2, [13, 25], [23, 22], { bow: 0.3, jitter: 0.5 }),
  ];
  return (
    <SketchSvg box={[0, 0, 26, 28]} className={className} style={{ width: 26, height: 28 }}>
      {marks.map((d, i) => (
        <Stroke key={i} d={d} delay={delay + i * 110} duration={150} width={1.4} />
      ))}
    </SketchSvg>
  );
}
