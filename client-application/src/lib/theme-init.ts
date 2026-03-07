const STORAGE_KEY = "theme-storage";

function getStoredTheme(): "light" | "dark" | "system" {
  if (typeof window === "undefined") return "system";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "system";
    const data = JSON.parse(raw) as { theme?: string; state?: { theme?: string } };
    const theme = data.theme ?? data.state?.theme ?? "system";
    if (theme === "light" || theme === "dark" || theme === "system") return theme;
  } catch {
  }
  return "system";
}

function getResolvedTheme(): "light" | "dark" {
  const stored = getStoredTheme();
  if (stored === "dark") return "dark";
  if (stored === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyThemeFromStorage(): void {
  if (typeof document === "undefined") return;
  const resolved = getResolvedTheme();
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
}
