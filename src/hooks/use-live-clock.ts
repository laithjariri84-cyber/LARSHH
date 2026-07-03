"use client";

import { useEffect, useState } from "react";

type LiveClockConfig = {
  intervalMs?: number;
  placeholder?: string;
};

export function useLiveClock(
  formatOptions: Intl.DateTimeFormatOptions,
  config?: LiveClockConfig
): string {
  const { intervalMs = 1000, placeholder = "--:--:--" } = config ?? {};
  const optionsKey = JSON.stringify(formatOptions);
  const [value, setValue] = useState(placeholder);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", formatOptions);

    const tick = () => setValue(formatter.format(new Date()));
    tick();

    if (intervalMs <= 0) return;

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, optionsKey]);

  return value;
}
