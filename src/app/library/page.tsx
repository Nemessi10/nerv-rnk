"use client";

import { useState } from "react";
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

  const adaptedAlbums = albums.map((a) => ({
    ...a,
    genre: "Unknown",
    subgenre: "",
    moods: [],
    rating: 0,
    eloRating: 0,
  }));

  const filteredAlbums = adaptedAlbums.filter((album) => {
    const matchesSearch =
      searchQuery === "" ||
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre =
      selectedGenre === null || album.genre === selectedGenre;

    const matchesSubgenre =
      selectedSubgenre === null || album.subgenre === selectedSubgenre;

    const matchesMood =
      selectedMood === null || album.moods.includes(selectedMood);

    const matchesRating = minRating === null || album.rating >= minRating;

    return (
      matchesSearch &&
      matchesGenre &&
      matchesSubgenre &&
      matchesMood &&
      matchesRating
    );
  });

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading your Spotify library...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
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

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Albums</TabsTrigger>
          <TabsTrigger value="top">Top Rated</TabsTrigger>
        </TabsList>
      </Tabs>

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
                    <Star className="h-3 w-3 text-yellow-400" />
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
