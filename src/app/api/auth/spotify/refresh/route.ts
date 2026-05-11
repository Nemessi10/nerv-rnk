import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Missing refresh_token" },
        { status: 400 },
      );
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
    });

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return NextResponse.json(
        {
          error: "Refresh token failed",
          details: data,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
