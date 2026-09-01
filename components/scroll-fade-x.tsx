"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll container that fades its clipped edges. Sets --scroll-fade-s/e so the
 * `scroll-fade-x` utility's mask only appears on edges that actually hide
 * content — works in every browser, no scroll-driven-animation support needed.
 */
export function ScrollFadeX({
  as = "div",
  className: classNameProp = "",
  children,
}: {
  as?: "div" | "ul";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.style.setProperty(
        "--scroll-fade-s",
        el.scrollLeft > 0 ? "var(--scroll-fade-size)" : "0px",
      );
      el.style.setProperty(
        "--scroll-fade-e",
        el.scrollLeft < max - 1 ? "var(--scroll-fade-size)" : "0px",
      );
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const className = `scroll-fade-x ${classNameProp}`;
  if (as === "ul") {
    return (
      <ul ref={ref as React.RefObject<HTMLUListElement | null>} className={className}>
        {children}
      </ul>
    );
  }
  return (
    <div ref={ref as React.RefObject<HTMLDivElement | null>} className={className}>
      {children}
    </div>
  );
}
