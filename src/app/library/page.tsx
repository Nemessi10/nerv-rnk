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

  const genres = useMemo(() => {
    return [...new Set(albums.map((a) => a.genre).filter(Boolean))];
  }, [albums]);

  const subgenres = useMemo(() => {
    return [...new Set(albums.map((a) => a.subgenre).filter(Boolean))];
  }, [albums]);

  const moods = useMemo(() => {
    return [...new Set(albums.flatMap((a) => a.moods ?? []))];
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const matchesSearch =
        !searchQuery ||
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        !selectedGenre || album.genre === selectedGenre;

      const matchesSubgenre =
        !selectedSubgenre || album.subgenre === selectedSubgenre;

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
  }, [
    albums,
    searchQuery,
    selectedGenre,
    selectedSubgenre,
    selectedMood,
    minRating,
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
      <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row justify-between">
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
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Sort
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Album Name</DropdownMenuItem>
              <DropdownMenuItem>Artist</DropdownMenuItem>
              <DropdownMenuItem>Year</DropdownMenuItem>
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
          <CardContent className="p-4 grid gap-4 sm:grid-cols-3">
            {/* GENRE */}
            <Select
              value={selectedGenre || "all"}
              onValueChange={(v) =>
                setSelectedGenre(v === "all" ? null : v)
              }
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
              onValueChange={(v) =>
                setSelectedSubgenre(v === "all" ? null : v)
              }
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
              onValueChange={(v) =>
                setSelectedMood(v === "all" ? null : v)
              }
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
          {filteredAlbums.map((album) => (
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

                  <div className="flex justify-between mt-2">
                    <Badge>{album.year}</Badge>

                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-xs">
                        {album.rating ?? "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlbums.map((album) => (
            <Link href={`/album/${album.id}`} key={album.id}>
              <Card className="p-3 flex justify-between">
                <div>
                  <p>{album.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {album.artist}
                  </p>
                </div>

                <Badge>{album.year}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}