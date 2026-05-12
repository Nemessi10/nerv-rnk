"use client";

import { useEffect, useState, useRef } from "react";
import { spotifyApi } from "~/lib/spotify/spotify-api";
import {
  getCachedLibrary,
  setCachedLibrary,
} from "~/lib/cache/spotify-library-cache";
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
      const [spotifyAlbums, ratingsRes] = await Promise.all([
        spotifyApi.getUserAlbums(),
        fetch("/api/ratings/user").then((res) => (res.ok ? res.json() : [])),
      ]);

      const ratingsMap = new Map(
        ratingsRes.map((r: any) => [r.albumSpotifyId, r.rating]),
      );

      const enrichedAlbums = spotifyAlbums.map((album) => ({
        ...album,
        rating: ratingsMap.get(album.id),
      }));

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
      void fetchFullLibrary(false);
    } else {
      void fetchFullLibrary(true);
    }
  }, []);

  return {
    albums,
    loading,
    refresh: () => fetchFullLibrary(true),
  };
}
