import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const spotifyRes = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!spotifyRes.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const spotifyUser = await spotifyRes.json();

    const user = await db
      .select()
      .from(users)
      .where(eq(users.spotifyId, spotifyUser.id))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (err) {
    console.error("ME ERROR:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}