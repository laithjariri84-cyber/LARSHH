"use client";

import { useEffect, useRef, useState } from "react";

function parseNumericValue(value: string): { numeric: number; prefix: string; suffix: string } | null {
  const match = value.match(/^([^0-9.-]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) return null;

  return {
    prefix: match[1],
    numeric: Number(match[2]),
    suffix: match[3],
  };
}

export function useAnimatedCounter(value: string, duration = 1200): string {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const parsed = parseNumericValue(value);
    if (!parsed) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const to = parsed.numeric;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = to * eased;
      const formatted =
        value.includes(".") && !Number.isInteger(to)
          ? current.toFixed(1)
          : Math.round(current).toString();

      setDisplay(`${parsed.prefix}${formatted}${parsed.suffix}`);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, value]);

  return display;
}
