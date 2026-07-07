export const THEME_STORAGE_KEY = "larssh-theme";

export type ThemePreference = "light" | "dark" | "system";

export type ResolvedTheme = "light" | "dark";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "dark";

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveThemePreference(
  preference: ThemePreference,
  prefersDark: boolean
): ResolvedTheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return prefersDark ? "dark" : "light";
}

export function readSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

/** Inline script — runs before paint to avoid theme flash. */
export const themeInitScript = `(function(){try{var k="larssh-theme";var p=localStorage.getItem(k);var dark=true;if(p==="light"){dark=false;}else if(p==="system"){dark=window.matchMedia("(prefers-color-scheme: dark)").matches;}document.documentElement.classList.toggle("dark",dark);}catch(e){document.documentElement.classList.add("dark");}})();`;
