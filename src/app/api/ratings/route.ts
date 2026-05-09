import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { ratings, albums, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { album, rating, spotifyId } = await req.json();

    if (!album || !rating || !spotifyId) {
      return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
    }

    const spotifyRes = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: req.headers.get("authorization")!,
      },
    });

    const spotifyUser = await spotifyRes.json();

    const user = await db
      .select()
      .from(users)
      .where(eq(users.spotifyId, spotifyUser.id))
      .limit(1);

    if (!user[0]) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    let existingAlbum = await db
      .select()
      .from(albums)
      .where(eq(albums.spotifyId, spotifyId))
      .limit(1);

    let albumId = existingAlbum[0]?.id;

    if (!albumId) {
      albumId = randomUUID();

      await db.insert(albums).values({
        id: albumId,
        spotifyId,
        title: album.title,
        artist: album.artist,
        image: album.image,
      });
    }

    await db.insert(ratings).values({
      id: randomUUID(),
      userId: user[0].id,
      albumId,
      rating,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("RATING ERROR:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}