import { useState, useCallback } from "react";

const MAX_RECENT = 8;

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("fss-recent") || "[]");
    } catch { return []; }
  });

  const add = useCallback((query: string) => {
    setSearches((prev) => {
      const next = [query, ...prev.filter((s) => s !== query)].slice(0, MAX_RECENT);
      localStorage.setItem("fss-recent", JSON.stringify(next));
      return next;
    });
  }, []);

  return { searches, add };
}
