// Browser chrome colours for each theme (the paper, as hex for <meta>).
export const themeColors = { light: "#ede8df", dark: "#11192b" } as const;

export function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

export function subscribeTheme(callback: () => void) {
  window.addEventListener("themechange", callback);
  return () => window.removeEventListener("themechange", callback);
}

