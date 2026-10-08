"use client";

import { Children, createContext, useContext, useLayoutEffect, useMemo, useRef, useState, type ComponentProps, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { penStyle, useInkBox, useInkSeed, usePen, type Pen } from "@/hooks/use-ink-box";
import { InkSvg, Stroke } from "@/lib/ink";
import { arrowStroke, dotStroke, hashSeed, lineStroke } from "@/lib/ink-sketch";

// The arrow is drawn over ARROW ms on the pen curve (--ease-pen,
// cubic-bezier(0.45, 0.05, 0.25, 1)). A stop lands when the pen passes its
// dot, so invert the curve to find when the line reaches it.
const ARROW = 1100;
const DELAY = 120;
const LENGTH = 700;

function reaches(fraction: number) {
  const bez = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let [lo, hi] = [0, 1];
  for (let k = 0; k < 24; k++) {
    const mid = (lo + hi) / 2;
    if (bez(mid, 0.05, 1) < fraction) lo = mid;
    else hi = mid;
  }
  return bez(lo, 0.45, 0.25);
}

type Stop = { index: number; orientation: "horizontal" | "vertical"; at: number; mode: "auto" | "mount" | "none" };
const StopContext = createContext<Stop>({ index: 0, orientation: "horizontal", at: 0, mode: "none" });

/**
 * Stops along a hand-drawn arrow. As it scrolls into view the pen draws the
 * arrow and each stop lands as the pen passes its dot. Horizontal runs the
 * arrow across the top (and scrolls sideways when there are more stops than
 * room); vertical draws a line down the side.
 */
function Timeline({
  orientation = "horizontal",
  className,
  children,
  seed,
  draw,
  weight,
  speed,
  ...props
}: ComponentProps<"ol"> & Pick<Pen, "draw" | "weight" | "speed"> & { orientation?: "horizontal" | "vertical"; seed?: string | number }) {
  const pen = usePen({ draw, weight, speed });
  const s = useInkSeed(seed);
  const [ref] = useInkBox([LENGTH, 400]);
  const mode = pen.draw === "none" ? "none" : pen.draw === "mount" ? "mount" : "auto";
  const items = Children.toArray(children);
  const count = Math.max(1, items.length);
  const vertical = orientation === "vertical";
  const line = useMemo(
    () => (vertical ? { shaft: lineStroke(s, [1.5, 0], [1.5, LENGTH], { bow: 0.3, jitter: 0.6 }), head: "" } : arrowStroke(s, LENGTH - 2, 6)),
    [s, vertical],
  );
  // Horizontal, more stops than room: it scrolls sideways, and becomes a
  // stop for the keyboard so arrow keys can scroll it.
  const scroller = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || vertical) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [vertical]);
  // A vertical line takes about as long as the stops take to read down.
  const duration = vertical ? Math.min(2000, 300 + count * 260) : ARROW;

  return (
    <div
      ref={scroller}
      data-slot="timeline"
      data-orientation={orientation}
      tabIndex={overflows ? 0 : undefined}
      role={overflows ? "region" : undefined}
      aria-label={overflows ? "Timeline" : undefined}
      className={cn(
        !vertical && "max-w-full overflow-x-auto [scrollbar-color:var(--ink-4)_transparent] [scrollbar-width:thin]",
        "outline-none focus-visible:outline-solid focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      style={penStyle(pen)}
    >
      <div data-ink-stage="" className={cn("relative", vertical ? "pl-9" : "min-w-full pt-7")} style={vertical ? undefined : { width: `max(100%, ${count * 10}rem)` }}>
        {vertical ? (
          <InkSvg ref={ref} pending={mode === "auto"} box={[0, 0, 3, LENGTH]} stretch className="top-3 left-[9px] h-[calc(100%-1.5rem)] w-[3px] text-ink-4">
            <Stroke d={line.shaft} draw={mode} delay={DELAY} duration={duration} width={1.2} />
          </InkSvg>
        ) : (
          <InkSvg ref={ref} pending={mode === "auto"} box={[0, 0, LENGTH, 12]} stretch className="inset-x-0 top-[22px] h-3 w-full text-ink">
            <Stroke d={line.shaft} draw={mode} delay={DELAY} duration={duration} width={1.4} />
            <Stroke d={line.head} draw={mode} delay={DELAY + duration * 0.95} duration={200} width={1.4} />
          </InkSvg>
        )}
        <ol
          data-slot="timeline-list"
          className={cn(vertical ? "flex flex-col gap-8" : "grid gap-x-4")}
          style={vertical ? undefined : { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
          {...props}
        >
          {items.map((child, index) => {
            const at = mode === "none" ? 0 : Math.round(DELAY + duration * Math.max(0.04, reaches(index / count)));
            return (
              <StopContext key={index} value={{ index, orientation, at, mode }}>
                {child}
              </StopContext>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/** One stop: its dot on the line, and whatever's said about it. */
function TimelineItem({ className, children, style, ...props }: ComponentProps<"li">) {
  const { index, orientation, at, mode } = useContext(StopContext);
  const s = hashSeed(`timeline-dot-${index}`);
  const vertical = orientation === "vertical";
  return (
    <li data-slot="timeline-item" className={cn("relative flex min-w-0 flex-col gap-1", vertical ? "" : "pt-6", className)} style={style} {...props}>
      <svg aria-hidden="true" viewBox="-7 -7 14 14" className={cn("ink-sketch absolute size-[14px] text-ink", vertical ? "top-1.5 -left-[33.5px]" : "-top-[7px] -left-px")}>
        <Stroke d={dotStroke(s, 4.5)} draw={mode} delay={at} duration={260} width={3.4} />
      </svg>
      <div className={cn("flex min-w-0 flex-col gap-1", mode !== "none" && "ink-land")} style={{ "--ink-d": "420ms", "--ink-dd": `${at + 60}ms` } as CSSProperties}>
        {children}
      </div>
    </li>
  );
}

function TimelineTitle({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="timeline-title" className={cn("text-lg leading-tight font-bold", className)} {...props} />;
}

/** When: a <time>; pass dateTime for a machine-readable date. */
function TimelineTime({ className, ...props }: ComponentProps<"time">) {
  return <time data-slot="timeline-time" className={cn("text-sm text-ink-3", className)} {...props} />;
}

function TimelineDescription({ className, ...props }: ComponentProps<"p">) {
  return <p data-slot="timeline-description" className={cn("text-base text-ink-2", className)} {...props} />;
}

export { Timeline, TimelineDescription, TimelineItem, TimelineTime, TimelineTitle };
