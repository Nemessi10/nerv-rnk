import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { albums, ratings } from "~/server/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("spotify_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Беремо всі альбоми та приєднуємо класичний рейтинг
    const userLibrary = await db
      .select({
        id: albums.spotifyId,
        title: albums.title,
        artist: albums.artist,
        cover: albums.image,
        year: albums.releaseDate,
        rating: ratings.rating,
        eloRating: ratings.eloRating,
      })
      .from(albums)
      .leftJoin(
        ratings,
        and(
          eq(ratings.albumSpotifyId, albums.spotifyId),
          eq(ratings.userSpotifyId, userId)
        )
      );

    return NextResponse.json(userLibrary);
  } catch (err) {
    console.error("Fetch user library error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}