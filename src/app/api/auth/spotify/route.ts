import { NextResponse } from "next/server";
import type {
  TokenExchangeRequestBody,
  SpotifyTokenResponse,
} from "~/types/auth";

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

export async function POST(req: Request) {
  try {
    const { code, codeVerifier } =
      (await req.json()) as TokenExchangeRequestBody;

    if (!code || !codeVerifier) {
      return NextResponse.json(
        { error: "Missing code or codeVerifier" },
        { status: 400 },
      );
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    });

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = (await tokenRes.json()) as unknown;

    if (!tokenRes.ok) {
      return NextResponse.json(
        {
          error: "Spotify token exchange failed",
          details: data,
        },
        { status: tokenRes.status },
      );
    }

    return NextResponse.json(data as SpotifyTokenResponse);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
