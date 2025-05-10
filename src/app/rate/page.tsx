"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

// Mock data for albums to rate
const albumsToRate = [
  {
    id: 1,
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    cover: "/placeholder.svg?height=400&width=400",
    year: 1973,
    genre: "Progressive Rock",
  },
  {
    id: 2,
    title: "OK Computer",
    artist: "Radiohead",
    cover: "/placeholder.svg?height=400&width=400",
    year: 1997,
    genre: "Alternative Rock",
  },
  {
    id: 3,
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    cover: "/placeholder.svg?height=400&width=400",
    year: 2015,
    genre: "Hip Hop",
  },
  {
    id: 4,
    title: "Kid A",
    artist: "Radiohead",
    cover: "/placeholder.svg?height=400&width=400",
    year: 2000,
    genre: "Electronic",
  },
];

export default function RatePage() {
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0);
  const [currentEloIndex, setCurrentEloIndex] = useState(0);

  const handlePrevAlbum = () => {
    setCurrentAlbumIndex((prev) =>
      prev > 0 ? prev - 1 : albumsToRate.length - 1,
    );
    setCurrentRating(0);
  };

  const handleNextAlbum = () => {
    setCurrentAlbumIndex((prev) =>
      prev < albumsToRate.length - 1 ? prev + 1 : 0,
    );
    setCurrentRating(0);
  };

  const handlePrevElo = () => {
    setCurrentEloIndex((prev) =>
      prev > 0 ? prev - 1 : Math.floor(albumsToRate.length / 2) - 1,
    );
  };

  const handleNextElo = () => {
    setCurrentEloIndex((prev) =>
      prev < Math.floor(albumsToRate.length / 2) - 1 ? prev + 1 : 0,
    );
  };

  const currentAlbum = albumsToRate[currentAlbumIndex];
  const eloAlbum1 = albumsToRate[currentEloIndex * 2];
  const eloAlbum2 = albumsToRate[currentEloIndex * 2 + 1];

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Albums</h1>
          <p className="text-muted-foreground">
            Rate albums to build your personal music profile
          </p>
        </div>
      </div>

      <Tabs defaultValue="classic" className="mb-4">
        <TabsList className="tab-no-border grid w-full grid-cols-2 bg-secondary/30">
          <TabsTrigger
            value="classic"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Classic Rating
          </TabsTrigger>
          <TabsTrigger
            value="elo"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Elo Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classic" className="mt-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-start md:gap-6 lg:gap-8">
              <div className="mb-4 md:mb-0 md:flex-1">
                <Card className="card-no-border glow-primary overflow-hidden bg-card">
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={currentAlbum.cover || "/placeholder.svg"}
                      alt={currentAlbum.title}
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={handlePrevAlbum}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={handleNextAlbum}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="md:w-[370px]">
                <Card className="card-no-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1">
                      {currentAlbum.title}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {currentAlbum.artist}
                      </span>
                      <Badge variant="outline" className="border-0">
                        {currentAlbum.genre}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Your Rating
                          </span>
                          <span className="text-2xl font-bold text-accent">
                            {currentRating ? currentRating.toFixed(1) : "-"}
                          </span>
                        </div>
                        <div className="flex flex-wrap justify-center py-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                            <button
                              key={rating}
                              className="p-1"
                              onMouseEnter={() => setHoverRating(rating)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setCurrentRating(rating)}
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  (
                                    hoverRating
                                      ? rating <= hoverRating
                                      : rating <= currentRating
                                  )
                                    ? "fill-accent text-accent"
                                    : "text-muted-foreground"
                                } transition-all`}
                              />
                            </button>
                          ))}
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={currentRating}
                          onChange={(e) =>
                            setCurrentRating(Number.parseFloat(e.target.value))
                          }
                          className="rating-slider h-2 w-full appearance-none rounded-full bg-secondary/30"
                        />
                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>5</span>
                          <span>10</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={handlePrevAlbum}
                          className="btn-no-border hover:bg-secondary/20"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          onClick={handleNextAlbum}
                          className="btn-no-border bg-accent hover:bg-accent/90"
                        >
                          Next
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 hover:text-primary"
                      asChild
                    >
                      <Link href={`/album/${currentAlbum.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="btn-no-border hover:bg-secondary/20"
                    >
                      Skip
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="elo" className="mt-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 text-center">
              <p className="text-lg font-medium">Which album do you prefer?</p>
              <p className="text-sm text-muted-foreground">
                This helps build your personalized Elo rating system
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="card-no-border glow-primary overflow-hidden bg-card transition-all hover:ring-2 hover:ring-primary">
                <button className="w-full text-left" onClick={handlePrevElo}>
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={eloAlbum1.cover || "/placeholder.svg"}
                      alt={eloAlbum1.title}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition-all hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-medium">{eloAlbum1.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {eloAlbum1.artist}
                      </span>
                      <Badge variant="outline" className="border-0">
                        {eloAlbum1.genre}
                      </Badge>
                    </div>
                  </CardContent>
                </button>
              </Card>

              <Card className="card-no-border glow-accent overflow-hidden bg-card transition-all hover:ring-2 hover:ring-accent">
                <button className="w-full text-left" onClick={handleNextElo}>
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={eloAlbum2.cover || "/placeholder.svg"}
                      alt={eloAlbum2.title}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition-all hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-medium">{eloAlbum2.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {eloAlbum2.artist}
                      </span>
                      <Badge variant="outline" className="border-0">
                        {eloAlbum2.genre}
                      </Badge>
                    </div>
                  </CardContent>
                </button>
              </Card>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={handlePrevElo}
                className="btn-no-border hover:bg-secondary/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Pair
              </Button>
              <Button
                variant="outline"
                onClick={handleNextElo}
                className="btn-no-border hover:bg-secondary/20"
              >
                Next Pair
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
