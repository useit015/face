"use client";

import { useEffect } from "react";
import { isDarkTheme, subscribeTheme, themeColors } from "@/lib/theme";

function sync() {
  const dark = isDarkTheme();
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", dark ? themeColors.dark : themeColors.light));
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((icon) => {
    const href = dark ? "/favicon-dark.svg" : "/favicon.svg";
    if (!icon.href.endsWith(href)) icon.href = href;
  });
}

/**
 * Keeps the browser's own chrome in the page's theme: the toolbar colour and
 * the favicon follow the chosen theme, not just the system's.
 */
export function ThemeChrome() {
  useEffect(() => {
    sync();
    const unsubscribe = subscribeTheme(sync);
    // React puts its metadata icon link back whenever its href differs from
    // what it rendered, so re-sync anything it inserts.
    const observer = new MutationObserver(sync);
    observer.observe(document.head, { childList: true });
    // Tells the failsafe in the layout that the page came to life.
    document.documentElement.dataset.hydrated = "";
    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, []);
  return null;
}
