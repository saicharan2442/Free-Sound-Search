import { useState, useCallback } from "react";

interface FavouriteMusics {
  [key: string]: boolean;
}

const STORAGE_KEY = "music_favourites";

export function useMusicFavorites() {
  const [favourites, setFavourites] = useState<FavouriteMusics>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  const isFavorite = useCallback(
    (musicId: string) => favourites[musicId] || false,
    [favourites]
  );

  const toggle = useCallback((musicId: string) => {
    setFavourites((prev) => {
      const updated = { ...prev, [musicId]: !prev[musicId] };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  return { isFavorite, toggle };
}
