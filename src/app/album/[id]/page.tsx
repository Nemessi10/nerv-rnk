"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeft, Clock, Edit, Heart, Share2, Star } from "lucide-react";

// Mock album data
const album = {
  id: 1,
  title: "The Dark Side of the Moon",
  artist: "Pink Floyd",
  cover: "/placeholder.svg?height=500&width=500",
  year: 1973,
  genre: "Progressive Rock",
  subgenre: "Space Rock",
  moods: ["Introspective", "Atmospheric", "Melancholic"],
  rating: 9.2,
  eloRating: 1850,
  dynamicRating: 9.4,
  tracks: [
    { title: "Speak to Me", duration: "1:30" },
    { title: "Breathe (In the Air)", duration: "2:43" },
    { title: "On the Run", duration: "3:30" },
    { title: "Time", duration: "7:06" },
    { title: "The Great Gig in the Sky", duration: "4:43" },
    { title: "Money", duration: "6:30" },
    { title: "Us and Them", duration: "7:49" },
    { title: "Any Colour You Like", duration: "3:26" },
    { title: "Brain Damage", duration: "3:49" },
    { title: "Eclipse", duration: "2:03" },
  ],
  description:
    "The Dark Side of the Moon is the eighth studio album by English rock band Pink Floyd, released on 1 March 1973. The album built on ideas explored in Pink Floyd's earlier recordings and performances, but without the extended instrumentals that characterised their earlier work.",
  ratingHistory: [
    { date: "2021-05-15", rating: 9.0 },
    { date: "2022-01-10", rating: 9.2 },
    { date: "2023-03-01", rating: 9.2 },
  ],
};

export default function AlbumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/library">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg">
              <Image
                src={album.cover || "/placeholder.svg"}
                alt={album.title}
                width={500}
                height={500}
                className="h-auto w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {album.moods.map((mood) => (
                <Badge key={mood} variant="outline" className="genre-tag">
                  {mood}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`}
                />
                {isFavorite ? "Favorited" : "Add to Favorites"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {album.title}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xl text-muted-foreground">{album.artist}</p>
                <span className="text-muted-foreground">•</span>
                <p className="text-muted-foreground">{album.year}</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary">{album.genre}</Badge>
                <Badge variant="outline">{album.subgenre}</Badge>
              </div>
            </div>

            <Tabs defaultValue="ratings">
              <TabsList>
                <TabsTrigger value="ratings">Ratings</TabsTrigger>
                <TabsTrigger value="tracklist">Tracklist</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              <TabsContent value="ratings" className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="text-4xl font-bold text-primary">
                        {album.rating}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Classic Rating
                      </p>
                      <div className="mt-2 flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4 fill-primary text-primary"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="text-4xl font-bold text-primary">
                        {album.eloRating}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Elo Rating
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Top 5% of your library
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="text-4xl font-bold text-primary">
                        {album.dynamicRating}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Dynamic Rating
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Based on your preferences
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h3 className="mb-2 text-lg font-medium">Rating History</h3>
                  <div className="space-y-2">
                    {album.ratingHistory.map((history, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <span className="text-sm">
                          {new Date(history.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="font-medium">{history.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Button className="gap-2">
                    <Edit className="h-4 w-4" />
                    Update Rating
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="tracklist" className="space-y-4 pt-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-3 font-medium">
                    <div>Title</div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Duration</span>
                    </div>
                  </div>
                  <Separator />
                  {album.tracks.map((track, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_auto] gap-4 p-3 hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {index + 1}
                        </span>
                        <span>{track.title}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {track.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <p className="leading-relaxed">{album.description}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-medium">Album Info</h3>
                      <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                        <dt className="text-muted-foreground">Artist</dt>
                        <dd>{album.artist}</dd>
                        <dt className="text-muted-foreground">Release Year</dt>
                        <dd>{album.year}</dd>
                        <dt className="text-muted-foreground">Genre</dt>
                        <dd>{album.genre}</dd>
                        <dt className="text-muted-foreground">Subgenre</dt>
                        <dd>{album.subgenre}</dd>
                      </dl>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-medium">Your Stats</h3>
                      <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                        <dt className="text-muted-foreground">First Rated</dt>
                        <dd>
                          {new Date(
                            album.ratingHistory[0].date,
                          ).toLocaleDateString()}
                        </dd>
                        <dt className="text-muted-foreground">Times Rated</dt>
                        <dd>{album.ratingHistory.length}</dd>
                        <dt className="text-muted-foreground">
                          Current Rating
                        </dt>
                        <dd className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span>{album.rating}</span>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
