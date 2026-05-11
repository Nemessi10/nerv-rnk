"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  ChevronDown,
  Filter,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { useSpotifyLibrary } from "~/hooks/use-spotify-library";

export default function LibraryPage() {
  const { albums, loading } = useSpotifyLibrary();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedSubgenre, setSelectedSubgenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const [sortBy, setSortBy] = useState<
    "title" | "artist" | "year" | "added" | "played"
  >("played");

  const genres = useMemo(() => {
    return [...new Set(albums.map((a) => a.genre).filter(Boolean))];
  }, [albums]);

  const subgenres = useMemo(() => {
    return [...new Set(albums.flatMap((a) => a.subgenres ?? []))];
  }, [albums]);

  const moods = useMemo(() => {
    return [...new Set(albums.flatMap((a) => a.moods ?? []))];
  }, [albums]);

  const sortedAndFilteredAlbums = useMemo(() => {
    const filtered = albums.filter((album) => {
      const matchesSearch =
        !searchQuery ||
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = !selectedGenre || album.genre === selectedGenre;
      const matchesSubgenre =
        !selectedSubgenre || album.subgenres?.includes(selectedSubgenre);
      const matchesMood =
        !selectedMood || (album.moods ?? []).includes(selectedMood);
      const matchesRating =
        minRating === null || (album.rating ?? 0) >= minRating;

      return (
        matchesSearch &&
        matchesGenre &&
        matchesSubgenre &&
        matchesMood &&
        matchesRating
      );
    });

    const prepareForComparison = (s: string) => {
      if (!s) return "";
      const cleaned = s
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .replace(/^(the|a|an)\s+/i, "")
        .replace(/^[^a-z0-9\u0400-\u04FF\u4E00-\u9FFF]+/i, "");

      if (/^[0-9]/.test(cleaned)) return `0-${cleaned}`;
      if (/^[a-z]/.test(cleaned)) return `1-${cleaned}`;
      return `2-${cleaned}`;
    };

    const toTime = (y?: string) => {
      if (!y || y === "Unknown") return 0;
      return new Date(y).getTime();
    };

    const sorted = [...filtered];

    switch (sortBy) {
      case "title":
        sorted.sort((a, b) => {
          return prepareForComparison(a.title).localeCompare(
            prepareForComparison(b.title),
            "en",
            {
              sensitivity: "base",
              numeric: true,
            },
          );
        });
        break;

      case "artist":
        sorted.sort((a, b) => {
          const artistA = prepareForComparison(a.artist);
          const artistB = prepareForComparison(b.artist);
          const artistDiff = artistA.localeCompare(artistB, "en", {
            sensitivity: "base",
            numeric: true,
          });

          if (artistDiff === 0) {
            return toTime(b.year) - toTime(a.year);
          }
          return artistDiff;
        });
        break;

      case "year":
        sorted.sort((a, b) => {
          const dateDiff = toTime(b.year) - toTime(a.year);
          if (dateDiff !== 0) return dateDiff;
          return prepareForComparison(a.title).localeCompare(
            prepareForComparison(b.title),
            "en",
            { sensitivity: "base" },
          );
        });
        break;

      case "added":
        sorted.sort(
          (a, b) =>
            new Date(b.addedAt ?? 0).getTime() -
            new Date(a.addedAt ?? 0).getTime(),
        );
        break;

      case "played":
      default:
        return filtered;
    }

    return sorted;
  }, [
    albums,
    searchQuery,
    selectedGenre,
    selectedSubgenre,
    selectedMood,
    minRating,
    sortBy,
  ]);

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading your Spotify library...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">Your Library</h1>
          <p className="text-muted-foreground">
            Manage and explore your albums
          </p>
        </div>

        <Button className="gap-2" size="lg">
          <Search className="h-4 w-4" />
          Find new albums
        </Button>
      </div>

      {/* SEARCH + CONTROLS */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 h-4 w-4" />
            <Input
              placeholder="Search albums or artists..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="mr-1 h-4 w-4" />
                Sort
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("played")}>
                Recently played
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSortBy("added")}>
                Recently added
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSortBy("title")}>
                Album Name
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSortBy("artist")}>
                Artist
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSortBy("year")}>
                Year
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
            {/* GENRE */}
            <Select
              value={selectedGenre || "all"}
              onValueChange={(v) => setSelectedGenre(v === "all" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* SUBGENRE */}
            <Select
              value={selectedSubgenre || "all"}
              onValueChange={(v) => setSelectedSubgenre(v === "all" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Subgenre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subgenres</SelectItem>
                {subgenres.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* MOOD */}
            <Select
              value={selectedMood || "all"}
              onValueChange={(v) => setSelectedMood(v === "all" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                {moods.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* RATING */}
            <Select
              value={minRating?.toString() || "all"}
              onValueChange={(v) =>
                setMinRating(v === "all" ? null : Number(v))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Min rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any rating</SelectItem>
                <SelectItem value="9">9+</SelectItem>
                <SelectItem value="8">8+</SelectItem>
                <SelectItem value="7">7+</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* TABS */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Albums</TabsTrigger>
          <TabsTrigger value="top">Top Rated</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* GRID */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedAndFilteredAlbums.map((album) => (
            <Link href={`/album/${album.id}`} key={album.id}>
              <Card>
                <Image
                  src={album.cover || "/placeholder.svg"}
                  alt={album.title}
                  width={300}
                  height={300}
                  className="w-full"
                />

                <CardContent className="p-3">
                  <h3>{album.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {album.artist}
                  </p>

                  <div className="mt-2 flex justify-between">
                    <Badge>{album.year?.slice(0, 4) || "????"}</Badge>

                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-xs">{album.rating ?? "-"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedAndFilteredAlbums.map((album) => (
            <Link href={`/album/${album.id}`} key={album.id}>
              <Card className="flex justify-between p-3">
                <div>
                  <p>{album.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {album.artist}
                  </p>
                </div>

                <Badge>{album.year?.slice(0, 4) || "????"}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
