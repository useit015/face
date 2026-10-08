// Browser chrome colours for each theme (the paper, as hex for <meta>).
export const themeColors = { light: "#ede8df", dark: "#11192b" } as const;

export function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

/**
 * Calls back whenever the theme changes. The toggle (InkThemeToggle) only
 * flips `dark` on <html>, so this watches for exactly that.
 */
export function subscribeTheme(callback: () => void) {
  let dark = isDarkTheme();
  const observer = new MutationObserver(() => {
    if (isDarkTheme() === dark) return;
    dark = !dark;
    callback();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
