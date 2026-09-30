"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  /**
   * - plain: no motion of its own; only arms the strokes and handwriting inside
   * - ink: fades in from a slight blur, like ink settling
   * - fade / rise / stagger: as named (stagger children read --i)
   */
  variant?: "plain" | "ink" | "fade" | "rise" | "stagger";
  delay?: number;
  /**
   * Above-the-fold content: ships already "in view" in the server HTML, so
   * its entrance plays from first paint instead of waiting for hydration.
   */
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  id?: string;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-label"?: string;
};

export function Reveal({
  children,
  variant = "fade",
  delay = 0,
  eager = false,
  className,
  style,
  as: Tag = "div",
  id,
  ...aria
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || eager) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <Tag
      ref={ref}
      id={id}
      {...aria}
      data-reveal={variant}
      className={eager ? `${className ?? ""} is-inview` : className}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
