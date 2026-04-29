"use client";

import { useEffect, useState } from "react";
import { getAllUserAlbums } from "~/lib/spotify/service";
import {
  getCachedLibrary,
  setCachedLibrary,
} from "~/lib/cache/spotify-library-cache";
import type { Album } from "~/lib/spotify/types";

export function useSpotifyLibrary() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // 1. TRY CACHE FIRST
      const cached = getCachedLibrary();

      if (cached) {
        setAlbums(cached);
        setLoading(false);
        return;
      }

      // 2. FETCH FROM SPOTIFY
      try {
        const data = await getAllUserAlbums();

        setAlbums(data);

        // 3. SAVE CACHE
        setCachedLibrary(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return {
    albums,
    loading,
    refresh: async () => {
      setLoading(true);

      const data = await getAllUserAlbums();
      setAlbums(data);
      setCachedLibrary(data);

      setLoading(false);
    },
  };
}
