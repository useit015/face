import type { CSSProperties } from "react";
import { Reveal } from "@/components/reveal";
import { InkMarks, SketchSvg } from "@/components/ink/sketch";
import { cornerPulls, hashSeed, inkPulls, slashPulls, starPulls, zigzagPulls } from "@/lib/sketch";

type Kind = "zigzag" | "corner" | "star" | "slash";

const SIZE: Record<Kind, [number, number]> = {
  zigzag: [40, 92],
  corner: [80, 150],
  star: [46, 50],
  slash: [48, 22],
};

// Per kind: base draw time per pull and gap between pulls (ms).
const PACE: Record<Kind, [number, number]> = {
  zigzag: [200, 0],
  corner: [130, 50],
  star: [110, 50],
  slash: [70, 45],
};

function pulls(kind: Kind, seed: number, [w, h]: [number, number]) {
  switch (kind) {
    case "corner":
      return cornerPulls(seed, w, h);
    case "star":
      return starPulls(seed, w, h);
    case "slash":
      return slashPulls(seed, w, h);
    default:
      return zigzagPulls(seed, w, h, { passes: 6 + (seed % 3) });
  }
}

/**
 * Pen-test marks in the page margin: the scratches a ballpoint collects
 * while someone gets it going. Pinned near the viewport edge beside the
 * section they sit in, never so far out they lose the page. Decorative only;
 * they draw themselves in with their section.
 */
export function MarginScrawl({
  seed,
  kind,
  side,
  top,
  inset = 18,
  rotate = 0,
  delay = 300,
  scale = 1,
}: {
  seed: string;
  kind: Kind;
  side: "left" | "right";
  top: number | string;
  inset?: number;
  rotate?: number;
  delay?: number;
  scale?: number;
}) {
  const s = hashSeed(seed);
  const size = SIZE[kind];
  const [dur, gap] = PACE[kind];
  const strokes = inkPulls(s, pulls(kind, s, size), { weight: 1.3 / scale, opacity: 0.9, dur, gap, retrace: kind === "slash" ? 0.3 : 0.75 });
  const style = {
    top,
    [side]: `max(calc(50% - 50vw + ${inset}px), -9rem)`,
    width: size[0] * scale,
    height: size[1] * scale,
    rotate: `${rotate}deg`,
  } as CSSProperties;
  return (
    <Reveal variant="plain" aria-hidden="true" className="margin-scrawl pointer-events-none absolute text-ink-2" style={style}>
      <SketchSvg box={[0, 0, size[0], size[1]]} className="inset-0 size-full">
        <InkMarks id={`m${s.toString(36)}`} strokes={strokes} delay={delay} guide={6 / scale} />
      </SketchSvg>
    </Reveal>
  );
}
