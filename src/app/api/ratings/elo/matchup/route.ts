import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { albums, ratings } from "~/server/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("spotify_user_id")?.value;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "discovery";
  const excludeParam = searchParams.get("exclude") ?? "";

  const excludedPairs = new Set(excludeParam.split(",").filter(Boolean));

  try {
    const userPool = await db
      .select({
        id: albums.spotifyId,
        title: albums.title,
        artist: albums.artist,
        cover: albums.image,
        year: albums.releaseDate,
        elo: ratings.eloRating,
        matchesCount: ratings.matchesCount,
        rating: ratings.rating,
      })
      .from(albums)
      .leftJoin(
        ratings,
        and(
          eq(ratings.albumSpotifyId, albums.spotifyId),
          eq(ratings.userSpotifyId, userId),
        ),
      );

    if (userPool.length < 2) {
      return NextResponse.json(
        { error: "At least 2 albums are required in the system" },
        { status: 400 },
      );
    }

    let albumA: (typeof userPool)[0] | undefined;
    let albumB: (typeof userPool)[0] | undefined;

    const isAlbumExcluded = (id: string) => {
      return excludedPairs.has(id);
    };

    if (mode === "discovery") {
      const sortedByMatches = [...userPool].sort(
        (a, b) => (a.matchesCount ?? 0) - (b.matchesCount ?? 0),
      );

      for (const candidateA of sortedByMatches) {
        let potentialOpponents = userPool.filter(
          (item) => item.id !== candidateA.id,
        );

        const calibrated = potentialOpponents.filter(
          (item) => (item.matchesCount ?? 0) >= 5,
        );
        if (calibrated.length >= 1) {
          potentialOpponents = calibrated;
        }

        potentialOpponents.sort(() => Math.random() - 0.5);
        const candidateB = potentialOpponents.find(
          (opp) => !isAlbumExcluded(candidateA.id) && !isAlbumExcluded(opp.id),
        );

        if (candidateB) {
          albumA = candidateA;
          albumB = candidateB;
          break;
        }
      }
    }

    else if (mode === "sbmm") {
      const shuffledA = [...userPool].sort(() => Math.random() - 0.5);

      for (const candidateA of shuffledA) {
        const eloA = candidateA.elo ?? 1000;
        const opponents = userPool
          .filter((item) => item.id !== candidateA.id)
          .map((item) => ({
            ...item,
            diff: Math.abs((item.elo ?? 1000) - eloA),
          }))
          .sort((a, b) => a.diff - b.diff);

          const candidateB = opponents.find(
            (opp) => !isAlbumExcluded(candidateA.id) && !isAlbumExcluded(opp.id),
          );

        if (candidateB) {
          albumA = candidateA;
          albumB = candidateB;
          break;
        }
      }
    }

    else if (mode === "discrepancy") {
      const withDiscrepancy = userPool
        .filter((item) => typeof item.rating === "number")
        .map((item) => {
          const expectedElo = item.rating! * 150;
          const currentElo = item.elo ?? 1000;
          return { ...item, discrepancy: Math.abs(expectedElo - currentElo) };
        })
        .sort((a, b) => b.discrepancy - a.discrepancy);

      const sortedByElo = [...userPool].sort(
        (a, b) => (b.elo ?? 1000) - (a.elo ?? 1000),
      );
      const top20Count = Math.max(1, Math.floor(sortedByElo.length * 0.2));
      const top20PercentAlbums = sortedByElo.slice(0, top20Count);

      for (const candidateA of withDiscrepancy) {
        let examiners = top20PercentAlbums.filter(
          (item) => item.id !== candidateA.id,
        );
        if (examiners.length === 0) {
          examiners = userPool.filter((item) => item.id !== candidateA.id);
        }

        examiners.sort(() => Math.random() - 0.5);
        const candidateB = examiners.find(
          (opp) => !isAlbumExcluded(candidateA.id) && !isAlbumExcluded(opp.id),
        );

        if (candidateB) {
          albumA = candidateA;
          albumB = candidateB;
          break;
        }
      }
    }

    if (!albumA || !albumB) {
      const fallback = [...userPool].sort(() => Math.random() - 0.5);
      albumA = fallback[0];
      albumB = fallback[1];
    }

    const formattedResult = [albumA, albumB].map((album) => ({
      id: album!.id,
      title: album!.title,
      artist: album!.artist,
      cover: album!.cover ?? "",
      year: album!.year ? album!.year.slice(0, 4) : "—",
      elo: album!.elo ?? 1000,
    }));

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Matchup Error:", error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
