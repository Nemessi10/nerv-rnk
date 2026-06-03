import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "~/server/db";
import { albums } from "~/server/db/schema";
import { discogsApi } from "~/lib/discogs/discogs-api";
import type {
  SpotifyLibraryItem,
  SpotifyLibraryResponse,
  SpotifyRecentPlaybackItem,
  SpotifyRecentPlaybackResponse,
} from "~/types/spotify";

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
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let allSpotifyAlbums: SpotifyLibraryItem[] = [];
    let nextUrl: string | null =
      "https://api.spotify.com/v1/me/albums?limit=50";

    while (nextUrl) {
      const res = await fetch(nextUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        return NextResponse.json(
          { error: "Spotify fetch failed" },
          { status: 400 },
        );
      const data = (await res.json()) as SpotifyLibraryResponse;
      allSpotifyAlbums = [...allSpotifyAlbums, ...data.items];
      nextUrl = data.next;
    }

    const recentRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const recentPlaybacks = recentRes.ok
      ? ((await recentRes.json()) as SpotifyRecentPlaybackResponse).items
      : [];

    const playbackMap = new Map<string, Date>();
    recentPlaybacks.forEach((play: SpotifyRecentPlaybackItem) => {
      const albumId = play.track?.album?.id;
      const playedAt = new Date(play.played_at);
      if (albumId) {
        const existing = playbackMap.get(albumId);
        if (!existing || playedAt > existing)
          playbackMap.set(albumId, playedAt);
      }
    });

    cookieStore.set("last_library_sync", Date.now().toString(), {
      maxAge: 60 * 5,
      path: "/",
    });

    if (allSpotifyAlbums.length > 0) {
      void (async () => {
        console.log(
          `[Sync Worker] Starting background genre sync for ${allSpotifyAlbums.length} albums...`,
        );

        const existingDbAlbums = await db
          .select({ spotifyId: albums.spotifyId })
          .from(albums);
        const existingIdsSet = new Set(
          existingDbAlbums.map((a) => a.spotifyId),
        );

        const albumsToInsert = [];
        let discogsRequestCounter = 0;

        for (const item of allSpotifyAlbums) {
          const albumId = item.album.id;
          const artistName = item.album.artists[0]?.name ?? "Unknown Artist";
          const albumTitle = item.album.name;

          let genre = "Unknown";
          let subgenres: string[] = [];

          if (existingIdsSet.has(albumId)) {
          } else {
            const discogsData = await discogsApi.getAlbumGenres(
              artistName,
              albumTitle,
            );
            genre = discogsData.genre;
            subgenres = discogsData.subgenres;

            discogsRequestCounter++;

            if (discogsRequestCounter % 5 === 0) {
              console.log(
                `[Sync Worker] Processed ${discogsRequestCounter} new albums. Cooling down Discogs...`,
              );
              await new Promise((resolve) => setTimeout(resolve, 3500));
            } else {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }

          albumsToInsert.push({
            spotifyId: albumId,
            title: albumTitle,
            artist: artistName,
            artistSpotifyId: item.album.artists[0]?.id ?? null,
            image: item.album.images[0]?.url ?? null,
            genre: genre,
            subgenres: subgenres,
            releaseDate: item.album.release_date,
            spotifyAddedAt: new Date(item.added_at),
            lastPlayedAt: playbackMap.get(albumId) ?? null,
          });
        }

        if (albumsToInsert.length > 0) {
          await db
            .insert(albums)
            .values(albumsToInsert)
            .onConflictDoUpdate({
              target: albums.spotifyId,
              set: {
                genre: sql`CASE WHEN excluded.genre <> 'Unknown' THEN excluded.genre ELSE ${albums.genre} END`,
                subgenres: sql`CASE WHEN array_length(excluded.subgenres, 1) > 0 THEN excluded.subgenres ELSE ${albums.subgenres} END`,
                spotifyAddedAt: sql`excluded.spotify_added_at`,
                lastPlayedAt: sql`COALESCE(excluded.last_played_at, ${albums.lastPlayedAt})`,
              },
            });
        }

        console.log(
          `[Sync Worker] Background sync finished. Total Discogs requests made: ${discogsRequestCounter}`,
        );
      })();
    }

    return NextResponse.json({
      success: true,
      count: allSpotifyAlbums.length,
      async: true,
    });
  } catch (err) {
    console.error("Library sync error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
