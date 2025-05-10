"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
  Filter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

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
];

// Extract unique genres
const genres = [...new Set(albums.map((album) => album.genre))];

export default function RankingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter albums based on search query and filters
  const filteredAlbums = albums.filter((album) => {
    const matchesSearch =
      searchQuery === "" ||
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre =
      selectedGenre === null || album.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  // Sort albums based on sort criteria
  const sortedAlbums = [...filteredAlbums].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "rating") {
      comparison = a.rating - b.rating;
    } else if (sortBy === "eloRating") {
      comparison = a.eloRating - b.eloRating;
    } else if (sortBy === "title") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "artist") {
      comparison = a.artist.localeCompare(b.artist);
    } else if (sortBy === "year") {
      comparison = a.year - b.year;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  // Group albums by genre for the Genres tab
  const albumsByGenre = genres.map((genre) => {
    const genreAlbums = albums.filter((album) => album.genre === genre);
    const topAlbums = [...genreAlbums]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
    const avgRating =
      genreAlbums.reduce((sum, album) => sum + album.rating, 0) /
      genreAlbums.length;

    return {
      genre,
      albumCount: genreAlbums.length,
      avgRating: avgRating.toFixed(1),
      topAlbums,
    };
  });

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rankings</h1>
          <p className="text-muted-foreground">
            View and sort your album rankings
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Albums</TabsTrigger>
          <TabsTrigger value="genres">By Genre</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
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
                className={
                  showFilters ? "bg-accent text-accent-foreground" : ""
                }
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
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("rating");
                      setSortOrder("desc");
                    }}
                  >
                    Rating (Highest)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("rating");
                      setSortOrder("asc");
                    }}
                  >
                    Rating (Lowest)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("eloRating");
                      setSortOrder("desc");
                    }}
                  >
                    Elo Rating (Highest)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("title");
                      setSortOrder("asc");
                    }}
                  >
                    Album Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("artist");
                      setSortOrder("asc");
                    }}
                  >
                    Artist Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("year");
                      setSortOrder("desc");
                    }}
                  >
                    Release Year (Newest)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("year");
                      setSortOrder("asc");
                    }}
                  >
                    Release Year (Oldest)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                        <SelectItem value="">All Genres</SelectItem>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
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
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">Rank</TableHead>
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
                  <TableRow key={album.id} className="hover:bg-secondary/50">
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Image
                        src={album.cover || "/placeholder.svg"}
                        alt={album.title}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-sm object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/album/${album.id}`}
                        className="hover:underline"
                      >
                        {album.title}
                      </Link>
                    </TableCell>
                    <TableCell>{album.artist}</TableCell>
                    <TableCell>{album.year}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{album.genre}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span>{album.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {album.eloRating}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="genres" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albumsByGenre.map((genreData) => (
              <Card key={genreData.genre} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-b p-4">
                    <h3 className="text-xl font-bold">{genreData.genre}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {genreData.albumCount} albums
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="font-medium">
                          {genreData.avgRating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {genreData.topAlbums.map((album) => (
                      <Link
                        key={album.id}
                        href={`/album/${album.id}`}
                        className="flex items-center gap-3 p-3 transition-colors hover:bg-secondary/50"
                      >
                        <Image
                          src={album.cover || "/placeholder.svg"}
                          alt={album.title}
                          width={50}
                          height={50}
                          className="h-12 w-12 rounded-sm object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{album.title}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {album.artist}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="font-medium">{album.rating}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/library?genre=${genreData.genre}`}>
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
