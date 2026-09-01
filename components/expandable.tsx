"use client";

import { useState, type ReactNode } from "react";
import { ChevronsUpDown } from "lucide-react";

export function Expandable({
  header,
  children,
  collapsed,
  always,
  label = "See more",
}: {
  header: ReactNode;
  children: ReactNode;
  collapsed?: ReactNode;
  always?: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="expander" data-open={open}>
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
      {always}
      {collapsed != null && (
        <div
          className="grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ gridTemplateRows: open ? "0fr" : "1fr" }}
          aria-hidden={open}
        >
          <div
            className="overflow-hidden transition-opacity duration-[225ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ opacity: open ? 0 : 1 }}
          >
            {collapsed}
          </div>
        </div>
      )}
      <div
        className="grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
