import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { ratings } from "~/server/db/schema";

export async function GET(
  req: NextRequest,
  // В Next.js 15 params — це Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 1. Обов'язково чекаємо params
    const { id: albumId } = await params;

    // 2. Обов'язково чекаємо cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_at")?.value;

    if (!token) {
      return NextResponse.json({ rating: null }, { status: 401 });
    }

    const userRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!userRes.ok) return NextResponse.json({ rating: null }, { status: 401 });
    const userData = await userRes.json();

    const userRating = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.albumSpotifyId, albumId),
          eq(ratings.userSpotifyId, userData.id)
        )
      )
      .limit(1);

    return NextResponse.json({ 
      rating: userRating[0]?.rating ?? null 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}