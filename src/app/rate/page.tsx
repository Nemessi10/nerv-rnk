"use client";

import { useState, useMemo, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useSpotifyLibrary } from "~/hooks/use-spotify-library";
import { AppAlbum } from "~/types/album";

export default function RatePage() {
  const { albums, loading, refresh } = useSpotifyLibrary();
  
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Фільтруємо неоцінені альбоми
  const unratedAlbums = useMemo(() => {
    return albums.filter(album => album.rating === undefined || album.rating === null);
  }, [albums]);

  const currentAlbum = unratedAlbums[currentIndex];

  // Скидаємо рейтинг локально при зміні альбому (додаткова страховка)
  useEffect(() => {
    setCurrentRating(0);
    setHoverRating(0);
  }, [currentIndex, currentAlbum?.id]);

  const handleNextAlbum = () => {
    setCurrentIndex((prev) => (prev < unratedAlbums.length - 1 ? prev + 1 : 0));
  };

  const handlePrevAlbum = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : unratedAlbums.length - 1));
  };

  const handleSaveRating = async () => {
    if (!currentAlbum || currentRating === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          album: currentAlbum,
          rating: currentRating,
        }),
      });

      if (res.ok) {
        await refresh();
        // Якщо це був останній альбом у списку, скидаємо індекс на 0
        if (currentIndex >= unratedAlbums.length - 1) {
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      console.error("Failed to save rating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (unratedAlbums.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">No more albums to rate!</h2>
        <p className="text-muted-foreground mt-2">You've rated everything in your library.</p>
        <Button asChild className="mt-6">
          <Link href="/library">Back to Library</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Albums</h1>
          <p className="text-muted-foreground">
            {unratedAlbums.length} albums waiting for your score
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
              {/* LEFT: ALBUM COVER CARD */}
              <div className="mb-4 md:mb-0 md:flex-1">
                <Card className="card-no-border glow-primary overflow-hidden bg-card">
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={currentAlbum.cover || "/placeholder.svg"}
                      alt={currentAlbum.title}
                      fill
                      className="object-cover"
                      priority
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

              {/* RIGHT: RATING CONTROLS */}
              <div className="md:w-[370px]">
                <Card className="card-no-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1">
                      {currentAlbum.title}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm line-clamp-1 flex-1 mr-2">
                        {currentAlbum.artist}
                      </span>
                      <Badge variant="outline" className="border-0 bg-secondary/50">
                        {currentAlbum.genre}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {/* Ключ дозволяє скидати стан всього блоку при зміні альбому */}
                  <CardContent key={currentAlbum.id}>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Your Rating
                          </span>
                          <span className="text-2xl font-bold text-accent">
                            {currentRating > 0 ? currentRating.toFixed(1) : "-"}
                          </span>
                        </div>
                        
                        {/* STAR INTERFACE */}
                        <div className="flex flex-wrap justify-center py-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                            <button
                              key={rating}
                              className="p-1 transition-transform hover:scale-110"
                              onMouseEnter={() => setHoverRating(rating)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setCurrentRating(rating)}
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  (hoverRating || currentRating) >= rating
                                    ? "fill-accent text-accent"
                                    : "text-muted-foreground/30"
                                } transition-all`}
                              />
                            </button>
                          ))}
                        </div>

                        {/* PRECISION SLIDER */}
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={currentRating}
                          onChange={(e) =>
                            setCurrentRating(parseFloat(e.target.value))
                          }
                          className="rating-slider h-2 w-full appearance-none rounded-full bg-secondary/30 accent-accent"
                        />
                        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
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
                          onClick={handleSaveRating}
                          disabled={currentRating === 0 || isSubmitting}
                          className="btn-no-border bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      asChild
                    >
                      <Link href={`/album/${currentAlbum.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextAlbum}
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
           {/* Твоя заглушка для Elo Comparison залишається як була */}
           <div className="flex h-[40vh] items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
              Elo Ranking logic coming soon...
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}