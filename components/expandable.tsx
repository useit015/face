"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronsUpDown } from "lucide-react";

const ease = [0.4, 0, 0.2, 1] as const;

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

  return (
    <div className="expander relative" data-open={open}>
      <div className="flex items-center justify-between gap-3">
        {header}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="group/see relative inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 -mr-2 font-mono text-meta font-medium text-foreground-secondary transition-[background-color,color,transform] duration-200 outline-none select-none squircle before:absolute before:-inset-y-2 before:-inset-x-1 before:content-[''] hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
        >
          {open ? "See less" : label}
          <ChevronsUpDown className="size-3" />
        </button>
      </div>
      <motion.div
        className={`relative -mx-3 px-3 ${animating ? "overflow-hidden" : ""}`}
        initial={false}
        animate={{ height }}
        transition={{ duration: 0.4, ease }}
        onAnimationStart={() => setAnimating(true)}
        onAnimationComplete={() => setAnimating(false)}
      >
        <div
          ref={longRef}
          inert={!open}
          className={`${
            open
              ? "relative opacity-100 transition-opacity duration-[225ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              : "pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-hidden opacity-0"
          }`}
        >
          {children}
        </div>
        {collapsed != null && (
          <div
            ref={shortRef}
            inert={open}
            className={`${
              open
                ? "pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-hidden opacity-0"
                : "relative opacity-100 transition-opacity duration-[225ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            }`}
          >
            {collapsed}
          </div>
        )}
      </motion.div>
    </div>
  );
}
