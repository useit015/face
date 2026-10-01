"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { blotPath, hashSeed, lineStroke, loopStroke } from "@/lib/sketch";
import { isDarkTheme, subscribeTheme, themeColors } from "@/lib/theme";
import { HoverLoop } from "@/components/ink/measured";

const blotMask = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${blotPath(11)}'/></svg>`,
)}")`;

// Sun: a small loop plus eight rays. Moon: a crescent in two pulls.
const sunCore = loopStroke(hashSeed("sun"), 8, 8, { pad: 0, turns: 1.08 });
const sunRays = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
  const c = 4;
  return lineStroke(
    hashSeed(`ray-${i}`),
    [c + Math.cos(a) * 7, c + Math.sin(a) * 7],
    [c + Math.cos(a) * 9.6, c + Math.sin(a) * 9.6],
    { bow: 0, jitter: 0.25 },
  );
});
const moonPath =
  "M6.6 -3.6C2 -3.5 -1.2 0.4 -0.6 4.6C0 8.6 3.6 11.4 7.8 11C9.8 10.8 11.3 9.9 12.3 8.6C8.6 9.3 5.2 7 4.4 3.4C3.8 0.6 4.8 -2 6.6 -3.6Z";

function subscribe(callback: () => void) {
  return subscribeTheme(callback);
}

function syncThemeChrome(dark: boolean) {
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", dark ? themeColors.dark : themeColors.light));
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((icon) => {
    icon.href = dark ? "/favicon-dark.svg" : "/favicon.svg";
  });
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDarkTheme, () => false);
  // Icon animations only arm after the first click, so the page loads with
  // the right icon already drawn instead of replaying the swap.
  const [armed, setArmed] = useState(false);
  const themeTransition = useRef<ViewTransition | undefined>(undefined);
  const themeRequest = useRef(0);
  const requestedTheme = useRef<"light" | "dark" | undefined>(undefined);

  useEffect(() => {
    const apply = () => syncThemeChrome(isDarkTheme());
    apply();
    window.dispatchEvent(new Event("themechange"));
    window.addEventListener("themechange", apply);
    // React re-inserts its metadata icon link whenever the current href
    // diverges from what it rendered, so keep re-syncing anything new.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true });
    return () => {
      window.removeEventListener("themechange", apply);
      observer.disconnect();
    };
  }, []);

  // A resize re-anchors the viewport and reduced motion must never animate,
  // so tear down an in-flight reveal instead of letting it finish wrong.
  useEffect(() => {
    const root = document.documentElement;
    const stop = () => {
      themeTransition.current?.skipTransition();
      root.removeAttribute("data-theme-animating");
      root.removeAttribute("data-theme-transition");
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduceChange = () => {
      if (reduce.matches) stop();
    };
    window.addEventListener("resize", stop);
    reduce.addEventListener("change", onReduceChange);
    return () => {
      window.removeEventListener("resize", stop);
      reduce.removeEventListener("change", onReduceChange);
    };
  }, []);

  async function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    setArmed(true);
    // The button rect is only valid during dispatch; measure before awaiting.
    const box = event.currentTarget.getBoundingClientRect();
    const root = document.documentElement;
    const current = requestedTheme.current ?? (isDarkTheme() ? "dark" : "light");
    const nextTheme = current === "dark" ? "light" : "dark";
    requestedTheme.current = nextTheme;
    const request = ++themeRequest.current;

    const applyTheme = () => {
      root.classList.toggle("dark", nextTheme === "dark");
      try {
        localStorage.setItem("theme", nextTheme);
      } catch {}
      window.dispatchEvent(new Event("themechange"));
    };

    // Only one document transition may run: skip the in-flight one and wait
    // for it to fully unwind before starting the next.
    if (themeTransition.current) {
      themeTransition.current.skipTransition();
      await themeTransition.current.finished.catch(() => {});
    }
    if (request !== themeRequest.current) return;
    root.removeAttribute("data-theme-animating");
    root.removeAttribute("data-theme-transition");
    themeTransition.current = undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || typeof document.startViewTransition !== "function") {
      applyTheme();
      requestedTheme.current = undefined;
      return;
    }

    // The blot's body covers ~36% of its box from the centre, so the box
    // has to be ~2.9× the distance to the farthest viewport corner.
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const far = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
    root.style.setProperty("--theme-cx", `${cx}px`);
    root.style.setProperty("--theme-cy", `${cy}px`);
    root.style.setProperty("--theme-reach", `${Math.ceil(far * 2.9)}px`);
    root.style.setProperty("--blot", blotMask);

    root.dataset.themeTransition = nextTheme;
    try {
      const transition = document.startViewTransition(applyTheme);
      themeTransition.current = transition;
      await transition.ready;
      if (request === themeRequest.current && !reduce.matches && root.hasAttribute("data-theme-transition")) {
        root.dataset.themeAnimating = "";
      }
      await transition.finished;
    } catch {
      // Theme switching stays usable if snapshots or the animation fail.
      themeTransition.current?.skipTransition();
      if (request === themeRequest.current) applyTheme();
    } finally {
      if (request === themeRequest.current) {
        root.removeAttribute("data-theme-animating");
        root.removeAttribute("data-theme-transition");
        themeTransition.current = undefined;
        requestedTheme.current = undefined;
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle theme"
      data-armed={armed || undefined}
      className="theme-toggle ink-hover has-loop group relative flex size-[38px] cursor-pointer sm:size-11 items-center justify-center text-ink select-none"
    >
      <HoverLoop seed="theme-loop" estimate={[22, 22]} pad={4} />
      <svg
        aria-hidden="true"
        viewBox="-6 -6 20 20"
        className="sketch theme-icon boil size-[19px] overflow-visible"
      >
        <g className="theme-sun">
          <path d={sunCore} pathLength={1} className="ts" style={{ "--dd": "0ms" } as React.CSSProperties} />
          {sunRays.map((d, i) => (
            <path key={i} d={d} pathLength={1} className="ts" style={{ "--dd": `${120 + i * 35}ms` } as React.CSSProperties} />
          ))}
        </g>
        {/* The crescent is optically lighter than the sun, so it's drawn a
            touch larger to read at the same size. */}
        <g className="theme-moon" transform="translate(5.85 3.7) scale(1.38) translate(-5.85 -3.7)">
          <path d={moonPath} pathLength={1} className="ts" style={{ "--dd": "60ms" } as React.CSSProperties} />
        </g>
      </svg>
    </button>
  );
}
