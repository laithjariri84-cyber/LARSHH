"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  applyResolvedTheme,
  DEFAULT_THEME_PREFERENCE,
  isThemePreference,
  readSystemPrefersDark,
  resolveThemePreference,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme/constants";

type ThemeContextValue = {
  /** Stored user choice: light, dark, or system. */
  preference: ThemePreference;
  /** Active palette applied to the document. */
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return DEFAULT_THEME_PREFERENCE;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    DEFAULT_THEME_PREFERENCE
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  const syncTheme = useCallback((nextPreference: ThemePreference) => {
    const prefersDark = readSystemPrefersDark();
    const resolved = resolveThemePreference(nextPreference, prefersDark);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    const stored = readStoredPreference();
    setPreferenceState(stored);
    syncTheme(stored);
  }, [syncTheme]);

  useEffect(() => {
    if (preference !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => syncTheme("system");

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference, syncTheme]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
      syncTheme(next);
    },
    [syncTheme]
  );

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
