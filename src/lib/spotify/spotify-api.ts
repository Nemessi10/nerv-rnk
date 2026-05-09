import { spotifyAuth } from "./spotify-auth";

import type {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyUser,
} from "~/types/spotify";

export type AppAlbum = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  cover: string;
  year: string;
  genre: string;
  subgenre: string | null;
};

class SpotifyApiService {
  BASE_URL = "https://api.spotify.com/v1";


  async request<T>(url: string): Promise<T> {
    const token = await spotifyAuth.getAccessToken();
  
    if (!token) {
      throw new Error("No Spotify access token");
    }
  
    console.log("SPOTIFY REQUEST:", {
      url,
      tokenPreview: token.slice(0, 20),
    });
  
    const res = await fetch(`${this.BASE_URL}${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  
    const text = await res.text();
  
    console.log("SPOTIFY RAW RESPONSE:", {
      status: res.status,
      statusText: res.statusText,
      url,
      body: text,
    });
  
    let data: any = null;
  
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.error("FAILED TO PARSE JSON:", text);
    }
  
    if (!res.ok) {
      console.error("SPOTIFY API ERROR:", {
        status: res.status,
        url,
        headers: Object.fromEntries(res.headers.entries()),
        data,
      });
  
      throw new Error(
        data?.error?.message ||
        `Spotify API error ${res.status}`
      );
    }
  
    return data;
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    return this.request<SpotifyUser>("/me");
  }

  async getUserAlbums(): Promise<AppAlbum[]> {
    const data = await this.request<{
      items: {
        album: SpotifyAlbum;
      }[];
    }>("/me/albums");

    const albums = data.items.map((item) => ({
      id: item.album.id,
      title: item.album.name,
      artist: item.album.artists[0]?.name || "Unknown Artist",
      artistId: item.album.artists[0]?.id || "",
      cover: item.album.images?.[0]?.url || "/placeholder.png",
      year: item.album.release_date?.slice(0, 4) || "Unknown",
    }));

    // FETCH ARTISTS FOR GENRES
    const artistIds = [
      ...new Set(albums.map((album) => album.artistId).filter(Boolean)),
    ];

    if (artistIds.length === 0) {
      return albums.map((album) => ({
        ...album,
        genre: "Unknown",
        subgenre: null,
      }));
    }

    const artists = await this.getSeveralArtists(artistIds);

    const artistMap = Object.fromEntries(
      artists.map((artist) => [artist.id, artist]),
    );

    return albums.map((album) => {
      const artist = artistMap[album.artistId];

      return {
        ...album,
        genre: artist?.genres?.[0] || "Unknown",
        subgenre: artist?.genres?.[1] || null,
      };
    });
  }

  async getAlbum(id: string): Promise<SpotifyAlbum> {
    return this.request<SpotifyAlbum>(`/albums/${id}`);
  }

  async getArtist(id: string): Promise<SpotifyArtist> {
    return this.request<SpotifyArtist>(`/artists/${id}`);
  }

  async getSeveralArtists(ids: string[]): Promise<SpotifyArtist[]> {
    const results: SpotifyArtist[] = [];
  
    for (const id of ids) {
      try {
        console.log("FETCHING ARTIST:", id);
  
        const artist = await this.getArtist(id);
  
        results.push(artist);
  
        console.log("SUCCESS:", id, artist.name);
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

    const artistId = album.artists[0]?.id;

    let artist: SpotifyArtist | null = null;

    if (artistId) {
      artist = await this.getArtist(artistId);
    }

    return {
      id: album.id,

      title: album.name,

      artist: album.artists[0]?.name || "Unknown Artist",

      artistId: artistId || "",

      cover: album.images?.[0]?.url || "/placeholder.png",

      year: album.release_date?.slice(0, 4) || "Unknown",

      genre: artist?.genres?.[0] || "Unknown",

      subgenre: artist?.genres?.[1] || null,

      tracks:
        album.tracks?.items?.map((track) => ({
          id: track.id,
          title: track.name,
          durationMs: track.duration_ms,
        })) || [],

      totalTracks: album.total_tracks || 0,
    };
  }
}

export const spotifyApi = new SpotifyApiService();
