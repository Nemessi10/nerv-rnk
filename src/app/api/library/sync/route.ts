import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { albums } from "~/server/db/schema";

export const dynamic = "force-dynamic";

const SYNC_COOLDOWN = 1000 * 60 * 5; // 5 хвилин кулдауну

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Перевіряємо таймстамп останньої синхронізації з куків
    const lastSync = cookieStore.get("last_library_sync")?.value;
    if (lastSync && Date.now() - Number(lastSync) < SYNC_COOLDOWN) {
      // Якщо 5 хвилин ще не пройшло, віддаємо успіх за 1 мілісекунду
      return NextResponse.json({ success: true, message: "Cooldowned" });
    }

    const token = cookieStore.get("spotify_at")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let allSpotifyAlbums: any[] = [];
    let nextUrl = "https://api.spotify.com/v1/me/albums?limit=50";

    while (nextUrl) {
      const res = await fetch(nextUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return NextResponse.json({ error: "Spotify fetch failed" }, { status: 400 });
      const data = await res.json();
      allSpotifyAlbums = [...allSpotifyAlbums, ...data.items];
      nextUrl = data.next;
    }

    const albumsToInsert = allSpotifyAlbums.map((item: any) => ({
      spotifyId: item.album.id,
      title: item.album.name,
      artist: item.album.artists[0]?.name ?? "Unknown Artist",
      artistSpotifyId: item.album.artists[0]?.id ?? null,
      image: item.album.images[0]?.url ?? null,
      releaseDate: item.album.release_date,
    }));

    if (albumsToInsert.length > 0) {
      await db.insert(albums).values(albumsToInsert).onConflictDoNothing();
    }

    // Встановлюємо куку-маркер на 5 хвилин
    cookieStore.set("last_library_sync", Date.now().toString(), {
      maxAge: 60 * 5, // 5 хвилин
      path: "/",
    });

    return NextResponse.json({ success: true, count: albumsToInsert.length });
  } catch (err) {
    console.error("Library sync error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}