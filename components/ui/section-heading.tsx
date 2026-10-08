"use client";

import { useId, useMemo, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { penStyle, useInkBox, useInkSeed, usePen, type Pen } from "@/hooks/use-ink-box";
import { InkMarks, InkSvg } from "@/lib/ink";
import { inkPulls, speckPulls, underlineShape, underlineShapeFor, type UnderlineShape } from "@/lib/ink-sketch";

/**
 * A section title in block capitals, written in by hand and underlined the
 * way that title's seed felt like: a swoosh (the pen lands short of the
 * word, pulls right, snaps back under itself and runs on), two pulls, a
 * wave, a zigzag, a pull ending in a loop, or a pull with ticks flicked off
 * its tail. The underline stays inside the title's own box, so it never
 * reaches into whatever sits beside or below. `specks` adds the few
 * scratches a pen leaves when it's lifted. Written the first time it
 * scrolls into view.
 */
// Room reserved after the title for the underline to run on into.
const RUN_PAD = 14;

function SectionHeading({
  as: Tag = "h2",
  id,
  specks = false,
  underline,
  delay = 0,
  seed,
  className,
  children,
  draw,
  weight,
  speed,
}: Pick<Pen, "draw" | "weight" | "speed"> & {
  as?: "h1" | "h2" | "h3" | "h4";
  id?: string;
  specks?: boolean;
  /** Which underline. By default the seed picks one, so each title keeps its own. */
  underline?: UnderlineShape;
  /** ms after it comes into view before the pen starts. */
  delay?: number;
  seed?: string | number;
  className?: string;
  children: ReactNode;
}) {
  const pen = usePen({ draw, weight, speed });
  const s = useInkSeed(seed ?? id);
  const uid = useId().replace(/[^\w-]/g, "");
  const text = typeof children === "string" ? children : "";
  // Block capitals in the hand run about 0.75em a letter.
  const [ref, [w]] = useInkBox([Math.max(60, Math.round(text.length * 15)) + RUN_PAD, 40]);
  // The underline runs under the title and the padding reserved after it.
  const [specksRef] = useInkBox([30, 9]);
  const mode = pen.draw === "none" ? "none" : pen.draw === "mount" ? "mount" : "auto";
  const shape = underline ?? underlineShapeFor(s);
  const strokes = useMemo(
    () =>
      w >= 70
        ? underlineShape(s, w, shape)
        : // Too short for any of them: one rising pull, gone over lighter.
          inkPulls(s, [[[0, 12], [w * 0.5, 7], [w, 3]]], { weight: 2.4, dur: 360, retrace: 1, wander: 1.4 }),
    [s, w, shape],
  );
  const flecks = useMemo(() => (specks ? inkPulls(s + 7, speckPulls(s + 7), { weight: 1.2, dur: 70, gap: 60 }) : []), [s, specks]);
  // Written over about as long as it takes to write the word.
  const writing = Math.min(1100, 380 + text.length * 30);
  const style = penStyle(pen);

  return (
    // The underline sits inside the heading's box (pb and pr), so whatever
    // follows or sits beside starts clear of it rather than under it.
    <div data-slot="section-heading" data-underline={shape} className="relative w-fit max-w-full pr-3.5 pb-[22px]" style={style}>
      <Tag
        id={id}
        className={cn("text-2xl font-bold tracking-[0.07em] uppercase", mode !== "none" && "ink-write", className)}
        style={{ "--ink-d": `${writing}ms`, "--ink-dd": `${delay}ms` } as CSSProperties}
      >
        {children}
      </Tag>
      <InkSvg ref={ref} pending={mode === "auto"} box={[-2, 0, w + 4, 21]} stretch className="bottom-0" style={{ left: -2, width: "calc(100% + 4px)", height: 21 }}>
        <InkMarks id={`u${uid}`} strokes={strokes} draw={mode} delay={delay + writing * 0.6} />
      </InkSvg>
      {specks && (
        <InkSvg ref={specksRef} pending={mode === "auto"} box={[0, 0, 30, 9]} className="-right-12 bottom-0 text-ink-3" style={{ width: 30, height: 9 }}>
          <InkMarks id={`s${uid}`} strokes={flecks} draw={mode} delay={delay + writing * 0.6 + 760} guide={5} />
        </InkSvg>
      )}
    </div>
  );
}

export { SectionHeading };
