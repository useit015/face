"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { SeeMore } from "@/components/ink/see-more";
import { SectionHeader } from "@/components/ink/heading";

const heightEase = [0.16, 1, 0.3, 1] as const;

type PaneState = "flow" | "overlay" | "hidden";

// The two panes swap roles around the height animation:
// - flow: in flow — defines the container's resting height
// - overlay: painted in place at natural height so entering and leaving
//   content crossfade while the height animates (clipped by the container)
// - hidden: fully out of the way once the animation has settled
const PANE_CLASS: Record<PaneState, string> = {
  flow: "relative",
  // left-3/right-3 (not inset-x-0): the container is -mx-3 px-3, so this
  // keeps the overlay exactly where the pane sits in flow.
  overlay: "absolute left-3 right-3 top-0",
  hidden: "pointer-events-none invisible absolute left-3 right-3 top-0 h-0 overflow-hidden",
};

const PANE_FADE =
  "transition-opacity duration-[260ms] ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none";

function paneClasses(state: PaneState, painted: boolean) {
  return `${PANE_CLASS[state]} ${painted ? "opacity-100" : "opacity-0"} ${PANE_FADE}`;
}

/**
 * A section whose body swaps between a compact and a full version. Height is
 * measured and animated; the panes crossfade; `.open-in` and `.close-in`
 * children replay their entrances on every toggle.
 */
export function Expandable({
  headingId,
  title,
  children,
  collapsed,
  label = "See more",
  duration = 0.55,
  specks,
}: {
  headingId: string;
  title: ReactNode;
  children: ReactNode;
  collapsed: ReactNode;
  label?: string;
  duration?: number;
  specks?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [toggled, setToggled] = useState(false);
  // Measure the panes' inner content: a hidden pane is clipped to h-0, but
  // its content keeps its natural height, so targets are always ready.
  const longRef = useRef<HTMLDivElement | null>(null);
  const shortRef = useRef<HTMLDivElement | null>(null);
  const [heights, setHeights] = useState<{ long: number; short: number } | null>(null);
  const [animating, setAnimating] = useState(false);
  const regionId = useId();

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

  // Pixel heights only while animating; at rest the container is auto so
  // reflows (fonts, resizes) never leave a stale height behind.
  const height = heights && animating ? (open ? heights.long : heights.short) : "auto";

  const paneState = (isLong: boolean): PaneState => {
    if (!animating) return open === isLong ? "flow" : "hidden";
    return open === isLong ? "overlay" : "flow";
  };

  const toggle = (
    <SeeMore
      open={open}
      label={label}
      controls={regionId}
      onToggle={() => {
        setOpen((v) => !v);
        setToggled(true);
        if (heights && heights.long !== heights.short) setAnimating(true);
      }}
    />
  );

  return (
    <div className="expander relative" data-open={open} data-toggled={toggled || undefined}>
      <SectionHeader id={headingId} title={title} action={toggle} specks={specks} />
      <motion.div
        id={regionId}
        className={`relative -mx-3 px-3 ${animating ? "overflow-hidden" : ""}`}
        initial={false}
        animate={{ height }}
        transition={{ duration: heights && animating ? duration : 0, ease: heightEase }}
        onAnimationComplete={() => setAnimating(false)}
      >
        <div inert={!open} className={paneClasses(paneState(true), open)}>
          <div ref={longRef}>{children}</div>
        </div>
        <div inert={open} className={paneClasses(paneState(false), !open)}>
          <div ref={shortRef}>{collapsed}</div>
        </div>
      </motion.div>
    </div>
  );
}
