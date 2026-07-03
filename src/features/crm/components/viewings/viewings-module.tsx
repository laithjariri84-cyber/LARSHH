"use client";

import { useMemo, useState } from "react";

import type { Viewing } from "../../types";
import { VIEWING_TABS } from "../../data/mock-crm-data";
import {
  getCalendarDays,
  toDateKey,
} from "../../lib/formatters";
import {
  ViewingCalendarDay,
  ViewingCalendarHeader,
  ViewingCard,
  ViewingEmptyState,
} from "./viewing-card";
import { cn } from "@/lib/utils";

type ViewingsModuleProps = {
  viewings: Viewing[];
};

const CALENDAR_YEAR = 2026;
const CALENDAR_MONTH = 6; // July (0-indexed)

export function ViewingsModule({ viewings }: ViewingsModuleProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof VIEWING_TABS)[number]["id"]>("calendar");

  const filteredViewings = useMemo(() => {
    if (activeTab === "upcoming") {
      return viewings.filter((viewing) => viewing.status === "upcoming");
    }
    if (activeTab === "today") {
      return viewings.filter((viewing) => viewing.status === "today");
    }
    if (activeTab === "past") {
      return viewings.filter((viewing) => viewing.status === "past");
    }
    return viewings;
  }, [activeTab, viewings]);

  const calendarDays = useMemo(
    () => getCalendarDays(CALENDAR_YEAR, CALENDAR_MONTH),
    []
  );

  const viewingsByDate = useMemo(() => {
    const map = new Map<string, Viewing[]>();
    viewings.forEach((viewing) => {
      const key = viewing.date;
      map.set(key, [...(map.get(key) ?? []), viewing]);
    });
    return map;
  }, [viewings]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {VIEWING_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm transition-colors",
              activeTab === tab.id
                ? "border-gold/25 bg-gold-muted text-gold"
                : "border-white/10 text-muted-foreground hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "calendar" ? (
        <div className="paragon-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">July 2026</h3>
            <p className="text-muted-foreground text-xs">
              {viewings.length} viewings indexed
            </p>
          </div>
          <ViewingCalendarHeader />
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const key = date ? toDateKey(date) : `empty-${index}`;
              const dayViewings = date ? viewingsByDate.get(key) ?? [] : [];
              return (
                <ViewingCalendarDay
                  key={key}
                  date={date}
                  viewings={dayViewings}
                  isToday={key === "2026-07-01"}
                />
              );
            })}
          </div>
        </div>
      ) : filteredViewings.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredViewings.map((viewing) => (
            <ViewingCard key={viewing.id} viewing={viewing} />
          ))}
        </div>
      ) : (
        <ViewingEmptyState label={`No ${activeTab.replace("_", " ")} viewings`} />
      )}
    </div>
  );
}
