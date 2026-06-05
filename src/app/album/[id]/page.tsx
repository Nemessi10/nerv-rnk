"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatDuration, formatAlbumDuration } from "~/lib/utils";

import {
  ArrowLeft,
  Edit,
  Heart,
  Share2,
  Star,
  Loader2,
  Plus,
  X,
  Smile,
} from "lucide-react";
import { RateAlbumModal } from "~/components/rate-album-modal";
import type { AlbumDetails } from "~/types/album";

interface DBRatingResponse {
  rating: number | null;
  eloRating: number;
  customGenre: string | null;
  customSubgenres: string[];
  moods: string[];
}

export default function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const albumId = unwrappedParams.id;

  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  const [newSubgenre, setNewSubgenre] = useState("");
  const [newMood, setNewMood] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const detailsPromise = fetch(`/api/albums/${albumId}/details`).then(
          (res) => {
            if (!res.ok) throw new Error("API metadata failed");
            return res.json() as Promise<AlbumDetails>;
          },
        );

        const ratingPromise = fetch(`/api/ratings/${albumId}`)
          .then((res) =>
            res.ok ? (res.json() as Promise<DBRatingResponse>) : null,
          )
          .catch(() => null);

        const [albumDetails, ratingData] = await Promise.all([
          detailsPromise,
          ratingPromise,
        ]);

        if (isMounted) {
          if (!albumDetails) {
            setError("Album not found");
            return;
          }

          setAlbum({
            ...albumDetails,
            genre: ratingData?.customGenre ?? albumDetails.genre,
            subgenres:
              ratingData?.customSubgenres &&
              ratingData.customSubgenres.length > 0
                ? ratingData.customSubgenres
                : albumDetails.subgenres,
            moods: ratingData?.moods ?? [],
            rating: ratingData?.rating ?? undefined,
            eloRating: ratingData?.eloRating ?? 1000,
          });
        }
      } catch (err) {
        console.error("Failed to load album:", err);
        if (isMounted) setError("Failed to load album");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [albumId]);

  const handleGenreOverride = async (selectedGenre: string) => {
    if (!album) return;

    const oldMainGenre = album.genre ?? "Unknown";
    const currentSubgenres = album.subgenres ?? [];

    const updatedSubgenres = [oldMainGenre, ...currentSubgenres].filter(
      (g) => g !== selectedGenre,
    );

    try {
      const res = await fetch(`/api/albums/${albumId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customGenre: selectedGenre,
          customSubgenres: updatedSubgenres,
        }),
      });

      if (!res.ok) throw new Error("Override failed");

      setAlbum({
        ...album,
        genre: selectedGenre,
        subgenres: updatedSubgenres,
      });
    } catch (err) {
      console.error("Failed to override genre:", err);
    }
  };

  const handleAddSubgenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubgenre.trim() || !album) return;

    const cleanSubgenre = newSubgenre.trim();
    const currentSubgenres = album.subgenres ?? [];

    if (
      album.genre?.toLowerCase() === cleanSubgenre ||
      currentSubgenres.some((g) => g.toLowerCase() === cleanSubgenre)
    ) {
      setNewSubgenre("");
      return;
    }

    const updatedSubgenres = [...currentSubgenres, newSubgenre.trim()];

    try {
      const res = await fetch(`/api/albums/${albumId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customSubgenres: updatedSubgenres,
        }),
      });

      if (!res.ok) throw new Error("Failed to add subgenre");

      // Оновлюємо стейт, і новий піджанр миттєво з'явиться на екрані як клікабельний бадж
      setAlbum({
        ...album,
        subgenres: updatedSubgenres,
      });
      setNewSubgenre("");
    } catch (err) {
      console.error("Failed to add subgenre:", err);
    }
  };

  const handleAddMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMood.trim() || !album) return;

    const cleanMood = newMood.trim();
    if (album.moods?.includes(cleanMood)) return;

    const updatedMoods = [...(album.moods ?? []), cleanMood];

    try {
      const res = await fetch(`/api/albums/${albumId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moods: updatedMoods }),
      });

      if (!res.ok) throw new Error("Mood save failed");

      setAlbum({ ...album, moods: updatedMoods });
      setNewMood("");
    } catch (err) {
      console.error("Failed to add mood:", err);
    }
  };

  const handleRemoveMood = async (moodToRemove: string) => {
    if (!album) return;
    const updatedMoods = (album.moods ?? []).filter((m) => m !== moodToRemove);

    try {
      const res = await fetch(`/api/albums/${albumId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moods: updatedMoods }),
      });

      if (!res.ok) throw new Error("Mood delete failed");

      setAlbum({ ...album, moods: updatedMoods });
    } catch (err) {
      console.error("Failed to remove mood:", err);
    }
  };

  const totalDurationMs = useMemo(() => {
    if (!album?.tracks) return 0;
    return album.tracks.reduce((sum, t) => sum + t.durationMs, 0);
  }, [album?.tracks]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" /> Loading album details...
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error ?? "No album data available"}</p>
        <Button className="mt-4" onClick={() => router.push("/library")}>
          Back to Library
        </Button>
      </div>
    );
  }

  const handleRatingSuccess = (newRating: number) => {
    setAlbum((prev) => (prev ? { ...prev, rating: newRating } : null));
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/library">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr] xl:grid-cols-[485px_1fr]">
        <div className="h-fit space-y-4 lg:sticky lg:top-8">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-xl">
            <Image
              src={album.cover}
              alt={album.title}
              fill
              sizes="(max-w-1024px) 100vw, 500px"
              className="object-cover"
              priority
            />
          </div>

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
            <h1 className="text-3xl font-bold tracking-tight">{album.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <p>{album.artist}</p>
              <span>•</span>
              <p>{album.year ? album.year.slice(0, 4) : "—"}</p>
            </div>

            {album.genre && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary px-3 py-1 text-sm capitalize shadow-sm hover:bg-primary">
                  {album.genre}
                </Badge>
                {album.subgenres?.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="cursor-pointer capitalize transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    title="Click to make this the main genre"
                    onClick={() => handleGenreOverride(s)}
                  >
                    {s}
                  </Badge>
                ))}
                <form
                  onSubmit={handleAddSubgenre}
                  className="ml-1 inline-flex items-center"
                >
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Add subgenre"
                      value={newSubgenre}
                      onChange={(e) => setNewSubgenre(e.target.value)}
                      className="w-32 rounded-md border border-dashed border-muted-foreground/40 bg-transparent py-0.5 pl-2.5 pr-7 text-xs transition-all placeholder:text-muted-foreground/70 focus:w-40 focus:border-solid focus:border-primary focus:outline-none"
                    />
                    <Plus className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground/60" />
                  </div>
                </form>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Smile className="h-3.5 w-3.5" />
                <span>Moods</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {album.moods?.map((mood) => (
                  <Badge
                    key={mood}
                    variant="secondary"
                    className="gap-1 rounded-md py-1 pl-2.5 pr-1.5 text-xs font-medium shadow-sm"
                  >
                    <span>{mood}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMood(mood)}
                      className="rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}

                <form
                  onSubmit={handleAddMood}
                  className="inline-flex items-center"
                >
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Add mood"
                      value={newMood}
                      onChange={(e) => setNewMood(e.target.value)}
                      className="w-24 rounded-md border border-dashed border-muted-foreground/40 bg-transparent px-2.5 py-1 text-xs transition-all placeholder:text-muted-foreground/70 focus:w-36 focus:border-solid focus:border-primary focus:outline-none"
                    />
                    <Plus className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground/60" />
                  </div>
                </form>
              </div>
            </div>
          </div>

          <Tabs defaultValue="tracks">
            <TabsList>
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="pt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="mb-3 flex justify-between text-sm text-muted-foreground">
                    <span>{album.totalTracks} tracks</span>
                    <p>{formatAlbumDuration(totalDurationMs)}</p>
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

            <TabsContent value="ratings" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold">
                      {album.rating?.toFixed(1) ?? "—"}
                    </div>
                    <p className="text-sm text-muted-foreground">Your Rating</p>
                    <Star
                      className={`mx-auto mt-2 h-4 w-4 ${album.rating ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold">{album.eloRating}</div>
                    <p className="text-sm text-muted-foreground">Elo Rating</p>
                  </CardContent>
                </Card>
              </div>

              <Button
                className="gap-2"
                onClick={() => setIsRateModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
                {album.rating ? "Change Rating" : "Rate Album"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <RateAlbumModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        album={album}
        currentRating={album.rating}
        onSuccess={handleRatingSuccess}
      />
    </div>
  );
}
