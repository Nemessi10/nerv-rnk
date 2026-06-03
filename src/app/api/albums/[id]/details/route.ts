import { NextResponse } from "next/server";
import { spotifyApi } from "~/lib/spotify/spotify-api";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: albumId } = await params;

    if (!albumId) {
      return NextResponse.json({ error: "Missing album ID" }, { status: 400 });
    }

    const albumDetails = await spotifyApi.getAlbumDetails(albumId);

    return NextResponse.json(albumDetails, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch album details from APIs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}