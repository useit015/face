"use client";

import { useMemo, type ReactNode } from "react";
import { penStyle, useInkFrame, useInkSeed, type InkSize, type Pen } from "@/hooks/use-ink-box";
import { InkSvg, Stroke } from "@/lib/ink";
import { lineStroke, penBoxStrokes, ringStroke } from "@/lib/ink-sketch";

export type OutlineShape = "box" | "ring" | "line";

/**
 * The drawn outline most controls are built on: a box (or a ring, or the
 * line you write on) around its parent, gone over a few times by the pen
 * settings, measured to the real element. Colour comes from `className`
 * (currentColor), so state styles are plain Tailwind on the parent.
 *
 * - `focusPass`: one more pass in full ink, drawn while focus is inside the
 *   nearest `.ink-within`.
 * - `children`: extra strokes in the same drawing (a tick, a dot, a fill),
 *   given the measured box and the seed.
 */
export function InkOutline({
  pen,
  seed,
  estimate,
  shape = "box",
  passes: defaultPasses = 1,
  pad = 8,
  focusPass = false,
  maxRadius = Infinity,
  className,
  children,
}: {
  pen: Pen;
  seed?: string | number;
  estimate: InkSize;
  shape?: OutlineShape;
  passes?: 1 | 2 | 3;
  pad?: number;
  focusPass?: boolean;
  /**
   * The roundest this outline gets. "full" means a pill for single-line
   * controls; a checkbox drawn as a circle would read as a radio, and a
   * multi-line box as a stadium, so those cap it.
   */
  maxRadius?: number;
  className?: string;
  children?: (box: { w: number; h: number; r: number; s: number }) => ReactNode;
}) {
  const s = useInkSeed(seed);
  const { ref, w, h, frame } = useInkFrame(estimate, { pad });
  const draw = pen.draw ?? "auto";
  const roughness = pen.roughness ?? 1;
  const passes = pen.passes ?? defaultPasses;
  const corners = pen.corners ?? "crossed";
  const r =
    shape === "ring" ? Math.min(w, h) / 2 : Math.min(pen.radius === "full" ? h / 2 : (pen.radius ?? 0), h / 2, maxRadius);

  const strokes = useMemo(() => {
    const make = (seed: number, n: number) => {
      if (shape === "ring") return Array.from({ length: n }, (_, i) => ringStroke(seed + i, Math.min(w, h), { turns: 1.06 + i * 0.05 }));
      if (shape === "line") {
        return Array.from({ length: n }, (_, i) =>
          lineStroke(seed + i, [0, h - 0.5 + i * 1.2], [w, h - 1 + i * 0.8], { bow: 0.8 * roughness, jitter: 0.4 * roughness, overshoot: 3 * roughness }),
        );
      }
      return penBoxStrokes(seed, w, h, { roughness, passes: n, corners, radius: r });
    };
    return { passes: make(s, passes), focus: focusPass ? make(s + 20, 1)[0] : undefined };
  }, [shape, s, w, h, roughness, passes, corners, r, focusPass]);

  return (
    <InkSvg ref={ref} {...frame} pending={draw === "auto"} className={className} style={{ ...frame.style, ...penStyle(pen) }}>
      {strokes.passes.map((d, i) => (
        <Stroke key={i} d={d} draw={draw} delay={i * 260} duration={[420, 360, 320][i]} width={[1.3, 1, 0.9][i]} opacity={[1, 0.75, 0.55][i]} />
      ))}
      {strokes.focus && <Stroke d={strokes.focus} draw="focus" duration={300} width={1.4} />}
      {children?.({ w, h, r, s })}
    </InkSvg>
  );
}
