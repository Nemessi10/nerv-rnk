import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: "Missing accessToken" }, { status: 400 });
    }

    const spotifyRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!spotifyRes.ok) {
      return NextResponse.json({ error: "Failed to fetch Spotify profile" }, { status: 401 });
    }

    const spotifyUser = await spotifyRes.json();
    const spotifyId = spotifyUser.id;
    const displayName = spotifyUser.display_name;
    
    const avatarUrl = spotifyUser.images && spotifyUser.images.length > 0 
      ? spotifyUser.images[0].url 
      : null;

    const cookieStore = await cookies();
    cookieStore.set("spotify_user_id", spotifyId, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    await db
      .insert(users)
      .values({
        spotifyId,
        displayName,
        avatarUrl,
      })
      .onConflictDoUpdate({
        target: users.spotifyId,
        set: {
          displayName,
          avatarUrl,
        },
      });

    return NextResponse.json({
      success: true,
      spotifyId,
      displayName,
      avatarUrl,
    });
  } catch (err) {
    console.error("SYNC USER ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}