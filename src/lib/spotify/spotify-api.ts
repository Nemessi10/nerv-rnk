import { spotifyAuth } from "./spotify-auth";
import { lastFmApi } from "../lastfm/lastfm-api";

import type {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyUser,
} from "~/types/spotify";
import type { AppAlbum } from "~/types/album";

class SpotifyApiService {
  BASE_URL = "https://api.spotify.com/v1";

  private serverUserCache: SpotifyUser | null = null;
  private clientUserCache: SpotifyUser | null = null;

  async request<T>(url: string): Promise<T> {
    let token: string | null = null;

    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("spotify_at")?.value ?? null;
    } else {
      token = await spotifyAuth.getAccessToken();
    }

    if (!token) {
      throw new Error("No Spotify access token (not authenticated)");
    }

    let res = await fetch(`${this.BASE_URL}${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401) {
      const newToken = await spotifyAuth.refreshAccessToken();
      if (!newToken) throw new Error("Unable to refresh token");
      res = await fetch(`${this.BASE_URL}${url}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${newToken}`, "Content-Type": "application/json" },
      });
    }

    const text = await res.text();

    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.error("FAILED TO PARSE JSON:", text);
    }

    if (!res.ok) {
      if (res.status === 429) throw new Error("Spotify API error 429: Too Many Requests");
      throw new Error(data?.error?.message ?? `Spotify API error ${res.status}`);
    }

    return data;
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    if (typeof window === "undefined") {
      if (this.serverUserCache) return this.serverUserCache;
      const data = await this.request<SpotifyUser>("/me");
      this.serverUserCache = data;
      return data;
    }

    if (this.clientUserCache) return this.clientUserCache;
    const data = await this.request<SpotifyUser>("/me");
    this.clientUserCache = data;
    return data;
  }

  async getUserAlbums(): Promise<AppAlbum[]> {
    let allItems: { album: SpotifyAlbum; added_at: string }[] = [];

    let offset = 0;
    const limit = 50;

    // FETCH ALL SAVED ALBUMS
    while (true) {
      const data = await this.request<{ items: any[] }>(`/me/albums?limit=${limit}&offset=${offset}`);
      allItems = [...allItems, ...data.items];
      if (data.items.length < limit) break;
      offset += limit;
    }

    // MAP SPOTIFY DATA
    const albums = allItems.map((item) => ({
      id: item.album.id,
      title: item.album.name,
      artist: item.album.artists[0]?.name ?? "Unknown Artist",
      artistId: item.album.artists[0]?.id ?? "",
      cover: item.album.images?.[0]?.url ?? "/placeholder.png",
      year: item.album.release_date ?? "Unknown",
      addedAt: item.added_at,
    }));

    // UNIQUE ARTISTS
    const uniqueArtists = [...new Set(albums.map((album) => album.artist))];

    // FETCH LAST.FM TAGS
    const artistGenresMap = new Map<string, string[]>();

    await Promise.all(
      uniqueArtists.map(async (artist) => {
        try {
          const tags = await lastFmApi.getArtistTags(artist);
          artistGenresMap.set(artist, tags);
        } catch {
          artistGenresMap.set(artist, []);
        }
      })
    );

    // ENRICH ALBUMS
    return albums.map((album) => {
      const tags = artistGenresMap.get(album.artist) ?? [];

      return {
        ...album,

        genre: tags[0] ?? "Unknown",

        subgenres: tags.slice(1),
      };
    });
  }

  clearCache() {
    this.serverUserCache = null;
    this.clientUserCache = null;
  }

  async getAlbum(id: string): Promise<SpotifyAlbum> {
    return this.request<SpotifyAlbum>(`/albums/${id}`);
  }

  async getArtist(id: string): Promise<SpotifyArtist> {
    const artist = await this.request<SpotifyArtist>(`/artists/${id}`);

    console.log("FULL ARTIST RESPONSE:", artist);

    return artist;
  }

  async getSeveralArtists(ids: string[]): Promise<SpotifyArtist[]> {
    const results: SpotifyArtist[] = [];

    for (const id of ids) {
      try {
        // console.log("FETCHING ARTIST:", id);

        const artist = await this.getArtist(id);

        results.push(artist);

        // console.log("SUCCESS:", id, artist.name);
      } catch (err) {
        console.error("FAILED ARTIST:", id, err);
      }
    }

    return results;
  }

  async getTrack(id: string): Promise<SpotifyTrack> {
    return this.request<SpotifyTrack>(`/tracks/${id}`);
  }

  async getAlbumDetails(id: string) {
    const album = await this.getAlbum(id);

    const artistName = album.artists[0]?.name ?? "Unknown Artist";

    let genres: string[] = [];

    try {
      genres = await lastFmApi.getArtistTags(artistName);
    } catch (err) {
      console.error("LAST.FM ERROR:", artistName, err);
    }

    return {
      id: album.id,

      title: album.name,

      artist: album.artists[0]?.name ?? "Unknown Artist",

      cover: album.images?.[0]?.url ?? "/placeholder.png",

      year: album.release_date?.slice(0, 4) ?? "Unknown",

      genre: genres[0] ?? "Unknown",

      subgenres: genres.slice(1),

      tracks:
        album.tracks?.items?.map((track) => ({
          id: track.id,
          title: track.name,
          durationMs: track.duration_ms,
        })) ?? [],

      totalTracks: album.total_tracks ?? 0,
    };
  }
}

export const spotifyApi = new SpotifyApiService();
