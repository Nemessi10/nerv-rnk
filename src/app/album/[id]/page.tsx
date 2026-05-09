"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import {
  ArrowLeft,
  Clock,
  Edit,
  Heart,
  Share2,
  Star,
} from "lucide-react";

import { useSpotifyLibrary } from "~/hooks/use-spotify-library";

export default function AlbumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { albums, loading } = useSpotifyLibrary();

  const [isFavorite, setIsFavorite] = useState(false);

  const album = useMemo(() => {
    return albums.find((a) => String(a.id) === params.id);
  }, [albums, params.id]);

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading album...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Album not found</p>
        <Button className="mt-4" onClick={() => router.push("/library")}>
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* BACK */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="mb-4"
      >
        <Link href="/library">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* LEFT SIDE */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg">
            <Image
              src={album.cover}
              alt={album.title}
              width={500}
              height={500}
              className="h-auto w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(album.moods ?? []).map((mood) => (
              <Badge key={mood} variant="outline">
                {mood}
              </Badge>
            ))}
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

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* HEADER */}
          <div>
            <h1 className="text-3xl font-bold">{album.title}</h1>

            <div className="flex items-center gap-2 text-muted-foreground">
              <p>{album.artist}</p>
              <span>•</span>
              <p>{album.year}</p>
            </div>

            <div className="mt-2 flex gap-2">
              <Badge>{album.genre}</Badge>
              <Badge variant="outline">{album.subgenre}</Badge>
            </div>
          </div>

          {/* TABS */}
          <Tabs defaultValue="ratings">
            <TabsList>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            {/* RATINGS */}
            <TabsContent value="ratings" className="pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold">
                      {album.rating ?? "—"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your Rating
                    </p>

                    <div className="mt-2 flex justify-center">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold">
                      {album.eloRating ?? "—"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Elo Rating
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Rate Album
              </Button>
            </TabsContent>

            {/* ABOUT */}
            <TabsContent value="about" className="pt-4 space-y-4">
              <p className="text-muted-foreground">
                No description available yet. (Will come from Spotify or DB later)
              </p>

              <div className="text-sm text-muted-foreground">
                <p>Genre: {album.genre}</p>
                <p>Subgenre: {album.subgenre}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}