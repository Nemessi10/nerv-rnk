"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { cn } from "~/lib/utils";
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
  XCircle,
  Dices,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { useSpotifyLibrary } from "~/hooks/use-spotify-library";
import type { AppAlbum } from "~/types/album";

const ITEMS_PER_PAGE = 24;

export default function LibraryPage() {
  const { albums, loading } = useSpotifyLibrary();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedSubgenre, setSelectedSubgenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [sortBy, setSortBy] = useState<
    "title" | "artist" | "year" | "elo" | "classic" | "added" | "played"
  >(() => {
    if (typeof window !== "undefined") {
      const savedSort = localStorage.getItem("library_sort_by");
      const validSorts = [
        "title",
        "artist",
        "year",
        "elo",
        "classic",
        "added",
        "played",
      ] as const;
      if (savedSort && (validSorts as readonly string[]).includes(savedSort)) {
        return savedSort as (typeof validSorts)[number];
      }
    }
    return "played";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("library_sort_by", sortBy);
    }
  }, [sortBy]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedGenre, selectedSubgenre, selectedMood, minRating, sortBy, activeTab]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenre(null);
    setSelectedSubgenre(null);
    setSelectedMood(null);
    setMinRating(null);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      !!searchQuery ||
      !!selectedGenre ||
      !!selectedSubgenre ||
      !!selectedMood ||
      minRating !== null
    );
  }, [searchQuery, selectedGenre, selectedSubgenre, selectedMood, minRating]);

  const { genres, subgenres, moods } = useMemo(() => {
    const genresSet = new Set<string>();
    const subgenresSet = new Set<string>();
    const moodsSet = new Set<string>();

    albums.forEach((album) => {
      if (album.genre) genresSet.add(album.genre);
      
      album.subgenres?.forEach((sub) => {
        if (sub) subgenresSet.add(sub);
      });
      
      album.moods?.forEach((mood) => {
        if (mood) moodsSet.add(mood);
      });
    });

    return {
      genres: Array.from(genresSet).sort(),
      subgenres: Array.from(subgenresSet).sort(),
      moods: Array.from(moodsSet).sort(),
    };
  }, [albums]);

  const sortedAndFilteredAlbums = useMemo(() => {
    const filtered = albums.filter((album) => {
      if (activeTab === "top") {
        const hasClassicRating = typeof album.rating === "number";
        const hasEloMatches =
          album.eloRating !== null && album.eloRating !== 1000;
        if (!hasClassicRating && !hasEloMatches) return false;
      }

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

    const toTime = (y?: string | null) => {
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
            { sensitivity: "base", numeric: true },
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
        sorted.sort((a, b) => {
          return (
            new Date(b.spotifyAddedAt ?? 0).getTime() -
            new Date(a.spotifyAddedAt ?? 0).getTime()
          );
        });
        break;

      case "played":
        sorted.sort((a, b) => {
          return (
            new Date(b.lastPlayedAt ?? 0).getTime() -
            new Date(a.lastPlayedAt ?? 0).getTime()
          );
        });
        break;

      case "classic":
        sorted.sort((a, b) => {
          const scoreA = a.rating ?? -1;
          const scoreB = b.rating ?? -1;

          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }
          const eloA = a.eloRating ?? 1000;
          const eloB = b.eloRating ?? 1000;
          if (eloA !== eloB) return eloB - eloA;

          return prepareForComparison(a.title).localeCompare(
            prepareForComparison(b.title),
          );
        });
        break;

      case "elo":
      default:
        sorted.sort((a, b) => {
          const eloA = a.eloRating ?? 1000;
          const eloB = b.eloRating ?? 1000;

          if (eloA !== eloB) {
            return eloB - eloA;
          }
          const scoreA = a.rating ?? -1;
          const scoreB = b.rating ?? -1;
          if (scoreA !== scoreB) return scoreB - scoreA;

          return prepareForComparison(a.title).localeCompare(
            prepareForComparison(b.title),
          );
        });
        break;
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
    activeTab,
  ]);

  const displayedAlbums = useMemo(() => {
    return sortedAndFilteredAlbums.slice(0, visibleCount);
  }, [sortedAndFilteredAlbums, visibleCount]);

  useEffect(() => {
    if (loading || displayedAlbums.length >= sortedAndFilteredAlbums.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { rootMargin: "200px" }
    );

    const currentTrigger = loadMoreRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [loading, displayedAlbums.length, sortedAndFilteredAlbums.length]);

  const handleRandomAlbum = () => {
    if (!sortedAndFilteredAlbums.length) return;

    const randomIndex = Math.floor(
      Math.random() * sortedAndFilteredAlbums.length,
    );
    const randomAlbum = sortedAndFilteredAlbums[randomIndex];

    if (randomAlbum?.id) {
      router.push(`/album/${randomAlbum.id}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading your Spotify library...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Library</h1>
          <p className="text-muted-foreground">
            Manage and explore your albums
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRandomAlbum}
            disabled={sortedAndFilteredAlbums.length === 0}
            size="lg"
            className="h-11 gap-2 rounded-md bg-primary px-5 text-sm font-medium shadow-sm transition-all hover:bg-primary/90 active:scale-95"
          >
            <Dices className="h-4 w-4" />
            <span>Surprise Me</span>
          </Button>
        </div>
      </div>

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
            aria-label="Toggle filter settings"
            className={cn(
              "h-10 w-10",
              showFilters && "border-primary/30 bg-secondary/40 text-primary",
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Clear all applied filters"
              onClick={handleResetFilters}
              className="h-10 w-10"
              title="Reset all filters"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="mr-1 h-4 w-4" />
                Sort
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("elo")}>
                Elo Rating (Top)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("classic")}>
                Classic Rating (Top)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("played")}>
                Recently Played
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("added")}>
                Recently Added
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
            aria-label="Switch to grid view"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            aria-label="Switch to list view"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-4">
            <Select
              value={selectedGenre ?? "all"}
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

            <Select
              value={selectedSubgenre ?? "all"}
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

            <Select
              value={selectedMood ?? "all"}
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

            <Select
              value={minRating?.toString() ?? "all"}
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all" id="tab-trigger-all">All Albums</TabsTrigger>
          <TabsTrigger value="top" id="tab-trigger-top" className="gap-1.5">
            Rated Albums
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedAlbums.map((album: AppAlbum, index: number) => (
            <Link href={`/album/${album.id}`} key={album.id}>
              <Card className="flex h-full flex-col justify-between overflow-hidden">
                <div>
                  <div className="relative aspect-square w-full bg-muted">
                    <Image
                      src={album.cover || "/placeholder.svg"}
                      alt={album.title}
                      fill
                      sizes="(max-w-640px) 50vw, (max-w-1024px) 33vw, 250px"
                      className="object-cover"
                      priority={index < 8}
                    />
                  </div>

                  <CardContent className="p-3 pb-0">
                    <h2 className="line-clamp-1 text-base font-bold">
                      {album.title}
                    </h2>
                    <p className="truncate text-sm text-muted-foreground mb-1.5">
                      {album.artist}
                    </p>
                    
                    {album.moods && album.moods.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {album.moods.slice(0, 3).map((m) => (
                          <span 
                            key={m} 
                            className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide uppercase"
                          >
                            {m}
                          </span>
                        ))}
                        {album.moods.length > 3 && (
                          <span className="text-muted-foreground text-[9px] self-center">
                            +{album.moods.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </div>

                <CardContent className="p-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      {album.year ? album.year.slice(0, 4) : "—"}
                    </Badge>

                    <div className="flex items-center gap-3">
                      <span className="rounded bg-secondary/40 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {album.eloRating ?? 1000} E
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-sm font-bold">
                          {typeof album.rating === "number"
                            ? album.rating.toFixed(1)
                            : "—"}
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
          {displayedAlbums.map((album: AppAlbum, index: number) => (
            <Link href={`/album/${album.id}`} key={album.id}>
              <Card className="flex items-center justify-between p-3 transition-colors hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                    <Image
                      src={album.cover || "/placeholder.svg"}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                      priority={index < 12}
                    />
                  </div>
                  <div>
                    <h2 className="line-clamp-1 text-base font-bold">
                      {album.title}
                    </h2>
                    <p className="truncate text-sm text-muted-foreground">
                      {album.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-muted-foreground">
                    {album.eloRating ?? 1000} Elo
                  </span>
                  {typeof album.rating === "number" && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-sm font-bold">
                        {album.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <Badge className="text-[10px]">
                    {album.year ? album.year.slice(0, 4) : "—"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {sortedAndFilteredAlbums.length > displayedAlbums.length && (
        <div ref={loadMoreRef} className="flex justify-center py-8 text-sm text-muted-foreground">
          <span className="animate-pulse">Loading more masterworks...</span>
        </div>
      )}

      {sortedAndFilteredAlbums.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No albums found matching the criteria.
        </div>
      )}
    </div>
  );
}