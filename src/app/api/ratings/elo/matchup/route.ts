import { NextResponse } from "next/server";
import { eq, sql, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { albums, ratings } from "~/server/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("spotify_user_id")?.value;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const matchup = await db
      .select({
        id: albums.spotifyId,
        title: albums.title,
        artist: albums.artist,
        cover: albums.image,
        year: albums.releaseDate,
        elo: ratings.eloRating,
      })
      .from(albums)
      .leftJoin(
        ratings,
        and(
          eq(ratings.albumSpotifyId, albums.spotifyId),
          eq(ratings.userSpotifyId, userId),
        ),
      )
      .orderBy(sql`RANDOM()`)
      .limit(2);

    const formattedMatchup = matchup.map((album) => ({
      id: album.id,
      title: album.title,
      artist: album.artist,
      cover: album.cover ?? "",
      year: album.year ? album.year.slice(0, 4) : "—",
      elo: album.elo ?? 1000,
    }));

    return NextResponse.json(formattedMatchup);
  } catch (error) {
    console.error("Matchup Error:", error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
