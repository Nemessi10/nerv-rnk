// src/app/api/ratings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { ratings } from "~/server/db/schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id: albumId } = await params;

    const cookieStore = await cookies();
    const userId = cookieStore.get("spotify_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ rating: null, eloRating: 1000 }, { status: 401 });
    }

    const userRating = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.albumSpotifyId, albumId),
          eq(ratings.userSpotifyId, userId)
        )
      )
      .limit(1);

    // Якщо запис існує, віддаємо його дані, якщо ні — дефолтні значення
    return NextResponse.json({ 
      rating: userRating[0]?.rating ?? null,
      eloRating: userRating[0]?.eloRating ?? 1000
    });
  } catch (err) {
    console.error("Classic & Elo rating fetch error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}