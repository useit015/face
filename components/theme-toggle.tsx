"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const themeColors = { light: "#f9f7f4", dark: "#0d0c0a" } as const;

function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);
  return () => window.removeEventListener("themechange", callback);
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

function isDarkOnServer() {
  return false;
}

function syncThemeChrome(dark: boolean) {
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) =>
      meta.setAttribute(
        "content",
        dark ? themeColors.dark : themeColors.light,
      ),
    );
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((icon) => {
    icon.href = dark ? "/favicon-dark.svg" : "/favicon.svg";
  });
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, isDarkOnServer);
  const themeTransition = useRef<ViewTransition | undefined>(undefined);
  const themeRequest = useRef(0);
  const requestedTheme = useRef<"light" | "dark" | undefined>(undefined);

  useEffect(() => {
    const apply = () =>
      syncThemeChrome(document.documentElement.classList.contains("dark"));
    apply();
    window.dispatchEvent(new Event("themechange"));
    window.addEventListener("themechange", apply);
    // React re-inserts its metadata-rendered icon link whenever the current
    // href diverges from what it rendered, so keep re-syncing anything new.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true });
    return () => {
      window.removeEventListener("themechange", apply);
      observer.disconnect();
    };
  }, []);

  // A resize re-anchors the viewport, and reduced motion must never animate,
  // so tear down the in-flight reveal instead of letting it finish wrong.
  useEffect(() => {
    const root = document.documentElement;
    const stopThemeTransition = () => {
      themeTransition.current?.skipTransition();
      root.removeAttribute("data-theme-animating");
      root.removeAttribute("data-theme-transition");
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onResize = () => stopThemeTransition();
    const onReduceChange = () => {
      if (reduce.matches) stopThemeTransition();
    };
    window.addEventListener("resize", onResize);
    reduce.addEventListener("change", onReduceChange);
    return () => {
      window.removeEventListener("resize", onResize);
      reduce.removeEventListener("change", onReduceChange);
    };
  }, []);

  async function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    // The button rect is only valid during dispatch, so measure it before
    // any await below.
    const box = event.currentTarget.getBoundingClientRect();
    const root = document.documentElement;
    const current = requestedTheme.current ?? (root.classList.contains("dark") ? "dark" : "light");
    const nextTheme = current === "dark" ? "light" : "dark";
    requestedTheme.current = nextTheme;
    const request = ++themeRequest.current;

    const applyTheme = () => {
      const dark = nextTheme === "dark";
      root.classList.toggle("dark", dark);
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

    // The reveal is a rounded square centered on the button that scales
    // uniformly, so the shape stays similar at every frame. reach is the
    // smallest size whose rounded corners still contain the viewport
    // (the diagonal corner case needs ~1.2x the farthest distance).
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const half = Math.max(box.width, box.height) / 2;
    const reach = Math.max(cx, window.innerWidth - cx, cy, window.innerHeight - cy) * 1.22 + 16;
    root.style.setProperty("--theme-cx", `${cx}px`);
    root.style.setProperty("--theme-cy", `${cy}px`);
    root.style.setProperty("--theme-half", `${half}px`);
    root.style.setProperty("--theme-reach", `${reach}px`);
    // Edge insets drive the inset() fallback for browsers without shape().
    root.style.setProperty("--theme-inset-top", `${box.top}px`);
    root.style.setProperty("--theme-inset-right", `${window.innerWidth - box.right}px`);
    root.style.setProperty("--theme-inset-bottom", `${window.innerHeight - box.bottom}px`);
    root.style.setProperty("--theme-inset-left", `${box.left}px`);

    // The attribute picks the direction before snapshots are taken: to light
    // the new snapshot expands from the button, to dark the old snapshot
    // shrinks back into it.
    root.dataset.themeTransition = nextTheme;
    try {
      const transition = document.startViewTransition(applyTheme);
      themeTransition.current = transition;
      await transition.ready;
      if (
        request === themeRequest.current &&
        !reduce.matches &&
        root.hasAttribute("data-theme-transition")
      ) {
        root.dataset.themeAnimating = "";
      }
      await transition.finished;
    } catch {
      // Theme switching remains usable if snapshots or pseudo-element
      // animation fail.
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
      className="relative squircle flex size-7 cursor-pointer items-center justify-center rounded-md text-foreground-secondary transition-colors duration-200 outline-none select-none before:absolute before:-inset-2 before:content-[''] hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
    >
      <span aria-hidden="true" className="relative flex size-3.5 items-center justify-center">
        <Moon
          className={`absolute size-3.5 transition-[opacity,transform,color] duration-300 ease-out motion-reduce:transition-none ${
            dark ? "-rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Sun
          className={`absolute size-3.5 transition-[opacity,transform,color] duration-300 ease-out motion-reduce:transition-none ${
            dark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
