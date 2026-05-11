"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatDuration, formatAlbumDuration } from "~/lib/utils";

import { ArrowLeft, Edit, Heart, Share2, Star } from "lucide-react";

import { spotifyApi } from "~/lib/spotify/spotify-api";

type Track = {
  id: string;
  title: string;
  durationMs: number;
};

type AlbumDetails = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  year: string;
  genre: string;
  subgenres: string[];
  tracks: Track[];
  totalTracks: number;
  rating?: number;
  eloRating?: number;
  moods?: string[];
};

export default function AlbumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    spotifyApi
      .getAlbumDetails(params.id)
      .then((data) => {
        if (isMounted) setAlbum(data as any);
      })
      .catch((err) => {
        console.error("Failed to load album:", err);
        if (isMounted) setError("Failed to load album");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading album...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
        <Button className="mt-4" onClick={() => router.push("/library")}>
          Back to Library
        </Button>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-6 text-muted-foreground">No album data available</div>
    );
  }

  const totalDuration = album.tracks.reduce(
    (sum, track) => sum + track.durationMs,
    0,
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* BACK */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/library">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr] xl:grid-cols-[485px_1fr]">
        {/* LEFT */}
        <div className="h-fit space-y-4 lg:sticky lg:top-8">
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={album.cover}
              alt={album.title}
              width={500}
              height={500}
              className="aspect-square w-full object-cover"
            />
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? "fill-destructive text-destructive" : ""
              }`}
            />
            {isFavorite ? "Favorited" : "Add to Favorites"}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* HEADER */}
          <div>
            <h1 className="text-3xl font-bold">{album.title}</h1>

            <div className="flex items-center gap-2 text-muted-foreground">
              <p>{album.artist}</p>
              <span>•</span>
              <p>{album.year}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="capitalize">{album.genre}</Badge>

              {album.subgenres?.map((s) => (
                <Badge key={s} variant="outline" className="capitalize">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* TABS */}
          <Tabs defaultValue="tracks">
            <TabsList>
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              {/* <TabsTrigger value="about">About</TabsTrigger> */}
            </TabsList>

            {/* TRACKLIST */}
            <TabsContent value="tracks" className="space-y-2 pt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="mb-3 flex justify-between text-sm text-muted-foreground">
                    <span>{album.totalTracks} tracks</span>
                    <p>
                      {formatAlbumDuration(
                        album.tracks.reduce(
                          (sum, track) => sum + track.durationMs,
                          0,
                        ),
                      )}
                    </p>
                  </div>

                  <Separator className="mb-3" />

                  <div className="space-y-2">
                    {album.tracks.map((track, index) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-sm text-muted-foreground">
                            {index + 1}
                          </span>

                          <span className="text-sm">{track.title}</span>
                        </div>

                        <span className="text-xs text-muted-foreground">
                          {formatDuration(track.durationMs)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RATINGS */}
            <TabsContent value="ratings" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold">
                      {album.rating ?? "—"}
                    </div>
                    <p className="text-sm text-muted-foreground">Your Rating</p>
                    <Star className="mx-auto mt-2 h-4 w-4 fill-primary text-primary" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold">
                      {album.eloRating ?? "—"}
                    </div>
                    <p className="text-sm text-muted-foreground">Elo Rating</p>
                  </CardContent>
                </Card>
              </div>

              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Rate Album
              </Button>
            </TabsContent>

            {/* ABOUT */}
            {/* <TabsContent value="about" className="space-y-3 pt-4">
              <p className="text-muted-foreground">
                Spotify metadata-based album view with Last.fm genre enrichment.
              </p>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
