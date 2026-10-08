"use client";

import { memo, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { penStyle, useInkBox, usePen, type Pen } from "@/hooks/use-ink-box";
import { Stroke } from "@/lib/ink";
import { boxStroke, hashSeed, hatchStrokes, loopStroke } from "@/lib/ink-sketch";

export type HatchGridDay = {
  /** YYYY-MM-DD. */
  date: string;
  count: number;
  /** 0–4. Worked out from count when left out: none, then quarters of the busiest day. */
  level?: 0 | 1 | 2 | 3 | 4;
};

type Level = NonNullable<HatchGridDay["level"]>;
type Cell = HatchGridDay & { level: Level };

const CELL = 11.5;
const PITCH = 14.5;
// Each level is drawn three ways, so the grid never looks stamped.
const VARIANTS = 3;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const utcDay = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

/** "Oct 6th, 2026". */
function longDate(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  const n = d.getUTCDate();
  const th = n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th";
  return `${MONTHS[d.getUTCMonth()]} ${n}${th}, ${d.getUTCFullYear()}`;
}

/**
 * Cell stamps, shaded the way you'd shade squares on graph paper: an empty
 * box, single hatching, denser hatching, cross-hatching, solid ink. And a
 * dotted box for days still to come.
 */
const Defs = memo(function Defs({ id }: { id: string }) {
  const out = [];
  for (let v = 0; v < VARIANTS; v++) {
    const s = hashSeed(`hatch-cell-${v}`);
    const box = boxStroke(s, CELL, CELL, { overshoot: 0.9, jitter: 0.45, bow: 0.5 });
    const light = hatchStrokes(s + 1, CELL, CELL, { gap: 4.4, angle: -45, jitter: 0.35, inset: 0.8 }).join("");
    const dense = hatchStrokes(s + 2, CELL, CELL, { gap: 2.5, angle: -45, jitter: 0.3, inset: 0.6 }).join("");
    const cross = hatchStrokes(s + 3, CELL, CELL, { gap: 2.7, angle: 45, jitter: 0.3, inset: 0.6 }).join("");
    // Inline styles, not classes: page CSS doesn't reach the copies <use>
    // makes in every browser, and where it does, these still win.
    const w = (n: number) => ({ style: { fill: "none", stroke: "currentColor", strokeWidth: n, strokeLinecap: "round", strokeLinejoin: "round" } as CSSProperties });
    out.push(
      <g key={`f${v}`} id={`${id}-f-${v}`}>
        <path d={box} {...w(0.8)} strokeDasharray="1.2 2.2" opacity={0.3} />
      </g>,
      <g key={`0${v}`} id={`${id}-0-${v}`}>
        <path d={box} {...w(0.85)} opacity={0.38} />
      </g>,
      <g key={`1${v}`} id={`${id}-1-${v}`}>
        <path d={box} {...w(0.9)} opacity={0.8} />
        <path d={light} {...w(0.8)} opacity={0.75} />
      </g>,
      <g key={`2${v}`} id={`${id}-2-${v}`}>
        <path d={box} {...w(0.9)} />
        <path d={dense} {...w(0.85)} opacity={0.85} />
      </g>,
      <g key={`3${v}`} id={`${id}-3-${v}`}>
        <path d={box} {...w(0.95)} />
        <path d={dense} {...w(0.9)} />
        <path d={cross} {...w(0.85)} opacity={0.85} />
      </g>,
      <g key={`4${v}`} id={`${id}-4-${v}`}>
        <path d={`${boxStroke(s + 4, CELL, CELL, { overshoot: 0, jitter: 0.5, bow: 0.5 })}Z`} style={{ fill: "currentColor", stroke: "none" }} opacity={0.92} />
        <path d={box} {...w(1)} />
      </g>,
    );
  }
  return <defs>{out}</defs>;
});

/** The columns, memoised: hovering only redraws the loop and the label, never the cells. */
const Columns = memo(function Columns({ id, weeks, today, animate }: { id: string; weeks: (Cell | null)[][]; today?: string; animate: boolean }) {
  return weeks.map((week, wi) => (
    // Each column lands as the pen sweeps across, left to right.
    <g key={wi} className={animate ? "ink-land" : undefined} transform={`translate(${wi * PITCH} 0)`} style={{ "--ink-d": "320ms", "--ink-dd": `${wi * 14}ms` } as CSSProperties}>
      {week.map((day, di) => {
        if (!day) return null;
        const v = hashSeed(day.date) % VARIANTS;
        return <use key={day.date} href={`#${id}-${today && day.date > today ? "f" : day.level}-${v}`} y={di * PITCH} />;
      })}
    </g>
  ));
});

/**
 * A year (or any run of days) as a grid of hand-drawn squares, one column a
 * week, shaded in five levels from an empty box to solid ink. Hovering a
 * day circles it and says what it holds. The columns land left to right as
 * it scrolls into view.
 */
function HatchGrid({
  data,
  today,
  unit = "contribution",
  label,
  summary,
  className,
  draw,
  speed,
}: Pick<Pen, "draw" | "speed"> & {
  data: HatchGridDay[];
  /** YYYY-MM-DD: days after it are drawn dotted, still to come. */
  today?: string;
  /** What's counted, for the hover label: "3 commits on Oct 6th, 2026". Plural adds an s; pass [one, many] otherwise. */
  unit?: string | [string, string];
  /** What hovering a day says, in place of the unit's sentence. A function, so only from a client component. */
  label?: (day: HatchGridDay) => string;
  /** What the grid holds, for screen readers (it's one image to them). */
  summary?: string;
  className?: string;
}) {
  const pen = usePen({ draw, speed });
  const id = `hg${useId().replace(/[^\w-]/g, "")}`;
  const mode = pen.draw ?? "auto";
  const [ref] = useInkBox([800, 120]);
  const [hover, setHover] = useState<{ wi: number; di: number; text: string; x: number; y: number } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  const { weeks, months } = useMemo(() => {
    const days = [...data].sort((a, b) => (a.date < b.date ? -1 : 1));
    const max = Math.max(1, ...days.map((d) => d.count));
    const level = (d: HatchGridDay) => d.level ?? ((d.count <= 0 ? 0 : Math.min(4, Math.ceil((d.count / max) * 4))) as Level);
    const weeks: (Cell | null)[][] = [];
    let week: (Cell | null)[] = Array.from({ length: days[0] ? utcDay(days[0].date) : 0 }, () => null);
    for (const day of days) {
      week.push({ ...day, level: level(day) });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length) weeks.push([...week, ...Array.from({ length: 7 - week.length }, () => null)]);
    // A month's name over the week it starts in, if there's room for it.
    const months: { index: number; label: string }[] = [];
    let last = -1;
    weeks.forEach((w, i) => {
      const first = w.find(Boolean);
      if (!first) return;
      const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
      if (month === last) return;
      last = month;
      const prev = months[months.length - 1];
      if (!prev || i - prev.index >= 3) months.push({ index: i, label: MONTHS[month] });
    });
    return { weeks, months };
  }, [data]);

  // Starts scrolled to the latest weeks when the grid is wider than its box:
  // with `today`, today's week sits at the right edge with a couple of the
  // weeks still to come after it, rather than a run of blank ones. Then
  // it's a stop for the keyboard too, so arrow keys can scroll it.
  const latest = today ? weeks.findIndex((w) => w.some((d) => d && d.date >= today)) : -1;
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = latest < 0 ? el.scrollWidth : parseFloat(getComputedStyle(el).paddingLeft) + (latest + 3) * PITCH - el.clientWidth;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [latest]);

  const width = Math.max(1, weeks.length * PITCH - (PITCH - CELL));
  const height = 7 * PITCH - (PITCH - CELL);
  const loop = useMemo(() => loopStroke(hashSeed("hatch-loop"), CELL, CELL, { pad: 3.5, turns: 1.15 }), []);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    const wi = Math.floor((e.clientX - r.left) / PITCH);
    const di = Math.floor((e.clientY - r.top) / PITCH);
    const day = weeks[wi]?.[di];
    if (!day || (today && day.date > today)) return setHover(null);
    const [one, many] = typeof unit === "string" ? [unit, `${unit}s`] : unit;
    const text = label ? label(day) : `${day.count === 0 ? "No" : day.count} ${day.count === 1 ? one : many} on ${longDate(day.date)}`;
    // The label floats over the page (a portal), clear of the grid's scroll box.
    const x = Math.min(Math.max(r.left + wi * PITCH + CELL / 2, 110), window.innerWidth - 110);
    const y = Math.max(8, r.top + di * PITCH - 8);
    setHover((prev) => (prev?.wi === wi && prev.di === di ? prev : { wi, di, text, x, y }));
  }

  return (
    <div
      ref={scroller}
      data-slot="hatch-grid"
      tabIndex={overflows ? 0 : undefined}
      role={overflows ? "region" : undefined}
      aria-label={overflows ? (summary ?? "Days") : undefined}
      onScroll={() => setHover(null)}
      className={cn(
        "max-w-full overflow-x-auto overflow-y-hidden px-1 pt-1 pb-2 outline-none [scrollbar-color:var(--ink-4)_transparent] [scrollbar-width:thin]",
        "focus-visible:outline-solid focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      style={penStyle(pen)}
    >
      <div className="w-max">
        <div aria-hidden="true" className="relative mb-2 h-4 text-xs leading-none text-ink-3">
          {months.map(({ index, label }) => (
            <span key={index} className="absolute top-0" style={{ left: index * PITCH }}>
              {label}
            </span>
          ))}
        </div>
        <div className="relative" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          <svg
            ref={ref}
            role="img"
            aria-label={summary}
            aria-hidden={summary ? undefined : true}
            data-ink-pending={mode === "auto" ? "" : undefined}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="ink-sketch block text-ink"
          >
            <Defs id={id} />
            <Columns id={id} weeks={weeks} today={today} animate={mode !== "none"} />
          </svg>
          {hover && (
            <>
              <svg aria-hidden="true" viewBox={`-6 -6 ${CELL + 12} ${CELL + 12}`} className="ink-sketch pointer-events-none absolute text-ink" style={{ left: hover.wi * PITCH - 6, top: hover.di * PITCH - 6, width: CELL + 12, height: CELL + 12 }}>
                <Stroke d={loop} draw="mount" duration={260} width={1.3} />
              </svg>
              {createPortal(
                <div
                  aria-hidden="true"
                  data-slot="hatch-grid-label"
                  className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full bg-primary px-2.5 py-0.5 text-sm whitespace-nowrap text-primary-foreground [border-radius:var(--hand-radius)]"
                  style={{ left: hover.x, top: hover.y }}
                >
                  {hover.text}
                </div>,
                document.body,
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { HatchGrid };
