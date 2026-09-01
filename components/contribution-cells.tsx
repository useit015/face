"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

const LEVEL_CLASS = [
  "bg-contrib-0",
  "bg-contrib-1",
  "bg-contrib-2",
  "bg-contrib-3",
  "bg-contrib-4",
] as const;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDay(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? "st"
    : day % 10 === 2 && day !== 12 ? "nd"
    : day % 10 === 3 && day !== 13 ? "rd"
    : "th";
  return `${MONTHS[d.getUTCMonth()]} ${day}${suffix}, ${d.getUTCFullYear()}`;
}

function tooltipText(day: ContributionDay) {
  const date = formatDay(day.date);
  if (day.count === 0) return `No contributions on ${date}`;
  return `${day.count} ${day.count === 1 ? "contribution" : "contributions"} on ${date}`;
}

export function ContributionCells({
  weeks,
}: {
  weeks: (ContributionDay | null)[][];
}) {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  return (
    <>
      <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
        {weeks.flatMap((week, wi) =>
          week.map((day, di) => {
            if (!day) {
              return <div key={`${wi}-${di}`} className="size-[10px]" />;
            }
            const show = (e: { currentTarget: HTMLElement }) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = Math.min(
                Math.max(r.left + r.width / 2, 90),
                window.innerWidth - 90,
              );
              setTip({ x, y: r.top, text: tooltipText(day) });
            };
            return (
              <div
                key={day.date}
                role="img"
                aria-label={tooltipText(day)}
                tabIndex={0}
                onMouseEnter={show}
                onFocus={show}
                onMouseLeave={() => setTip(null)}
                onBlur={() => setTip(null)}
                className={`size-[10px] rounded-[2px] squircle ${LEVEL_CLASS[day.level]} transition-[box-shadow] duration-100 hover:ring-1 hover:ring-foreground/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`}
              />
            );
          }),
        )}
      </div>
      {tip && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+6px)] rounded-md bg-foreground px-2 py-1 text-[11px] whitespace-nowrap text-background shadow-lg"
          style={{ left: tip.x, top: tip.y } as CSSProperties}
        >
          {tip.text}
        </div>
      )}
    </>
  );
}
