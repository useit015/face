"use client";

import { useId, useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { penStyle, useInkBox, useInkSeed, usePen, type Pen } from "@/hooks/use-ink-box";
import { InkMarks, InkSvg } from "@/lib/ink";
import { cornerPulls, inkPulls, slashPulls, starPulls, zigzagPulls } from "@/lib/ink-sketch";

export type ScrawlKind = "zigzag" | "corner" | "star" | "slash";

// Each kind's size, and how fast it goes on: ms per pull and between pulls.
const KINDS: Record<ScrawlKind, { size: [number, number]; dur: number; gap: number }> = {
  zigzag: { size: [40, 92], dur: 200, gap: 0 },
  corner: { size: [80, 150], dur: 130, gap: 50 },
  star: { size: [46, 50], dur: 110, gap: 50 },
  slash: { size: [48, 22], dur: 70, gap: 45 },
};

/**
 * The scratches a ballpoint collects in a margin while someone gets it
 * going: a zigzag, a worked-over corner, a hurried star, a patch of
 * slashes. Purely decorative (hidden from screen readers); place it with a
 * class (absolute, in the page margin). Drawn as it scrolls into view.
 */
function Scrawl({
  kind = "zigzag",
  scale = 1,
  rotate = 0,
  delay = 0,
  className,
  style,
  seed,
  draw,
  speed,
}: Pick<Pen, "draw" | "speed"> & {
  kind?: ScrawlKind;
  scale?: number;
  /** Degrees. */
  rotate?: number;
  /** ms after it comes into view before the pen starts. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  seed?: string | number;
}) {
  const pen = usePen({ draw, speed });
  const s = useInkSeed(seed);
  const id = useId().replace(/[^\w-]/g, "");
  const { size, dur, gap } = KINDS[kind];
  const [ref] = useInkBox(size);
  const mode = pen.draw === "none" ? "none" : pen.draw === "mount" ? "mount" : "auto";
  const strokes = useMemo(() => {
    const [w, h] = size;
    const pulls =
      kind === "corner" ? cornerPulls(s, w, h) : kind === "star" ? starPulls(s, w, h) : kind === "slash" ? slashPulls(s, w, h) : zigzagPulls(s, w, h, { passes: 6 + (s % 3) });
    // Scrawls get gone over; slashes less than the rest.
    return inkPulls(s, pulls, { weight: 1.3 / scale, opacity: 0.9, dur, gap, retrace: kind === "slash" ? 0.3 : 0.75 });
  }, [kind, s, size, dur, gap, scale]);

  return (
    <span
      aria-hidden="true"
      data-slot="scrawl"
      data-kind={kind}
      className={cn("pointer-events-none relative inline-block text-ink-2", className)}
      style={{ width: size[0] * scale, height: size[1] * scale, rotate: `${rotate}deg`, ...penStyle(pen), ...style }}
    >
      <InkSvg ref={ref} pending={mode === "auto"} box={[0, 0, size[0], size[1]]} className="inset-0 size-full">
        <InkMarks id={`sc${id}`} strokes={strokes} draw={mode} delay={delay} guide={6 / scale} />
      </InkSvg>
    </span>
  );
}

export { Scrawl };
