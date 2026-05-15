"use client";

import { useEffect, useState, useRef } from "react";
import { getCachedLibrary, setCachedLibrary } from "~/lib/cache/spotify-library-cache";
import type { AppAlbum } from "~/types/album";

export function useSpotifyLibrary() {
  const [albums, setAlbums] = useState<AppAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchFullLibrary = async (showLoading = true) => {
    if (isFetching.current) return;
    isFetching.current = true;
  
    if (showLoading) setLoading(true);
  
    try {
      // ВАЖЛИВО: Запускаємо фоном, БЕЗ await! 
      // Бекенд почне оновлювати базу, але фронтенд не чекає на нього
      void fetch("/api/library/sync", { method: "POST" });
  
      // Одразу беремо те, що є в базі — це займе всього ~160мс
      const res = await fetch("/api/ratings/user");
      if (!res.ok) throw new Error("Failed to fetch library");
      
      const enrichedAlbums: AppAlbum[] = await res.json();
  
      setAlbums(enrichedAlbums);
      setCachedLibrary(enrichedAlbums);
    } catch (error) {
      console.error("Library load error:", error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    const cached = getCachedLibrary();
    if (cached) {
      setAlbums(cached);
      setLoading(false);
      void fetchFullLibrary(false); // Фонове оновлення без лоадера
    } else {
      void fetchFullLibrary(true);  // Перше завантаження з лоадером
    }
  }, []);

  return {
    albums,
    loading,
    refresh: () => fetchFullLibrary(true),
  };
}