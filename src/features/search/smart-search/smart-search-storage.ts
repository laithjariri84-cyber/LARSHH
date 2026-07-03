const RECENT_KEY = "larssh:smart-search:recent";
const SAVED_KEY = "larssh:smart-search:saved";
const MAX_RECENT = 8;
const MAX_SAVED = 12;

export type StoredSearch = {
  query: string;
  savedAt: number;
};

function readList(key: string): StoredSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSearch[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key: string, items: StoredSearch[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
}

export function getRecentSearches(): StoredSearch[] {
  return readList(RECENT_KEY);
}

export function getSavedSearches(): StoredSearch[] {
  return readList(SAVED_KEY);
}

export function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;

  const next = [
    { query: trimmed, savedAt: Date.now() },
    ...getRecentSearches().filter((item) => item.query !== trimmed),
  ].slice(0, MAX_RECENT);

  writeList(RECENT_KEY, next);
}

export function saveSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;

  const next = [
    { query: trimmed, savedAt: Date.now() },
    ...getSavedSearches().filter((item) => item.query !== trimmed),
  ].slice(0, MAX_SAVED);

  writeList(SAVED_KEY, next);
}

export function removeSavedSearch(query: string) {
  writeList(
    SAVED_KEY,
    getSavedSearches().filter((item) => item.query !== query)
  );
}

export function clearRecentSearches() {
  writeList(RECENT_KEY, []);
}
