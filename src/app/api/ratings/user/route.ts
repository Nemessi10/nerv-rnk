import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { albums, ratings, albumCustomMetadata } from "~/server/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("spotify_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userLibrary = await db
      .select({
        id: albums.spotifyId,
        title: albums.title,
        artist: albums.artist,
        cover: albums.image,
        systemGenre: albums.genre,
        systemSubgenres: albums.subgenres,
        year: albums.releaseDate,
        spotifyAddedAt: albums.spotifyAddedAt,
        lastPlayedAt: albums.lastPlayedAt,
        rating: ratings.rating,
        eloRating: ratings.eloRating,
        customGenre: albumCustomMetadata.customGenre,
        customSubgenres: albumCustomMetadata.customSubgenres,
        moods: albumCustomMetadata.moods,
      })
      .from(albums)
      .leftJoin(
        ratings,
        and(
          eq(ratings.albumSpotifyId, albums.spotifyId),
          eq(ratings.userSpotifyId, userId),
        ),
      )
      .leftJoin(
        albumCustomMetadata,
        and(
          eq(albumCustomMetadata.albumSpotifyId, albums.spotifyId),
          eq(albumCustomMetadata.userSpotifyId, userId),
        ),
      );

    const formattedAlbums = userLibrary.map((row) => {
      return {
        id: row.id,
        title: row.title,
        artist: row.artist,
        cover: row.cover,
        year: row.year,
        spotifyAddedAt: row.spotifyAddedAt
          ? new Date(row.spotifyAddedAt).toISOString()
          : null,
        lastPlayedAt: row.lastPlayedAt
          ? new Date(row.lastPlayedAt).toISOString()
          : null,
        rating: row.rating ?? undefined,
        eloRating: row.eloRating ?? 1000,
        genre: row.customGenre ?? row.systemGenre ?? "Unknown",
        subgenres:
          row.customSubgenres && row.customSubgenres.length > 0
            ? row.customSubgenres
            : (row.systemSubgenres ?? []),
        moods: row.moods ?? [],
      };
    });

    return NextResponse.json(formattedAlbums);
  } catch (err) {
    console.error("Fetch user library error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
