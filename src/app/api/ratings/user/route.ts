import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { cookies } from "next/headers";
import { ratings } from "~/server/db/schema";
import { spotifyApi } from "~/lib/spotify/spotify-api";

export async function GET(req: NextRequest) {
    try {
      const cookieStore = await cookies();
      const spotifyId = cookieStore.get("spotify_user_id")?.value;
  
      let finalId = spotifyId;
  
      if (!finalId) {
        const userData = await spotifyApi.getCurrentUser();
        finalId = userData.id;
      }
  
      const userRatings = await db
        .select()
        .from(ratings)
        .where(eq(ratings.userSpotifyId, finalId));
  
      return NextResponse.json(userRatings);
    } catch (err) {
      return NextResponse.json([], { status: 200 });
    }
  }