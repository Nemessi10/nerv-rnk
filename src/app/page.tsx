"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Disc3,
  Plus,
  Star,
  TrendingUp,
  Loader2,
  Swords,
  Library,
  Music,
  Trophy,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { useAuth } from "~/hooks/use-auth";
import { useSpotifyLibrary } from "~/hooks/use-spotify-library";
import { useEloMatches } from "~/hooks/use-elo-matches";
import { useRecentRatings } from "~/hooks/use-recent-ratings";

export default function Dashboard() {
  const { isLoggedIn, isLoading, login } = useAuth();
  const { albums, loading: libraryLoading } = useSpotifyLibrary();

  const { recentRatings, loading: recentRatingsLoading } =
    useRecentRatings(isLoggedIn);
  const { matches: eloMatches, loading: matchesLoading } = useEloMatches();

  const userStats = useMemo(() => {
    if (!isLoggedIn || !albums.length) {
      return { total: 0, avg: "0.0", topGenre: "None" };
    }
    const rated = albums.filter((a) => typeof a.rating === "number");
    const avg =
      rated.length > 0
        ? (
            rated.reduce((sum, a) => sum + (a.rating ?? 0), 0) / rated.length
          ).toFixed(1)
        : "0.0";

    const genreCounts: Record<string, number> = {};
    albums.forEach((a) => {
      if (a.genre && a.genre !== "Unknown") {
        genreCounts[a.genre] = (genreCounts[a.genre] ?? 0) + 1;
      }
    });
    const sortedGenres = Object.entries(genreCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const topGenre = sortedGenres[0]?.[0] ?? "None";

    return {
      total: albums.length,
      avg,
      topGenre,
    };
  }, [albums, isLoggedIn]);

  const recentStandardRated = useMemo(() => {
    if (!isLoggedIn || !recentRatings.length || !albums.length) return [];

    const uniqueAlbums = [];
    const seenAlbumIds = new Set<string>();

    for (const ratingItem of recentRatings) {
      if (seenAlbumIds.has(ratingItem.albumId)) continue;

      const foundAlbum = albums.find((a) => a.id === ratingItem.albumId);

      if (foundAlbum) {
        seenAlbumIds.add(ratingItem.albumId);
        uniqueAlbums.push({
          ...foundAlbum,
          rating: ratingItem.rating,
        });
      }
    }

    return uniqueAlbums;
  }, [recentRatings, albums, isLoggedIn]);

  const recentEloRated = useMemo(() => {
    if (!isLoggedIn || !eloMatches.length || !albums.length) return [];

    const recentActiveIds: string[] = [];
    for (const match of eloMatches) {
      if (recentActiveIds.length >= 4) break;
      if (!recentActiveIds.includes(match.winnerId))
        recentActiveIds.push(match.winnerId);
      if (
        recentActiveIds.length < 4 &&
        !recentActiveIds.includes(match.loserId)
      ) {
        recentActiveIds.push(match.loserId);
      }
    }

    return albums.filter((a) => recentActiveIds.includes(a.id)).slice(0, 4);
  }, [eloMatches, albums, isLoggedIn]);

  if (isLoading) {
    return (
      <div className="flex h-[85vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="animate-pulse rounded-2xl bg-primary/10 p-4 text-primary">
            <Disc3 className="h-12 w-12" />
          </div>

          <div className="max-w-2xl space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Welcome to <span className="text-primary">nerv-rnk</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Your personal music universe. Analyze your taste via a 10-point
              scale system and advanced Elo competitive matchups.
            </p>
          </div>

          <Button
            onClick={login}
            size="lg"
            className="gap-3 rounded-xl bg-green-600 px-8 py-6 text-base font-semibold text-white shadow-lg transition-transform hover:bg-green-700 active:scale-95"
          >
            <Music className="h-5 w-5" /> Connect Spotify Profile
          </Button>

          <div className="mt-16 grid w-full gap-6 border-t border-secondary/20 pt-10 text-left sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Library className="h-5 w-5 text-primary" /> Personalized Media
                Library
              </h3>
              <p className="text-sm text-muted-foreground">
                Seamless synchronization with your Spotify library. Critique,
                archive, and manage your full album collection in one place.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Swords className="h-5 w-5 text-accent" /> Gamified Elo Battles
              </h3>
              <p className="text-sm text-muted-foreground">
                Run random 1v1 blind matchups between your favorite albums to
                automatically build an unbiased rating and sort them into skill
                leagues.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your music universe.
          </p>
        </div>
        <Button
          className="gap-2 bg-accent hover:bg-accent/90"
          size="lg"
          asChild
        >
          <Link href="/rate">
            <Plus className="h-4 w-4" /> Rate a new album
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-no-border flex flex-col justify-between bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Your Library</CardTitle>
            <CardDescription>{`You've tracked ${userStats.total} albums so far`}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc3 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Mean Score
                  </p>
                  <p className="text-2xl font-bold">{userStats.avg}</p>
                </div>
              </div>
              <div className="flex max-w-[50%] items-center gap-2">
                <Star className="h-8 w-8 text-accent" />
                <div className="truncate">
                  <p className="text-sm font-medium text-muted-foreground">
                    Top Genre
                  </p>
                  <p className="truncate text-base font-bold">
                    {userStats.topGenre}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              variant="outline"
              className="btn-no-border w-full hover:bg-secondary/20"
              asChild
            >
              <Link href="/library">View Library</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="card-no-border flex flex-col justify-between bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Elo Analytics</CardTitle>
            <CardDescription>Z-Taste distribution statistics</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 text-sm text-muted-foreground">
            Your albums are dynamically grouped into Diamond, Platinum, and Gold
            divisions based on custom 1v1 battle choices.
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              variant="outline"
              className="btn-no-border w-full hover:bg-secondary/20"
              asChild
            >
              <Link href="/analytics">View Elo Battles</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="card-no-border flex flex-col justify-between bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>
              Let us help you pick something to rate
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid gap-2">
              <Button
                variant="secondary"
                className="btn-no-border justify-start gap-2 bg-secondary/50 hover:bg-secondary"
                asChild
              >
                <Link href="/rate">
                  <Swords className="h-4 w-4 text-primary" /> Launch Matchup
                  Arena
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="btn-no-border justify-start gap-2 bg-secondary/50 hover:bg-secondary"
                asChild
              >
                <Link href="/library">
                  <TrendingUp className="h-4 w-4 text-accent" /> Filter Unrated
                  Releases
                </Link>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              variant="outline"
              className="btn-no-border w-full hover:bg-secondary/20"
              asChild
            >
              <Link href="/rate">Go to Rating Page</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10">
        <Tabs defaultValue="standard">
          <div className="flex items-center justify-between border-b border-secondary/20 pb-2">
            <TabsList className="tab-no-border bg-secondary/30">
              <TabsTrigger
                value="standard"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Recent Standard Ratings
              </TabsTrigger>
              <TabsTrigger
                value="elo"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Recent Elo Matchups
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/library">View Full Library</Link>
            </Button>
          </div>

          <TabsContent value="standard" className="mt-6">
            {recentRatingsLoading || libraryLoading ? (
              <div className="flex justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Syncing fresh
                ratings...
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {recentStandardRated.map((album) => (
                  <Link
                    href={`/album/${album.id}`}
                    key={album.id}
                    className="block transition-transform active:scale-[0.99]"
                  >
                    <Card className="card-no-border h-full overflow-hidden border border-secondary/10 bg-card transition-colors hover:bg-muted/30">
                      <div className="flex h-full flex-col justify-between gap-3 p-3">
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                            {album.cover ? (
                              <Image
                                src={album.cover}
                                alt={album.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                No Cover
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-1 text-sm font-bold">
                              {album.title}
                            </h3>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {album.artist}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-secondary/10 pt-2">
                          <Badge
                            variant="outline"
                            className="block max-w-[60%] truncate border-secondary py-0 text-[10px]"
                          >
                            {album.genre ?? "Unknown"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span className="text-xs font-semibold">
                              {album.rating?.toFixed(1) ?? "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
                {recentStandardRated.length === 0 && (
                  <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                    {`You haven't rated any albums via 10-point scale yet.`}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="elo" className="mt-6">
            {matchesLoading || libraryLoading ? (
              <div className="flex justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Syncing battles...
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {recentEloRated.map((album) => (
                  <Link
                    href={`/album/${album.id}`}
                    key={album.id}
                    className="block transition-transform active:scale-[0.99]"
                  >
                    <Card className="card-no-border h-full overflow-hidden border border-secondary/10 bg-card transition-colors hover:bg-muted/30">
                      <div className="flex h-full flex-col justify-between gap-3 p-3">
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                            {album.cover ? (
                              <Image
                                src={album.cover}
                                alt={album.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                No Cover
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-1 text-sm font-bold">
                              {album.title}
                            </h3>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {album.artist}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-secondary/10 pt-2">
                          <Badge
                            variant="outline"
                            className="block max-w-[60%] truncate border-secondary py-0 text-[10px]"
                          >
                            {album.genre ?? "Unknown"}
                          </Badge>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Trophy className="h-3 w-3 fill-amber-500/20" />
                            <span className="text-xs font-bold">
                              {Math.round(album.eloRating ?? 1000)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
                {recentEloRated.length === 0 && (
                  <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                    No competitive battles recorded yet. Launch Matchup Arena to
                    pitch your albums!
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
