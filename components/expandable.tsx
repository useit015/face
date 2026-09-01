"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
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

  return (
    <div className="expander relative" data-open={open}>
      <div className="flex items-center justify-between gap-3">
        {header}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="group/see inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 -mr-2 text-[0.8rem] font-medium text-foreground-secondary transition-transform outline-none select-none squircle hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
        >
          {open ? "See less" : label}
          <ChevronsUpDown className="size-3" />
        </button>
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        {open ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.4, ease },
              opacity: { duration: 0.225, ease },
            }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        ) : (
          collapsed && (
            <motion.div
              key="collapsed"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.4, ease },
                opacity: { duration: 0.225, ease },
              }}
              className="overflow-hidden"
            >
              {collapsed}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
