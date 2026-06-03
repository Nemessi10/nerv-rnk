import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { ratings } from "~/server/db/schema";
import { eq, desc, isNotNull, and } from "drizzle-orm";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("spotify_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawRatings = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userSpotifyId, userId), isNotNull(ratings.rating)))
      .orderBy(desc(ratings.createdAt))
      .limit(30);

    const uniqueRatingsMap = new Map<string, (typeof rawRatings)[number]>();

    for (const r of rawRatings) {
      if (r.albumSpotifyId && !uniqueRatingsMap.has(r.albumSpotifyId)) {
        uniqueRatingsMap.set(r.albumSpotifyId, r);
      }
      if (uniqueRatingsMap.size >= 4) break;
    }

    const formattedData = Array.from(uniqueRatingsMap.values()).map((r) => ({
      albumId: r.albumSpotifyId,
      rating: Number(r.rating),
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : String(r.createdAt),
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error("CRITICAL ERROR IN /api/ratings/recent:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
