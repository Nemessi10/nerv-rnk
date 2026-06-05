import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { albumCustomMetadata } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: albumId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("spotify_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      customGenre?: string;
      customSubgenres?: string[];
      moods?: string[];
    };

    const [existing] = await db
      .select()
      .from(albumCustomMetadata)
      .where(
        and(
          eq(albumCustomMetadata.userSpotifyId, userId),
          eq(albumCustomMetadata.albumSpotifyId, albumId),
        ),
      );

    if (existing) {
      await db
        .update(albumCustomMetadata)
        .set({
          customGenre: body.customGenre ?? existing.customGenre,
          customSubgenres: body.customSubgenres ?? existing.customSubgenres,
          moods: body.moods ?? existing.moods,
          updatedAt: new Date(),
        })
        .where(eq(albumCustomMetadata.id, existing.id));
    } else {
      await db.insert(albumCustomMetadata).values({
        id: crypto.randomUUID(),
        userSpotifyId: userId,
        albumSpotifyId: albumId,
        customGenre: body.customGenre ?? null,
        customSubgenres: body.customSubgenres ?? [],
        moods: body.moods ?? [],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update album metadata override:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
