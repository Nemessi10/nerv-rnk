import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { ratings, albumCustomMetadata } from "~/server/db/schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: albumId } = await params;

    const cookieStore = await cookies();
    const userId = cookieStore.get("spotify_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          rating: null,
          eloRating: 1000,
          customGenre: null,
          customSubgenres: [],
          moods: [],
        },
        { status: 401 },
      );
    }

    const ratingPromise = db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.albumSpotifyId, albumId),
          eq(ratings.userSpotifyId, userId),
        ),
      )
      .limit(1);

    const customMetaPromise = db
      .select()
      .from(albumCustomMetadata)
      .where(
        and(
          eq(albumCustomMetadata.albumSpotifyId, albumId),
          eq(albumCustomMetadata.userSpotifyId, userId),
        ),
      )
      .limit(1);

    const [userRatingResult, customMetaResult] = await Promise.all([
      ratingPromise,
      customMetaPromise,
    ]);

    const userRating = userRatingResult[0];
    const customMeta = customMetaResult[0];


    return NextResponse.json({
      rating: userRating?.rating ?? null,
      eloRating: userRating?.eloRating ?? 1000,

      customGenre: customMeta?.customGenre ?? null,
      customSubgenres: customMeta?.customSubgenres ?? [],
      moods: customMeta?.moods ?? [],
    });
  } catch (err) {
    console.error("User album context fetch error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
