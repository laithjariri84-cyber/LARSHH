"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Clock,
  History,
  Search,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FilterOption } from "@/features/search/types";
import { cn } from "@/lib/utils";

import { DetectedFiltersBar } from "./detected-filters-bar";
import {
  buildSmartSearchUrl,
  parseSmartSearchQuery,
} from "./parse-smart-search";
import { SmartSearchQuickFilters } from "./smart-search-quick-filters";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  getSavedSearches,
  removeSavedSearch,
  saveSearch,
  type StoredSearch,
} from "./smart-search-storage";
import {
  AUTOCOMPLETE_STARTERS,
  QUICK_SUGGESTIONS,
  type DetectedFilter,
} from "./smart-search.types";

type SmartSearchBarProps = {
  communities: FilterOption[];
  buildings: FilterOption[];
  currentQuery?: string;
  currentDetected?: string[];
};

function filterSuggestions(input: string, pool: readonly string[]) {
  const needle = input.trim().toLowerCase();
  if (!needle) return [...pool];
  return pool.filter((item) => item.toLowerCase().includes(needle));
}

export function SmartSearchBar({
  communities,
  buildings,
  currentQuery = "",
  currentDetected = [],
}: SmartSearchBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(currentQuery);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<StoredSearch[]>([]);
  const [saved, setSaved] = useState<StoredSearch[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    setRecent(getRecentSearches());
    setSaved(getSavedSearches());
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const context = useMemo(
    () => ({ communities, buildings }),
    [communities, buildings]
  );

  const preview = useMemo(
    () => (query.trim() ? parseSmartSearchQuery(query, context) : null),
    [query, context]
  );

  const autocompleteItems = useMemo(() => {
    const merged = new Set<string>([
      ...filterSuggestions(query, QUICK_SUGGESTIONS),
      ...filterSuggestions(query, AUTOCOMPLETE_STARTERS),
      ...recent.map((item) => item.query),
      ...saved.map((item) => item.query),
    ]);
    return Array.from(merged).slice(0, 8);
  }, [query, recent, saved]);

  const detectedFromUrl = useMemo(() => {
    if (!currentQuery.trim()) return [];
    const parsed = parseSmartSearchQuery(currentQuery, context);
    return parsed.detected.filter((item) =>
      currentDetected.length === 0 ? true : currentDetected.includes(item.key)
    );
  }, [context, currentDetected, currentQuery]);

  const runSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        startTransition(() => router.push("/search"));
        return;
      }

      addRecentSearch(trimmed);
      setRecent(getRecentSearches());
      setOpen(false);

      startTransition(() => {
        router.push(buildSmartSearchUrl(trimmed, context));
      });
    },
    [context, router]
  );

  function handleSaveCurrent() {
    if (!query.trim()) return;
    saveSearch(query.trim());
    setSaved(getSavedSearches());
  }

  function handleRemoveSaved(item: string) {
    removeSavedSearch(item);
    setSaved(getSavedSearches());
  }

  return (
    <div className="space-y-4">
      <SmartSearchQuickFilters onSelect={runSearch} disabled={isPending} />

      <div
        ref={containerRef}
        className="larssh-card relative overflow-visible rounded-2xl border border-gold/15 bg-gradient-to-br from-gold/[0.06] via-transparent to-transparent p-4 md:p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="bg-gold/10 text-gold flex size-9 items-center justify-center rounded-xl">
            <Wand2 className="size-4" />
          </div>
          <div>
            <p className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
              AI Smart Search
            </p>
            <p className="text-muted-foreground text-xs">
              Describe what you want — LARSSH converts it to filters instantly
            </p>
          </div>
          {isPending ? (
            <Badge variant="outline" className="ml-auto border-gold/30 text-gold">
              Updating…
            </Badge>
          ) : null}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            runSearch(query);
          }}
          className="relative"
        >
          <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder='Try "2 bedroom sea view under 1.3m"'
            className="h-12 border-white/10 bg-black/20 pr-28 pl-11 text-base focus-visible:border-gold/40"
          />
          <Button
            type="submit"
            className="larssh-gold-btn absolute top-1/2 right-2 -translate-y-1/2"
            disabled={isPending}
          >
            <Sparkles className="size-4" />
            Search
          </Button>
        </form>

        {open ? (
          <div className="absolute right-4 left-4 z-20 mt-2 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl md:left-5 md:right-5">
            {preview && query.trim() ? (
              <div className="border-b border-white/5 px-4 py-3">
                <p className="text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-wide">
                  Preview detected filters
                </p>
                <div className="flex flex-wrap gap-2">
                  {preview.detected.length > 0 ? (
                    preview.detected.map((item) => (
                      <Badge
                        key={`${item.key}-${item.chip ?? item.value}`}
                        variant="outline"
                        className="border-gold/25 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white uppercase"
                      >
                        {item.chip ?? item.value}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Type a natural language query to preview filters
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {autocompleteItems.length > 0 ? (
              <div className="border-b border-white/5 px-2 py-2">
                <p className="text-muted-foreground px-2 py-1 text-[11px] font-medium uppercase tracking-wide">
                  Suggestions
                </p>
                {autocompleteItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="hover:bg-gold/10 flex w-full rounded-lg px-3 py-2 text-left text-sm transition-colors"
                    onClick={() => {
                      setQuery(item);
                      runSearch(item);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}

            {recent.length > 0 ? (
              <div className="border-b border-white/5 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide">
                    <History className="size-3.5" />
                    Recent searches
                  </p>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-gold text-[11px]"
                    onClick={() => {
                      clearRecentSearches();
                      setRecent([]);
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((item) => (
                    <button
                      key={item.query}
                      type="button"
                      className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-gold/30 hover:text-gold"
                      onClick={() => runSearch(item.query)}
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {saved.length > 0 ? (
              <div className="px-4 py-3">
                <p className="text-muted-foreground mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide">
                  <Bookmark className="size-3.5" />
                  Saved searches
                </p>
                <div className="space-y-1">
                  {saved.map((item) => (
                    <div
                      key={item.query}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5"
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 truncate text-left text-sm"
                        onClick={() => runSearch(item.query)}
                      >
                        {item.query}
                      </button>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        aria-label={`Remove saved search ${item.query}`}
                        onClick={() => handleRemoveSaved(item.query)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_SUGGESTIONS.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                "rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs transition-colors hover:border-gold/30 hover:text-gold"
              )}
              onClick={() => runSearch(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/10 hover:border-gold/30 hover:text-gold"
            onClick={handleSaveCurrent}
            disabled={!query.trim()}
          >
            <Bookmark className="size-4" />
            Save search
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-gold"
            onClick={() => {
              setQuery("");
              startTransition(() => router.push("/search"));
            }}
          >
            <Clock className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <DetectedFiltersBar
        detected={detectedFromUrl}
        onClear={
          currentQuery
            ? () => startTransition(() => router.push("/search"))
            : undefined
        }
      />
    </div>
  );
}

export function resolveDetectedFilters(
  query: string,
  communities: FilterOption[],
  buildings: FilterOption[],
  detectedKeys?: string[]
): DetectedFilter[] {
  const parsed = parseSmartSearchQuery(query, { communities, buildings });
  if (!detectedKeys?.length) return parsed.detected;
  return parsed.detected.filter((item) => detectedKeys.includes(item.key));
}
