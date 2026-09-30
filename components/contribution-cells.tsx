"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { boxStroke, hashSeed, hatchStrokes, loopStroke } from "@/lib/sketch";
import { CELL, PITCH, type ContributionDay } from "@/lib/contributions";

const VARIANTS = 3;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDay(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${MONTHS[d.getUTCMonth()]} ${day}${suffix}, ${d.getUTCFullYear()}`;
}

function tooltipText(day: ContributionDay) {
  const date = formatDay(day.date);
  if (day.count === 0) return `No contributions on ${date}`;
  return `${day.count} ${day.count === 1 ? "contribution" : "contributions"} on ${date}`;
}

/**
 * Cell stamps, shaded the way you'd shade squares on graph paper: an empty
 * box, then single hatching, denser hatching, cross-hatching, and solid ink.
 * Three hand-drawn variants per level keep the grid from looking stamped.
 */
function CellDefs() {
  const defs = [];
  for (let v = 0; v < VARIANTS; v++) {
    const s = hashSeed(`cell-${v}`);
    const box = boxStroke(s, CELL, CELL, { overshoot: 0.9, jitter: 0.45, bow: 0.5 });
    const light = hatchStrokes(s + 1, CELL, CELL, { gap: 4.4, angle: -45, jitter: 0.35, inset: 0.8 }).join("");
    const dense = hatchStrokes(s + 2, CELL, CELL, { gap: 2.5, angle: -45, jitter: 0.3, inset: 0.6 }).join("");
    const cross = hatchStrokes(s + 3, CELL, CELL, { gap: 2.7, angle: 45, jitter: 0.3, inset: 0.6 }).join("");
    const stroke = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;
    defs.push(
      <g key={`f${v}`} id={`cf-${v}`}>
        <path d={box} {...stroke} strokeWidth={0.8} strokeDasharray="1.2 2.2" opacity={0.3} />
      </g>,
      <g key={`0${v}`} id={`c0-${v}`}>
        <path d={box} {...stroke} strokeWidth={0.85} opacity={0.38} />
      </g>,
      <g key={`1${v}`} id={`c1-${v}`}>
        <path d={box} {...stroke} strokeWidth={0.9} opacity={0.8} />
        <path d={light} {...stroke} strokeWidth={0.8} opacity={0.75} />
      </g>,
      <g key={`2${v}`} id={`c2-${v}`}>
        <path d={box} {...stroke} strokeWidth={0.9} />
        <path d={dense} {...stroke} strokeWidth={0.85} opacity={0.85} />
      </g>,
      <g key={`3${v}`} id={`c3-${v}`}>
        <path d={box} {...stroke} strokeWidth={0.95} />
        <path d={dense} {...stroke} strokeWidth={0.9} />
        <path d={cross} {...stroke} strokeWidth={0.85} opacity={0.85} />
      </g>,
      <g key={`4${v}`} id={`c4-${v}`}>
        <path d={`${boxStroke(s + 4, CELL, CELL, { overshoot: 0, jitter: 0.5, bow: 0.5 })}Z`} fill="currentColor" opacity={0.92} />
        <path d={box} {...stroke} strokeWidth={1} />
      </g>,
    );
  }
  return <defs>{defs}</defs>;
}

type Hover = { wi: number; di: number; x: number; y: number; text: string };

type GridProps = {
  weeks: (ContributionDay | null)[][];
  today: string;
};

// Memoized: hovering only re-renders the loop overlay and tooltip, never the ~370 cells.
const Cells = memo(function Cells({ weeks, today }: GridProps) {
  return (
    <>
      {weeks.map((week, wi) => (
        <g
          key={wi}
          className="contrib-col"
          transform={`translate(${wi * PITCH} 0)`}
          style={{ "--c": wi } as React.CSSProperties}
        >
          {week.map((day, di) => {
            if (!day) return null;
            const v = hashSeed(day.date) % VARIANTS;
            const id = day.date > today ? `cf-${v}` : `c${day.level}-${v}`;
            return <use key={day.date} href={`#${id}`} y={di * PITCH} />;
          })}
        </g>
      ))}
    </>
  );
});

export function ContributionCells({ weeks, today }: GridProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const width = weeks.length * PITCH - (PITCH - CELL);
  const height = 7 * PITCH - (PITCH - CELL);

  const onMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.pointerType === "touch") return;
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const wi = Math.floor((e.clientX - r.left) / PITCH);
      const di = Math.floor((e.clientY - r.top) / PITCH);
      const day = weeks[wi]?.[di];
      if (!day || day.date > today) {
        setHover(null);
        return;
      }
      setHover((prev) => {
        if (prev && prev.wi === wi && prev.di === di) return prev;
        const cx = r.left + wi * PITCH + CELL / 2;
        return {
          wi,
          di,
          x: Math.min(Math.max(cx, 110), window.innerWidth - 110),
          y: Math.max(8, r.top + di * PITCH - 6),
          text: tooltipText(day),
        };
      });
    },
    [weeks, today],
  );

  const loop = useMemo(() => loopStroke(hashSeed("contrib-loop"), CELL, CELL, { pad: 3.5, turns: 1.15 }), []);

  return (
    <>
      <svg
        ref={svgRef}
        aria-hidden="true"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block overflow-visible text-ink"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <CellDefs />
        <Cells weeks={weeks} today={today} />
        {hover && (
          <g key={`${hover.wi}-${hover.di}`} transform={`translate(${hover.wi * PITCH} ${hover.di * PITCH})`} className="sketch">
            <path d={loop} pathLength={1} className="cell-loop" strokeWidth={1.3} />
          </g>
        )}
      </svg>
      {hover &&
        createPortal(
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full"
            style={{ left: hover.x, top: hover.y }}
          >
            <div key={hover.text} className="ink-tip px-2.5 py-1 text-meta font-normal whitespace-nowrap">
              {hover.text}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
