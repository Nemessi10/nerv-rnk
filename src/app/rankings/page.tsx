"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  Star,
  Loader2,
  ChevronUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { useSpotifyLibrary } from "~/hooks/use-spotify-library";

export default function RankingsPage() {
  const { albums, loading } = useSpotifyLibrary();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"eloRating" | "rating">("eloRating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [expandedGenres, setExpandedGenres] = useState<Record<string, boolean>>(
    {},
  );

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const hasClassicRating = typeof album.rating === "number";
      const hasEloMatches =
        album.eloRating !== null && album.eloRating !== 1000;
      if (!hasClassicRating && !hasEloMatches) return false;

      return (
        searchQuery === "" ||
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [albums, searchQuery]);

  const ratedGenres = useMemo(() => {
    return [
      ...new Set(
        albums
          .filter(
            (a) =>
              typeof a.rating === "number" ||
              (a.eloRating && a.eloRating !== 1000),
          )
          .map((a) => a.genre)
          .filter(Boolean),
      ),
    ] as string[];
  }, [albums]);

  const sortedAlbums = useMemo(() => {
    const sorted = [...filteredAlbums];

    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "rating") {
        comparison = (a.rating ?? 0) - (b.rating ?? 0);
      } else if (sortBy === "eloRating") {
        comparison = (a.eloRating ?? 1000) - (b.eloRating ?? 1000);
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return sorted;
  }, [filteredAlbums, sortBy, sortOrder]);

  const albumsByGenre = useMemo(() => {
    return ratedGenres
      .map((genre) => {
        const genreAlbums = albums.filter(
          (album) =>
            album.genre === genre &&
            (typeof album.rating === "number" ||
              (album.eloRating && album.eloRating !== 1000)),
        );

        const allSortedGenreAlbums = [...genreAlbums].sort(
          (a, b) =>
            (b.eloRating ?? 1000) - (a.eloRating ?? 1000) ||
            (b.rating ?? 0) - (a.rating ?? 0),
        );

        const ratedAlbumsInGenre = genreAlbums.filter(
          (a) => typeof a.rating === "number",
        );
        const avgRating =
          ratedAlbumsInGenre.length > 0
            ? ratedAlbumsInGenre.reduce(
                (sum, album) => sum + (album.rating ?? 0),
                0,
              ) / ratedAlbumsInGenre.length
            : 0;

        return {
          genre,
          albumCount: genreAlbums.length,
          avgRating: avgRating > 0 ? avgRating.toFixed(1) : "—",
          allAlbums: allSortedGenreAlbums,
        };
      })
      .sort((a, b) => b.albumCount - a.albumCount);
  }, [albums, ratedGenres]);

  const toggleGenreExpand = (genre: string) => {
    setExpandedGenres((prev) => ({ ...prev, [genre]: !prev[genre] }));
  };

  if (loading && albums.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Rankings</h1>
        <p className="text-muted-foreground">
          View your global music leaderboard and charts
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Rankings</TabsTrigger>
          <TabsTrigger value="genres">By Genre</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search charts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>
                      Sort: {sortBy === "eloRating" ? "Elo" : "Classic Rating"}{" "}
                      {sortOrder === "desc" ? "(Highest)" : "(Lowest)"}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("eloRating");
                      setSortOrder("desc");
                    }}
                  >
                    Elo Rating (Highest to Lowest)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("eloRating");
                      setSortOrder("asc");
                    }}
                  >
                    Elo Rating (Lowest to Highest)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("rating");
                      setSortOrder("desc");
                    }}
                  >
                    Classic Rating (Highest to Lowest)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("rating");
                      setSortOrder("asc");
                    }}
                  >
                    Classic Rating (Lowest to Highest)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Album</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-center">Elo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAlbums.map((album, index) => (
                  <TableRow
                    key={album.id}
                    className="transition-colors hover:bg-secondary/40"
                  >
                    <TableCell className="text-center text-base font-bold text-muted-foreground/80">
                      #{index + 1}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                        <Image
                          src={album.cover || "/placeholder.svg"}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-base font-bold">
                      <Link
                        href={`/album/${album.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {album.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {album.artist}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {album.year ? album.year.slice(0, 4) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-bold uppercase tracking-wider"
                      >
                        {album.genre ?? "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {typeof album.rating === "number" ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span>{album.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-black text-primary">
                      {album.eloRating ?? 1000}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="genres" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albumsByGenre.map((genreData) => {
              const isExpanded = expandedGenres[genreData.genre] ?? false;
              const visibleAlbums = isExpanded
                ? genreData.allAlbums
                : genreData.allAlbums.slice(0, 3);

              return (
                <Card
                  key={genreData.genre}
                  className="flex h-fit flex-col justify-between overflow-hidden transition-all hover:border-primary/20"
                >
                  <div>
                    <div className="border-b bg-secondary/10 p-4">
                      <h3 className="text-xl font-black uppercase tracking-tight text-card-foreground">
                        {genreData.genre}
                      </h3>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {genreData.albumCount} ranked album
                          {genreData.albumCount !== 1 ? "s" : ""}
                        </span>
                        <div className="flex items-center gap-1 rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-xs font-bold text-primary">
                            {genreData.avgRating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[450px] divide-y overflow-y-auto">
                      {visibleAlbums.map((album, idx) => (
                        <Link
                          key={album.id}
                          href={`/album/${album.id}`}
                          className="flex items-center gap-3 p-3 transition-colors hover:bg-secondary/30"
                        >
                          <span className="w-4 text-center text-xs font-bold text-muted-foreground/40">
                            {idx + 1}
                          </span>
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                            <Image
                              src={album.cover || "/placeholder.svg"}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-card-foreground">
                              {album.title}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {album.artist}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-xs font-black text-primary">
                              {album.eloRating ?? 1000}
                            </span>
                            {typeof album.rating === "number" && (
                              <span className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
                                ★ {album.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {genreData.allAlbums.length > 3 && (
                    <div className="border-t bg-secondary/5 p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
                        onClick={() => toggleGenreExpand(genreData.genre)}
                      >
                        {isExpanded ? (
                          <>
                            Show Less <ChevronUp className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            Show All ({genreData.allAlbums.length}){" "}
                            <ChevronDown className="h-3 w-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
