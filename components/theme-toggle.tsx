"use client";

import { useEffect, useSyncExternalStore } from "react";
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

  function toggle() {
    const next = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    window.dispatchEvent(new Event("themechange"));
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
          className={`absolute size-3.5 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
            dark ? "-rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Sun
          className={`absolute size-3.5 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
            dark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
