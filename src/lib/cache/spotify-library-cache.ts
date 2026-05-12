import type { AppAlbum } from "~/types/album";

const CACHE_KEY = "spotify_library_cache_v1";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

type CachedData = {
  timestamp: number;
  data: AppAlbum[];
};

export const getCachedLibrary = (): AppAlbum[] | null => {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed: CachedData = JSON.parse(raw);

    const isExpired = Date.now() - parsed.timestamp > CACHE_TTL;

    if (isExpired) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

export const setCachedLibrary = (data: AppAlbum[]) => {
  if (typeof window === "undefined") return;

  const payload: CachedData = {
    timestamp: Date.now(),
    data,
  };

  sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
};

export const clearCachedLibrary = () => {
  sessionStorage.removeItem(CACHE_KEY);
};
