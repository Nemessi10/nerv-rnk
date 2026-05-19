import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "~/server/db";
import { albums } from "~/server/db/schema";
import { lastFmApi } from "~/lib/lastfm/lastfm-api";

export const dynamic = "force-dynamic";

 const SYNC_COOLDOWN = 1000 * 60 * 5; // 5 minutes

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    const lastSync = cookieStore.get("last_library_sync")?.value;
    if (lastSync && Date.now() - Number(lastSync) < SYNC_COOLDOWN) {
      return NextResponse.json({ success: true, message: "Cooldowned" });
    }

    const token = cookieStore.get("spotify_at")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let allSpotifyAlbums: any[] = [];
    let nextUrl = "https://api.spotify.com/v1/me/albums?limit=50";

    while (nextUrl) {
      const res = await fetch(nextUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return NextResponse.json({ error: "Spotify fetch failed" }, { status: 400 });
      const data = await res.json();
      allSpotifyAlbums = [...allSpotifyAlbums, ...data.items];
      nextUrl = data.next;
    }

    const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const recentPlaybacks = recentRes.ok ? (await recentRes.json()).items : [];
    
    const playbackMap = new Map<string, Date>();
    recentPlaybacks.forEach((play: any) => {
      const albumId = play.track?.album?.id;
      const playedAt = new Date(play.played_at);
      if (albumId) {
        const existing = playbackMap.get(albumId);
        if (!existing || playedAt > existing) {
          playbackMap.set(albumId, playedAt);
        }
      }
    });

    if (allSpotifyAlbums.length > 0) {
      const uniqueArtists = [...new Set(allSpotifyAlbums.map((item: any) => item.album.artists[0]?.name).filter(Boolean))];
      const artistTagsMap = new Map<string, string[]>();

      // Фетчимо теги паралельно для швидкості
      await Promise.all(
        uniqueArtists.map(async (artist: any) => {
          try {
            const tags = await lastFmApi.getArtistTags(artist);
            artistTagsMap.set(artist, tags);
          } catch {
            artistTagsMap.set(artist, []);
          }
        })
      );

      const albumsToInsert = allSpotifyAlbums.map((item: any) => {
        const albumId = item.album.id;
        const artistName = item.album.artists[0]?.name;
        const tags = artistTagsMap.get(artistName) ?? [];
        
        return {
          spotifyId: albumId,
          title: item.album.name,
          artist: item.album.artists[0]?.name ?? "Unknown Artist",
          artistSpotifyId: item.album.artists[0]?.id ?? null,
          image: item.album.images[0]?.url ?? null,
          genre: tags[0] ?? "Unknown",
          subgenres: tags.slice(1),
          releaseDate: item.album.release_date,
          spotifyAddedAt: new Date(item.added_at),
          lastPlayedAt: playbackMap.get(albumId) ?? null,
        };
      });

      await db
        .insert(albums)
        .values(albumsToInsert)
        .onConflictDoUpdate({
          target: albums.spotifyId,
          set: {
            genre: sql`excluded.genre`,
            subgenres: sql`excluded.subgenres`,
            spotifyAddedAt: sql`excluded.spotify_added_at`,
            lastPlayedAt: sql`excluded.last_played_at`,
          }
        });
    }

    cookieStore.set("last_library_sync", Date.now().toString(), {
      maxAge: 60 * 5,
      path: "/",
    });

    return NextResponse.json({ success: true, count: allSpotifyAlbums.length });
  } catch (err) {
    console.error("Library sync error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}