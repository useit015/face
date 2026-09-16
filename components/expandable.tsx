"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronsUpDown } from "lucide-react";

const heightEase = [0.16, 1, 0.3, 1] as const;

type PaneState = "flow" | "overlay" | "hidden";

// The two panes swap roles around the height animation:
// - flow: in flow — defines the container's resting height
// - overlay: painted in place at natural height so entering and leaving
//   content crossfade while the height animates (clipped by the container's
//   overflow-hidden) — no content pop mid-swap
// - hidden: fully out of the way once the animation has settled
const PANE_CLASS: Record<PaneState, string> = {
  flow: "relative",
  // left-3/right-3 (not inset-x-0) so the overlay spans the container's
  // content box — same position the pane occupies in flow. The container is
  // -mx-3 px-3, so inset-x-0 would sit 12px left and jump on every swap.
  overlay: "absolute left-3 right-3 top-0 overflow-hidden",
  hidden:
    "pointer-events-none invisible absolute left-3 right-3 top-0 h-0 overflow-hidden",
};

const PANE_FADE =
  "transition-opacity duration-[250ms] ease-out motion-reduce:transition-none";

function paneClasses(state: PaneState, painted: boolean) {
  return `${PANE_CLASS[state]} ${painted ? "opacity-100" : "opacity-0"} ${PANE_FADE}`;
}

export function Expandable({
  header,
  children,
  collapsed,
  label = "See more",
}: {
  header: ReactNode;
  children: ReactNode;
  collapsed?: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const longRef = useRef<HTMLDivElement | null>(null);
  const shortRef = useRef<HTMLDivElement | null>(null);
  const [heights, setHeights] = useState<{ long: number; short: number } | null>(
    null,
  );
  const [animating, setAnimating] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const l = longRef.current;
      const s = shortRef.current;
      if (l && s) setHeights({ long: l.offsetHeight, short: s.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (longRef.current) ro.observe(longRef.current);
    if (shortRef.current) ro.observe(shortRef.current);
    return () => ro.disconnect();
  }, []);

  const height = heights ? (open ? heights.long : heights.short) : "auto";
  // Skip animating the very first auto→px sync after measurement.
  const measured = heights !== null;

  // Mid-animation the leaving pane stays in flow while the entering one
  // overlays it; on completion they settle into their resting roles.
  const paneState = (isLong: boolean): PaneState => {
    if (!animating) return open === isLong ? "flow" : "hidden";
    return open === isLong ? "overlay" : "flow";
  };

  return (
    <div className="expander relative" data-open={open}>
      <div className="flex items-center justify-between gap-3">
        {header}
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (heights && heights.long !== heights.short) setAnimating(true);
          }}
          aria-expanded={open}
          className="group/see relative inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 -mr-2 font-mono text-meta font-medium text-foreground-secondary transition-[background-color,color,transform] duration-200 outline-none select-none squircle before:absolute before:-inset-y-2 before:-inset-x-1 before:content-[''] hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
        >
          {open ? "See less" : label}
          <ChevronsUpDown
            className={`size-3 transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      <motion.div
        className={`relative -mx-3 px-3 ${animating ? "overflow-hidden" : ""}`}
        initial={false}
        animate={{ height }}
        transition={{ duration: measured ? 0.5 : 0, ease: heightEase }}
        onAnimationComplete={() => setAnimating(false)}
      >
        <div
          ref={longRef}
          inert={!open}
          className={paneClasses(paneState(true), open)}
        >
          {children}
        </div>
        {collapsed != null && (
          <div
            ref={shortRef}
            inert={open}
            className={paneClasses(paneState(false), !open)}
          >
            {collapsed}
          </div>
        )}
      </motion.div>
    </div>
  );
}
