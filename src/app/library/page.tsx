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

// Mock data for albums
const albums = [
  {
    id: 1,
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    cover: "/placeholder.svg?height=300&width=300",
    year: 1973,
    genre: "Progressive Rock",
    subgenre: "Space Rock",
    moods: ["Introspective", "Atmospheric", "Melancholic"],
    rating: 9.2,
    eloRating: 1850,
  },
  {
    id: 2,
    title: "OK Computer",
    artist: "Radiohead",
    cover: "/placeholder.svg?height=300&width=300",
    year: 1997,
    genre: "Alternative Rock",
    subgenre: "Art Rock",
    moods: ["Anxious", "Dystopian", "Melancholic"],
    rating: 9.5,
    eloRating: 1920,
  },
  {
    id: 3,
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2015,
    genre: "Hip Hop",
    subgenre: "Conscious Hip Hop",
    moods: ["Introspective", "Political", "Energetic"],
    rating: 9.3,
    eloRating: 1880,
  },
  {
    id: 4,
    title: "Kid A",
    artist: "Radiohead",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2000,
    genre: "Electronic",
    subgenre: "Experimental Rock",
    moods: ["Atmospheric", "Cold", "Alienated"],
    rating: 9.0,
    eloRating: 1830,
  },
  {
    id: 5,
    title: "Vespertine",
    artist: "Björk",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2001,
    genre: "Electronic",
    subgenre: "Art Pop",
    moods: ["Intimate", "Winter", "Delicate"],
    rating: 8.8,
    eloRating: 1790,
  },
  {
    id: 6,
    title: "Blonde",
    artist: "Frank Ocean",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2016,
    genre: "R&B",
    subgenre: "Alternative R&B",
    moods: ["Melancholic", "Introspective", "Nostalgic"],
    rating: 9.1,
    eloRating: 1840,
  },
  {
    id: 7,
    title: "Currents",
    artist: "Tame Impala",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2015,
    genre: "Psychedelic Pop",
    subgenre: "Neo-Psychedelia",
    moods: ["Dreamy", "Introspective", "Euphoric"],
    rating: 8.7,
    eloRating: 1780,
  },
  {
    id: 8,
    title: "In Rainbows",
    artist: "Radiohead",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2007,
    genre: "Alternative Rock",
    subgenre: "Art Rock",
    moods: ["Warm", "Intimate", "Melancholic"],
    rating: 9.4,
    eloRating: 1900,
  },
  {
    id: 9,
    title: "Madvillainy",
    artist: "Madvillain",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2004,
    genre: "Hip Hop",
    subgenre: "Underground Hip Hop",
    moods: ["Playful", "Eccentric", "Cryptic"],
    rating: 9.2,
    eloRating: 1850,
  },
  {
    id: 10,
    title: "My Beautiful Dark Twisted Fantasy",
    artist: "Kanye West",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2010,
    genre: "Hip Hop",
    subgenre: "Pop Rap",
    moods: ["Grandiose", "Emotional", "Ambitious"],
    rating: 9.6,
    eloRating: 1950,
  },
  {
    id: 11,
    title: "Loveless",
    artist: "My Bloody Valentine",
    cover: "/placeholder.svg?height=300&width=300",
    year: 1991,
    genre: "Alternative Rock",
    subgenre: "Shoegaze",
    moods: ["Dreamy", "Noisy", "Ethereal"],
    rating: 9.3,
    eloRating: 1880,
  },
  {
    id: 12,
    title: "Rumours",
    artist: "Fleetwood Mac",
    cover: "/placeholder.svg?height=300&width=300",
    year: 1977,
    genre: "Rock",
    subgenre: "Soft Rock",
    moods: ["Emotional", "Bittersweet", "Warm"],
    rating: 9.0,
    eloRating: 1830,
  },
];

// Extract unique genres, subgenres, and moods
const genres = [...new Set(albums.map((album) => album.genre))];
const subgenres = [...new Set(albums.map((album) => album.subgenre))];
const moods = [...new Set(albums.flatMap((album) => album.moods))];

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedSubgenre, setSelectedSubgenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  // Filter albums based on search query and filters
  const filteredAlbums = albums.filter((album) => {
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

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
          <p className="text-muted-foreground">
            Manage and explore your rated albums
          </p>
        </div>
        <Button className="gap-2" size="lg">
          <Search className="h-4 w-4" />
          Find new albums
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
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
            className={showFilters ? "bg-accent text-accent-foreground" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Album Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>Album Name (Z-A)</DropdownMenuItem>
              <DropdownMenuItem>Artist Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>Release Date (Newest)</DropdownMenuItem>
              <DropdownMenuItem>Release Date (Oldest)</DropdownMenuItem>
              <DropdownMenuItem>Rating (Highest)</DropdownMenuItem>
              <DropdownMenuItem>Rating (Lowest)</DropdownMenuItem>
              <DropdownMenuItem>Elo Rating (Highest)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
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

      {showFilters && (
        <Card className="mb-6 duration-300 animate-in fade-in-0 slide-in-from-top-4">
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Select
                  value={selectedGenre || ""}
                  onValueChange={(value) => setSelectedGenre(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subgenre</label>
                <Select
                  value={selectedSubgenre || "all"}
                  onValueChange={(value) => setSelectedSubgenre(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Subgenres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subgenres</SelectItem>
                    {subgenres.map((subgenre) => (
                      <SelectItem key={subgenre} value={subgenre}>
                        {subgenre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mood</label>
                <Select
                  value={selectedMood || "all"}
                  onValueChange={(value) => setSelectedMood(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Moods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Moods</SelectItem>
                    {moods.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select
                  value={minRating?.toString() || "all"}
                  onValueChange={(value) =>
                    setMinRating(value ? Number(value) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="9">9+</SelectItem>
                    <SelectItem value="8">8+</SelectItem>
                    <SelectItem value="7">7+</SelectItem>
                    <SelectItem value="6">6+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredAlbums.length} album
                {filteredAlbums.length !== 1 ? "s" : ""} found
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedGenre(null);
                  setSelectedSubgenre(null);
                  setSelectedMood(null);
                  setMinRating(null);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Albums</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recently Added</TabsTrigger>
          <TabsTrigger value="top">Top Rated</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredAlbums.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="text-center text-muted-foreground">
            No albums found matching your filters
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("");
              setSelectedGenre(null);
              setSelectedSubgenre(null);
              setSelectedMood(null);
              setMinRating(null);
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="album-grid">
          {filteredAlbums.map((album) => (
            <Link href={`/album/${album.id}`} key={album.id}>
              <Card className="album-card h-full overflow-hidden border-0 bg-secondary/50">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={album.cover || "/placeholder.svg"}
                    alt={album.title}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <h3 className="line-clamp-1 font-medium">{album.title}</h3>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {album.artist}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {album.genre}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-xs font-medium">
                          {album.rating}
                        </span>
                      </div>
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
              <Card className="overflow-hidden transition-colors hover:bg-secondary/50">
                <div className="flex items-center gap-4 p-3">
                  <Image
                    src={album.cover || "/placeholder.svg"}
                    alt={album.title}
                    width={60}
                    height={60}
                    className="h-15 w-15 rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-medium">{album.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {album.artist}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-sm font-medium">
                        {album.rating}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {album.genre}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {album.year}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
