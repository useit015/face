import type { CSSProperties, ReactNode, Ref } from "react";
import {
  arrowStroke,
  boxStroke,
  crossedBoxStroke,
  dotStroke,
  hashSeed,
  hatchStrokes,
  ruleStroke,
  flickPulls,
  inkPulls,
  signaturePulls,
  speckPulls,
  type InkStroke,
  underlineInk,
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
  crossed = false,
  className = "",
  pad = 4,
}: {
  w: number;
  h: number;
  seed: string | number;
  mode?: DrawMode;
  delay?: number;
  passes?: 1 | 2;
  /** Sides pulled separately, running well past the corners (picture frames). */
  crossed?: boolean;
  className?: string;
  pad?: number;
}) {
  const s = hashSeed(seed);
  if (crossed) {
    return (
      <SketchSvg box={[-pad, -pad, w + pad * 2, h + pad * 2]} className={className} style={{ left: -pad, top: -pad, width: w + pad * 2, height: h + pad * 2 }}>
        <Stroke d={crossedBoxStroke(s, w, h, { overshoot: 7, jitter: 1.4 })} mode={mode} delay={delay} duration={560} width={1.5} />
        <Stroke d={crossedBoxStroke(s + 1, w, h, { overshoot: 11, jitter: 2, shift: [2, -1.5] })} mode={mode} delay={delay + 380} duration={460} opacity={0.75} width={1.1} />
      </SketchSvg>
    );
  }
  return (
    <SketchSvg
      box={[-pad, -pad, w + pad * 2, h + pad * 2]}
      className={className}
      style={{ left: -pad, top: -pad, width: w + pad * 2, height: h + pad * 2 }}
    >
      <Stroke d={boxStroke(s, w, h)} mode={mode} delay={delay} duration={520} />
      {passes === 2 && (
        // The second pass is quicker and looser, so the two outlines part at
        // the corners the way a re-traced pen box does.
        <Stroke
          d={boxStroke(s + 1, w, h, { overshoot: 2.6, jitter: 1.5, bow: 1.4 })}
          mode={mode}
          delay={delay + 380}
          duration={420}
          opacity={0.72}
          width={1}
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
 * Heading underline in ballpoint ink: pressured ribbons (see underlineInk),
 * drawn on by a mask that follows each stroke's centreline. Stretches to its
 * positioned parent's width; `w` should be close to that width so the ink
 * keeps its proportions.
 */
export function Underline({
  w = 120,
  seed,
  delay = 0,
  weight,
  className = "",
}: {
  w?: number;
  seed: string | number;
  delay?: number;
  weight?: number;
  className?: string;
}) {
  const s = hashSeed(seed);
  return (
    <SketchSvg box={[-20, -3, w + 42, 20]} stretch className={className} style={{ left: -20, width: "calc(100% + 42px)", height: 20 }}>
      <InkMarks id={`u${s.toString(36)}`} strokes={underlineInk(s, w, { weight })} delay={delay} guide={10} />
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
      {/* A heavy line on a tight spiral, so the dot reads as solid ink. */}
      <Stroke d={dotStroke(hashSeed(seed), r)} delay={delay} duration={260} width={r * 0.75} />
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
  return (
    <SketchSvg box={[0, 0, 28, 28]} className={className} style={{ width: 28, height: 28 }}>
      <InkMarks id={`f${s.toString(36)}`} strokes={inkPulls(s, flickPulls(s), { weight: 2.1, dur: 120, gap: 40 })} delay={delay} />
    </SketchSvg>
  );
}

/**
 * Ink strokes drawn on in order: each pass's filled ribbon is revealed by a
 * mask stroke running along its centreline, one mask per pass so crossing
 * strokes never reveal each other early.
 */
export function InkMarks({ id, strokes, delay = 0, guide = 8 }: { id: string; strokes: InkStroke[]; delay?: number; guide?: number }) {
  return (
    <>
      <defs>
        {strokes.map((k, i) => (
          <mask key={i} id={`${id}-${i}`} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000}>
            <Stroke d={k.guide} delay={delay + k.at} duration={k.dur} width={guide} className="ink-guide" />
          </mask>
        ))}
      </defs>
      {strokes.map((k, i) => (
        <path key={i} d={k.ink} className="ink-ribbon" opacity={k.opacity} mask={`url(#${id}-${i})`} />
      ))}
    </>
  );
}

/**
 * The footer's signature line: a long rule pulled twice, running out into a
 * worried knot at the right end.
 */
export function SignatureRule({ seed, delay = 0, className = "" }: { seed: string | number; delay?: number; className?: string }) {
  const s = hashSeed(seed);
  const w = 760;
  const { rule, knot } = signaturePulls(s, w);
  const ruleInk = inkPulls(s, rule, { weight: 1.25, opacity: 0.85, dur: 520, gap: -260, bow: 0.4 });
  const knotInk = inkPulls(s + 1, knot, { weight: 1, opacity: 0.8, dur: 260, gap: -60, retrace: 0.5, wander: 2.5 }).map((k) => ({ ...k, at: k.at + 700 }));
  return (
    // Always drawn at 1:1, anchored right so the knot keeps its size; a
    // narrow footer just shows less of the rule, faded in where it's cut.
    // The box is tall enough for the knot (the edge fade clips to it) and
    // gives most of that height back with negative margins.
    <span aria-hidden="true" className={`signature-rule relative -my-8 block h-20 self-center overflow-hidden ${className}`}>
      <SketchSvg box={[0, -36, w, 54]} className="right-0 origin-[100%_76%] max-sm:scale-[0.72]" style={{ width: w, height: 54, top: -1 }}>
        <g className="text-ink-2">
          <InkMarks id={`sig${s.toString(36)}`} strokes={ruleInk} delay={delay} />
        </g>
        <g className="text-ink-2">
          <InkMarks id={`knot${s.toString(36)}`} strokes={knotInk} delay={delay} guide={6} />
        </g>
      </SketchSvg>
    </span>
  );
}

/** A few tiny scratches beside something, where the pen touched down. */
export function Specks({ seed, delay = 0, className = "" }: { seed: string | number; delay?: number; className?: string }) {
  const s = hashSeed(seed);
  return (
    <SketchSvg box={[0, 0, 30, 9]} className={`text-ink-3 ${className}`} style={{ width: 30, height: 9 }}>
      <InkMarks id={`sp${s.toString(36)}`} strokes={inkPulls(s, speckPulls(s), { weight: 1.2, dur: 70, gap: 60 })} delay={delay} guide={5} />
    </SketchSvg>
  );
}
