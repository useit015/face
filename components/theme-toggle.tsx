"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const themeColors = { light: "#faf8f2", dark: "#0b0b0b" } as const;

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

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, isDarkOnServer);

  function toggle() {
    const next = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next ? themeColors.dark : themeColors.light);
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle theme"
      className="squircle flex size-7 cursor-pointer items-center justify-center rounded-md text-foreground-secondary transition-colors duration-200 outline-none select-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
    >
      {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
}
