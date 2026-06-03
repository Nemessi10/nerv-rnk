import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { ratings, eloMatches } from "~/server/db/schema";
import type { EloVoteRequestBody } from "~/types/auth";

const K_FACTOR = 32;

export async function POST(req: NextRequest) {
  try {
    const { winnerId, loserId } = (await req.json()) as EloVoteRequestBody;
    const cookieStore = await cookies();
    const userId = cookieStore.get("spotify_user_id")?.value;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    type TransactionClient = Parameters<
      Parameters<typeof db.transaction>[0]
    >[0];

    const getOrCreateRating = async (
      tx: TransactionClient,
      albumId: string,
    ) => {
      const [existing] = await tx
        .select()
        .from(ratings)
        .where(
          and(
            eq(ratings.userSpotifyId, userId),
            eq(ratings.albumSpotifyId, albumId),
          ),
        );

      if (existing) return existing;

      const newId = crypto.randomUUID();
      const [inserted] = await tx
        .insert(ratings)
        .values({
          id: newId,
          userSpotifyId: userId,
          albumSpotifyId: albumId,
          rating: null,
          eloRating: 1000,
          matchesCount: 0,
        })
        .returning();

      if (!inserted) {
        throw new Error(
          `Failed to create or upsert rating for album: ${albumId}`,
        );
      }

      return inserted;
    };

    await db.transaction(async (tx) => {
      const winnerData = await getOrCreateRating(tx, winnerId);
      const loserData = await getOrCreateRating(tx, loserId);

      const Ra = winnerData.eloRating;
      const Rb = loserData.eloRating;

      const expectedWinner = 1 / (1 + Math.pow(10, (Rb - Ra) / 400));
      const delta = Math.round(K_FACTOR * (1 - expectedWinner));

      await tx
        .update(ratings)
        .set({
          eloRating: Ra + delta,
          matchesCount: winnerData.matchesCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(ratings.id, winnerData.id));

      await tx
        .update(ratings)
        .set({
          eloRating: Rb - delta,
          matchesCount: loserData.matchesCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(ratings.id, loserData.id));

      await tx.insert(eloMatches).values({
        id: crypto.randomUUID(),
        userSpotifyId: userId,
        winnerId,
        loserId,
        eloDelta: delta,
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}
