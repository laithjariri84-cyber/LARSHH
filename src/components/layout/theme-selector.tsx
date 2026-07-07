"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { ThemePreference } from "@/lib/theme/constants";

import { useTheme } from "./theme-provider";

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeSelector() {
  const { preference, setPreference } = useTheme();

  return (
    <>
      <DropdownMenuLabel className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Theme
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={preference}
        onValueChange={(value) => setPreference(value as ThemePreference)}
      >
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuRadioItem key={value} value={value} className="gap-2 pl-8">
            <Icon className="text-muted-foreground size-4" />
            {label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
    </>
  );
}
