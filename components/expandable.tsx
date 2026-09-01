"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronsUpDown } from "lucide-react";

type Phase = "closed" | "opening" | "open" | "closing";

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
  const [phase, setPhase] = useState<Phase>("closed");
  const boxRef = useRef<HTMLDivElement | null>(null);
  const shortRef = useRef<HTMLDivElement | null>(null);
  const longRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = phase === "opening" || phase === "open";

  useLayoutEffect(() => {
    if (phase !== "opening" && phase !== "closing") return;
    const box = boxRef.current;
    const target = phase === "opening" ? longRef.current : shortRef.current;
    if (!box || !target) return;
    const from = box.offsetHeight;
    const to = target.offsetHeight;
    box.style.height = from + "px";
    void box.offsetHeight;
    box.style.transition = "height 400ms cubic-bezier(0.4, 0, 0.2, 1)";
    box.style.height = to + "px";
    timer.current = setTimeout(() => {
      box.style.transition = "";
      box.style.height = "";
      setPhase(phase === "opening" ? "open" : "closed");
    }, 420);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phase]);

  const toggle = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (phase === "closed") setPhase("opening");
    else if (phase === "open") setPhase("closing");
    else if (phase === "opening") setPhase("closing");
    else setPhase("opening");
  };

  return (
    <div className="expander" data-open={open}>
      <div className="flex items-center justify-between gap-3">
        {header}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="group/see inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 -mr-2 text-[0.8rem] font-medium text-foreground-secondary transition-transform outline-none select-none squircle hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
        >
          {open ? "See less" : label}
          <ChevronsUpDown className="size-3" />
        </button>
      </div>
      <div ref={boxRef} className="relative overflow-hidden">
        {collapsed != null && phase !== "open" && (
          <div
            ref={shortRef}
            className={`transition-opacity duration-[225ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              phase === "closed" ? "relative" : "absolute inset-x-0 top-0"
            } ${phase === "opening" ? "opacity-0" : "opacity-100"}`}
          >
            {collapsed}
          </div>
        )}
        {phase !== "open" && (
          <div
            ref={longRef}
            className={`transition-opacity duration-[225ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              phase === "closed"
                ? "hidden"
                : "absolute inset-x-0 top-0"
            } ${phase === "closing" ? "opacity-0" : "opacity-100"}`}
          >
            {children}
          </div>
        )}
        {phase === "open" && (
          <div ref={longRef} className="relative">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
