"use client";

import { useEffect, useState } from "react";
import { spotifyApi } from "~/lib/spotify/spotify-api";
import {
  getCachedLibrary,
  setCachedLibrary,
} from "~/lib/cache/spotify-library-cache";
import type { AppAlbum } from "~/lib/spotify/spotify-api";

export function useSpotifyLibrary() {
  const [albums, setAlbums] = useState<AppAlbum[]>([]);
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
        const data = await spotifyApi.getUserAlbums();

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

      const data = await spotifyApi.getUserAlbums();
      setAlbums(data);
      setCachedLibrary(data);

      setLoading(false);
    },
  };
}
