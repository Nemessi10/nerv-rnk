import { NextResponse } from "next/server";
import type {
  RefreshTokenRequestBody,
  SpotifyRefreshResponse,
} from "~/types/auth";

export async function POST(req: Request) {
  try {
    const { refresh_token } = (await req.json()) as RefreshTokenRequestBody;

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

    const data = (await res.json()) as unknown;

    const hasError =
      !res.ok || (data && typeof data === "object" && "error" in data);

    if (hasError) {
      return NextResponse.json(
        {
          error: "Refresh token failed",
          details: data,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(data as SpotifyRefreshResponse);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
