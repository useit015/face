"use client";

import { useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { penStyle, useInkFrame, useInkSeed, usePen, type Pen } from "@/hooks/use-ink-box";
import { InkSvg, Stroke, type DrawMode } from "@/lib/ink";
import { createRng, lineStroke, loopStroke, penBoxStrokes, shadeFill } from "@/lib/ink-sketch";

type P = readonly [number, number];

export type AnnotateType = "underline" | "circle" | "box" | "strike" | "scribble" | "bracket" | "highlight";

type Mark = { d: string; width: number; opacity: number; duration: number; at: number; x?: number; y?: number };

/** Pulls joined without lifting the pen: each leg a bowed stroke, sharp at the corners. */
function pulls(seed: number, pts: P[], bow: number) {
  let d = "";
  for (let i = 1; i < pts.length; i++) {
    const leg = lineStroke(seed + i, pts[i - 1], pts[i], { bow, jitter: 0 });
    d += i === 1 ? leg : leg.replace(/^M[^C]*/, "");
  }
  return d;
}

/** Each pass of the pen for one kind of mark, around a w×h run of text. */
function marks(type: AnnotateType, s: number, w: number, h: number, q: number, passes: number, brackets: "both" | "left" | "right"): Mark[] {
  const r = createRng(s);
  const n = (k: number) => (r() - 0.5) * 2 * k * q;
  const range = Array.from({ length: passes }, (_, i) => i);
  switch (type) {
    case "underline":
      // Under the words, rising a touch; a second pass shorter and lighter.
      return range.map((i) => ({
        d: lineStroke(s + i, [-3 + i * 3 + n(1.5), h - 2 + i * 2.2 + n(0.6)], [w + 3 - i * 6 + n(2), h - 3 + i * 1.6 + n(0.8)], { bow: q, jitter: 0.4 * q, overshoot: 2 * q }),
        width: i ? 1.1 : 1.6,
        opacity: i ? 0.7 : 1,
        duration: i ? 300 : 460,
        at: i * 380,
      }));
    case "strike":
      return range.map((i) => ({
        d: lineStroke(s + i, [-4 + n(1.5), h * (0.58 + i * 0.08) + n(0.8)], [w + 4 + n(2), h * (0.5 + i * 0.06) + n(0.8)], { bow: 0.6 * q, jitter: 0.3 * q, overshoot: 1.5 * q }),
        width: i ? 1.2 : 1.6,
        opacity: i ? 0.8 : 1,
        duration: 300,
        at: i * 260,
      }));
    case "scribble":
      // Crossed out in a hurry: a tight zigzag through the words, and back.
      return range.map((i) => {
        const step = Math.max(3, h * 0.17);
        const pts: P[] = [];
        let x = i ? w + 3 : -3;
        let up = i % 2 === 0;
        while (i ? x > -3 : x < w + 3) {
          // Each pull leans forward, and the hand never quite reaches the same height twice.
          pts.push([x + (up ? h * 0.18 : 0) + n(0.6), h * (up ? 0.2 + r() * 0.12 : 0.74 + r() * 0.12)]);
          x += (i ? -1 : 1) * step * (0.75 + r() * 0.5);
          up = !up;
        }
        return { d: pulls(s + i * 50, pts, 0.3 * q), width: i ? 1.2 : 1.45, opacity: i ? 0.8 : 0.95, duration: Math.min(1100, 260 + w * 2.4), at: i * Math.min(900, 220 + w * 2) };
      });
    case "box": {
      const [px, py] = [5, 2];
      return penBoxStrokes(s, w + px * 2, h + py * 2, { roughness: q, passes, corners: "crossed" }).map((d, i) => ({
        d,
        width: [1.4, 1.05, 0.9][i],
        opacity: [1, 0.75, 0.6][i],
        duration: [460, 380, 340][i],
        at: i * 300,
        x: -px,
        y: -py,
      }));
    }
    case "circle": {
      // A loose loop: wider than the words by more than it's taller, so it
      // reads as a ring round them rather than a box with round corners.
      const px = Math.max(9, w * 0.07);
      const py = Math.max(5, h * 0.26);
      return range.map((i) => {
        const extra = i * 2.5;
        return {
          d: loopStroke(s + i, w + 2 * (px - py), h, { pad: py + extra, turns: i ? 1.04 : 1.14 }),
          width: i ? 1.1 : 1.5,
          opacity: i ? 0.7 : 1,
          duration: i ? 480 : 640,
          at: i * 520,
          x: -(px - py),
        };
      });
    }
    case "bracket": {
      // [ and ] drawn in one motion each: in, down, and back out.
      const reach = Math.min(6, Math.max(3.5, h * 0.18));
      const side = (x: number, out: number, k: number): Mark => ({
        d: pulls(
          s + k * 10,
          [
            [x + out * 0.2 + n(0.8), -3 + n(0.8)],
            [x - out + n(0.6), -2.4 + n(0.6)],
            [x - out + n(0.8), h + 2.4 + n(0.6)],
            [x + out * 0.2 + n(0.8), h + 3 + n(0.8)],
          ],
          0.5 * q,
        ),
        width: 1.5,
        opacity: 1,
        duration: 420,
        at: k * 320,
      });
      const out: Mark[] = [];
      if (brackets !== "right") out.push(side(-4, reach, out.length));
      if (brackets !== "left") out.push(side(w + 4, -reach, out.length));
      return out;
    }
    case "highlight":
      // Shaded in behind the words with the side of the pen.
      return range.map((i) => ({
        d: shadeFill(s + i, w + 6, h * 0.62, { gap: 2.1 + i * 0.6, angle: -6, overrun: 2 }),
        width: 1.7,
        opacity: i ? 0.2 : 0.32,
        duration: Math.min(1400, 420 + w * 3),
        at: i * 400,
        x: -3,
        y: h * 0.14,
      }));
  }
}

const defaultPasses: Record<AnnotateType, 1 | 2> = { underline: 2, circle: 1, box: 2, strike: 1, scribble: 2, bracket: 1, highlight: 1 };

/**
 * Marks a word or a phrase the way you would with a pen: underlined,
 * circled, boxed, struck through, scribbled out, bracketed or shaded in.
 * Drawn the first time it scrolls into view; give a run of them rising
 * `delay`s to have them drawn one after another. With `active`, it draws
 * in when true and pulls back out when false. Keep it to a word or a short
 * phrase: the mark is drawn round the element's box.
 */
function Annotate({
  type = "underline",
  color = "ink",
  as: Tag = "span",
  delay = 0,
  active,
  brackets = "both",
  seed,
  className,
  children,
  draw,
  roughness,
  passes,
  weight,
  speed,
}: Pick<Pen, "draw" | "roughness" | "passes" | "weight" | "speed"> & {
  type?: AnnotateType;
  /** The pen: the ink, or the red pen corrections are made in. */
  color?: "ink" | "red";
  /** The element to render: mark for highlights, del or s for struck-out text, em or strong for emphasis. */
  as?: "span" | "mark" | "del" | "s" | "ins" | "em" | "strong";
  /** ms after it comes into view before the pen starts. */
  delay?: number;
  /** Draws while true, pulls back out when false (instead of drawing once). */
  active?: boolean;
  /** Which brackets a bracket draws. */
  brackets?: "both" | "left" | "right";
  seed?: string | number;
  className?: string;
  children: ReactNode;
}) {
  const pen = usePen({ draw, roughness, passes, weight, speed });
  const s = useInkSeed(seed);
  const text = typeof children === "string" ? children : "";
  const { ref, w, h, frame } = useInkFrame([Math.max(24, text.length * 10), 28], { pad: 16 });
  const mode: DrawMode = active !== undefined ? "checked" : pen.draw === "none" ? "none" : pen.draw === "mount" ? "mount" : "auto";
  const q = pen.roughness ?? 1;
  const n = pen.passes ?? defaultPasses[type];
  const strokes = useMemo(() => marks(type, s, w, h, q, n, brackets), [type, s, w, h, q, n, brackets]);
  const behind = type === "highlight";

  return (
    <Tag
      data-slot="annotate"
      data-type={type}
      data-checked={active ? "" : undefined}
      // Sized to the words, not the line they sit in, so the marks hug the text.
      className={cn("relative inline-block bg-transparent leading-[1.2] text-inherit no-underline", behind && "isolate", className)}
    >
      <InkSvg
        ref={ref}
        {...frame}
        pending={mode === "auto"}
        className={cn(color === "red" ? "text-pen-red" : "text-ink", behind && "-z-10")}
        style={{ ...frame.style, ...penStyle(pen) }}
      >
        {strokes.map((m, i) => (
          <g key={i} transform={m.x || m.y ? `translate(${m.x ?? 0} ${m.y ?? 0})` : undefined}>
            <Stroke d={m.d} draw={mode} delay={delay + m.at} duration={m.duration} width={m.width} opacity={m.opacity} />
          </g>
        ))}
      </InkSvg>
      {children}
    </Tag>
  );
}

export { Annotate };
