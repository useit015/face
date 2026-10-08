"use client";

import { useRef, useState, useSyncExternalStore, type ComponentProps, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { Stroke } from "@/lib/ink";
import { blotPath, hashSeed, lineStroke, loopStroke } from "@/lib/ink-sketch";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const blot = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${blotPath(11)}'/></svg>`)}")`;

// Sun: a small loop and eight rays. Moon: a crescent in one pull.
const sun = [
  loopStroke(hashSeed("sun"), 8, 8, { pad: 0, turns: 1.08 }),
  ...Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return lineStroke(hashSeed(`ray-${i}`), [4 + Math.cos(a) * 7, 4 + Math.sin(a) * 7], [4 + Math.cos(a) * 9.6, 4 + Math.sin(a) * 9.6], { bow: 0, jitter: 0.25 });
  }),
];
const moon = "M6.6 -3.6C2 -3.5 -1.2 0.4 -0.6 4.6C0 8.6 3.6 11.4 7.8 11C9.8 10.8 11.3 9.9 12.3 8.6C8.6 9.3 5.2 7 4.4 3.4C3.8 0.6 4.8 -2 6.6 -3.6Z";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const htmlIsDark = () => document.documentElement.classList.contains("dark");

/**
 * Switches day and night. The new theme spreads out from the button like a
 * drop of ink hitting the page (where the browser has view transitions;
 * otherwise, and with reduced motion, it simply switches), and the icon
 * swaps sun for moon with the pen.
 *
 * On its own it toggles `dark` on <html> and remembers the choice in
 * localStorage. With a theme library, pass `theme` and `onThemeChange`
 * (next-themes: resolvedTheme and setTheme).
 */
function InkThemeToggle({
  theme,
  onThemeChange,
  storageKey = "theme",
  className,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Button>, "children"> & {
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  /** Where the choice is kept when the toggle manages the theme itself. */
  storageKey?: string;
}) {
  const htmlDark = useSyncExternalStore(subscribe, htmlIsDark, () => false);
  const dark = theme ? theme === "dark" : htmlDark;
  // The icon only animates after the first click, so the page loads with
  // the right one already drawn.
  const [armed, setArmed] = useState(false);
  const running = useRef<ViewTransition | undefined>(undefined);

  async function toggle(event: MouseEvent<HTMLButtonElement>) {
    setArmed(true);
    // Measure now: the event's target rect is only valid during dispatch.
    const box = event.currentTarget.getBoundingClientRect();
    const root = document.documentElement;
    const next: Theme = dark ? "light" : "dark";
    const apply = () => {
      if (onThemeChange) return flushSync(() => onThemeChange(next));
      root.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem(storageKey, next);
      } catch {}
    };

    running.current?.skipTransition();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof document.startViewTransition !== "function") return apply();

    // The blot's body covers about 36% of its box from the centre, so the
    // box has to reach about 2.9× the farthest corner of the viewport.
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--ink-theme-x", `${x}px`);
    root.style.setProperty("--ink-theme-y", `${y}px`);
    root.style.setProperty("--ink-theme-reach", `${Math.ceil(far * 2.9)}px`);
    root.style.setProperty("--ink-blot", blot);
    root.dataset.inkThemeTransition = next;
    let transition: ViewTransition | undefined;
    try {
      transition = document.startViewTransition(apply);
      running.current = transition;
      await transition.ready;
      root.dataset.inkThemeAnimating = "";
      await transition.finished;
    } catch {
      // The theme still switches if the snapshot or the animation fails.
      if (!transition) apply();
    } finally {
      // A newer click may have taken over; it cleans up after itself.
      if (running.current === transition) {
        root.removeAttribute("data-ink-theme-animating");
        root.removeAttribute("data-ink-theme-transition");
        running.current = undefined;
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      data-slot="ink-theme-toggle"
      data-armed={armed ? "" : undefined}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn("text-ink", className)}
      onClick={(event) => {
        onClick?.(event);
        void toggle(event);
      }}
      {...props}
    >
      <svg aria-hidden="true" viewBox="-6 -6 20 20" className="ink-glyph ink-theme-icon size-5">
        <g className="ink-sun">
          {sun.map((d, i) => (
            <Stroke key={i} d={d} delay={i ? 120 + i * 35 : 0} width={i ? 1.6 : 1.7} />
          ))}
        </g>
        {/* The crescent is lighter to the eye than the sun, so it's drawn a touch larger. */}
        <g className="ink-moon" transform="translate(5.85 3.7) scale(1.3) translate(-5.85 -3.7)">
          <Stroke d={moon} delay={60} width={1.3} />
        </g>
      </svg>
    </Button>
  );
}

export { InkThemeToggle };
