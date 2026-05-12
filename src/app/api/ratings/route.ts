import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { albums, ratings, users } from "~/server/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { album, rating } = body;

    if (!album || typeof rating !== "number") {
      return NextResponse.json({ error: "Missing album or rating" }, { status: 400 });
    }

    // 1. Отримуємо токен з кук
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_at")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Отримуємо користувача прямо через fetch (без spotifyApi)
    const userRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: "Spotify auth failed" }, { status: 401 });
    }

    const spotifyUser = await userRes.json();
    const spotifyId = spotifyUser.id;

    // 3. Перевіряємо користувача в нашій БД
    const user = await db
      .select()
      .from(users)
      .where(eq(users.spotifyId, spotifyId))
      .limit(1);

    if (!user[0]) {
      return NextResponse.json({ error: "User not synced" }, { status: 401 });
    }

    // 4. Оновлюємо/створюємо альбом
    await db
      .insert(albums)
      .values({
        spotifyId: album.id,
        title: album.title,
        artist: album.artist,
        artistSpotifyId: album.artistId,
        image: album.cover,
        releaseDate: album.year,
      })
      .onConflictDoUpdate({
        target: albums.spotifyId,
        set: {
          title: album.title,
          artist: album.artist,
          image: album.cover,
          releaseDate: album.year,
        },
      });

    // 5. Оновлюємо рейтинг
    const existingRating = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.userSpotifyId, spotifyId),
          eq(ratings.albumSpotifyId, album.id),
        ),
      )
      .limit(1);

    if (existingRating.length === 0) {
      await db.insert(ratings).values({
        id: crypto.randomUUID(),
        userSpotifyId: spotifyId,
        albumSpotifyId: album.id,
        rating,
      });
    } else {
      await db
        .update(ratings)
        .set({
          rating,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(ratings.userSpotifyId, spotifyId),
            eq(ratings.albumSpotifyId, album.id),
          ),
        );
    }

    return NextResponse.json({ success: true, rating });
  } catch (err) {
    console.error("RATING ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}