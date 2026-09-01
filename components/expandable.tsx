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
          className="group/see inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 -mr-2 text-[0.8rem] font-medium text-foreground-secondary transition-[background-color,color,transform] duration-200 outline-none select-none squircle hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
        >
          {open ? "See less" : label}
          <ChevronsUpDown className="size-3" />
        </button>
      </div>
      <motion.div
        className="relative overflow-hidden"
        initial={false}
        animate={{ height }}
        transition={{ duration: 0.4, ease }}
      >
        <div
          ref={longRef}
          className={`transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
            open
              ? "relative opacity-100 duration-[225ms]"
              : "pointer-events-none absolute inset-x-0 top-0 opacity-0 duration-[400ms]"
          }`}
        >
          {children}
        </div>
        {collapsed != null && (
          <div
            ref={shortRef}
            className={`transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
              open
                ? "pointer-events-none absolute inset-x-0 top-0 opacity-0 duration-[400ms]"
                : "relative opacity-100 duration-[225ms]"
            }`}
          >
            {collapsed}
          </div>
        )}
      </motion.div>
    </div>
  );
}
