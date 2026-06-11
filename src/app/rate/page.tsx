"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  Search,
  Shuffle,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Swords,
  Sparkles,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { useSpotifyLibrary } from "~/hooks/use-spotify-library";
import type { AppAlbum } from "~/types/album";

type RateMode = "unrated" | "random" | "re-rate";
type EloMode = "discovery" | "sbmm" | "discrepancy" | "random";

export default function RatePage() {
  const { albums, loading, refresh } = useSpotifyLibrary();

  const [rateMode, setRateMode] = useState<RateMode>("unrated");
  const [modeIndices, setModeIndices] = useState<Record<RateMode, number>>({
    unrated: 0,
    random: 0,
    "re-rate": 0,
  });

  const [selectedAlbumIds, setSelectedAlbumIds] = useState<
    Record<RateMode, string | null>
  >({
    unrated: null,
    random: null,
    "re-rate": null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [currentRating, setCurrentRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const [eloPair, setEloPair] = useState<AppAlbum[]>([]);
  const [isEloLoading, setIsEloLoading] = useState(false);
  const [eloMode, setEloMode] = useState<EloMode>("discovery");
  const [recentMatchups, setRecentMatchups] = useState<string[]>([]);

  const [eloColors, setEloColors] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState("classic");

  const ratingInt = Math.floor(currentRating);
  const ratingDecimal = Math.round((currentRating - ratingInt) * 10);

  const modeDescriptions = {
    classic: {
      unrated:
        "Rate new releases from your library that don't have a score yet.",
      random:
        "A completely randomized stream of albums for unpredictable fast reviews.",
      "re-rate":
        "Review and tweak your previously subbmitted scores to fine-tune accuracy.",
    },
    elo: {
      discovery:
        "Prioritizes new albums with low match counts against stable mid-tier releases.",
      sbmm: "Championship Mode: Intense battles between albums with highly close Elo ratings.",
      discrepancy:
        "Finds mathematical anomalies—matches albums where Elo contradicts Classic score.",
      random:
        "Classic raw matchmaking pool with built-in anti-repetition matchup cooldown.",
    },
  };

  const queue = useMemo(() => {
    let list = [...albums];
    if (rateMode === "unrated") {
      list = list.filter((a) => a.rating === undefined || a.rating === null);
    } else if (rateMode === "re-rate") {
      list = list.filter((a) => a.rating !== undefined && a.rating !== null);
    }
    return list;
  }, [albums, rateMode]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return albums.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.artist.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [albums, searchQuery]);

  const currentAlbum = useMemo(() => {
    const selectedId = selectedAlbumIds[rateMode];
    if (selectedId) {
      return (
        albums.find((a) => a.id === selectedId) ??
        queue[modeIndices[rateMode]] ??
        queue[0]
      );
    }
    return queue[modeIndices[rateMode]] ?? queue[0];
  }, [queue, rateMode, modeIndices, selectedAlbumIds, albums]);

  useEffect(() => {
    if (currentAlbum) {
      setCurrentRating(currentAlbum.rating ?? 0);
    }
  }, [currentAlbum]);

  const extractAlbumColor = (albumId: string, coverUrl: string) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.addEventListener("load", () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, 0, 16, 16);

        const imgData = ctx.getImageData(0, 0, 16, 16).data;

        let rBgSum = 0,
          gBgSum = 0,
          bBgSum = 0;
        const totalPixels = 256;

        const colorBuckets: Record<string, number> = {};

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i] ?? 0;
          const g = imgData[i + 1] ?? 0;
          const b = imgData[i + 2] ?? 0;

          rBgSum += r;
          gBgSum += g;
          bBgSum += b;

          const bucketKey = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
          colorBuckets[bucketKey] = (colorBuckets[bucketKey] ?? 0) + 1;
        }

        const rBgAvg = rBgSum / totalPixels;
        const gBgAvg = gBgSum / totalPixels;
        const bBgAvg = bBgSum / totalPixels;
        const bgLuminance = rBgAvg * 0.299 + gBgAvg * 0.587 + bBgAvg * 0.114;

        let maxScore = -1;
        let bestR = Math.round(rBgAvg);
        let bestG = Math.round(gBgAvg);
        let bestB = Math.round(bBgAvg);
        let hasAnyChromacity = false;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i] ?? 0;
          const g = imgData[i + 1] ?? 0;
          const b = imgData[i + 2] ?? 0;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const chroma = max - min;

          if (chroma > 30) hasAnyChromacity = true;

          const bucketKey = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
          const frequency = colorBuckets[bucketKey] ?? 1;

          const distance = Math.sqrt(
            Math.pow(r - rBgAvg, 2) +
              Math.pow(g - gBgAvg, 2) +
              Math.pow(b - bBgAvg, 2),
          );

          const uniquenessWeight = 256 / frequency;
          const score = chroma * 6.0 + distance * 1.5 + uniquenessWeight * 2.0;

          if (score > maxScore) {
            maxScore = score;
            bestR = r;
            bestG = g;
            bestB = b;
          }
        }

        const finalChroma =
          Math.max(bestR, bestG, bestB) - Math.min(bestR, bestG, bestB);

        if (!hasAnyChromacity || finalChroma < 25) {
          if (bgLuminance > 140) {
            bestR = 50;
            bestG = 50;
            bestB = 50;
          } else {
            bestR = 230;
            bestG = 230;
            bestB = 230;
          }
        } else {
          const maxVal = Math.max(bestR, bestG, bestB);
          if (maxVal > 0 && maxVal < 220) {
            const boost = 235 / maxVal;
            bestR = Math.min(255, Math.round(bestR * boost));
            bestG = Math.min(255, Math.round(bestG * boost));
            bestB = Math.min(255, Math.round(bestB * boost));
          }
        }

        const hexColor = `#${((1 << 24) + (bestR << 16) + (bestG << 8) + bestB).toString(16).slice(1)}`;
        setEloColors((prev) => ({ ...prev, [albumId]: hexColor }));
      } catch (e) {
        console.error("Failed to extract canvas color", e);
      }
    });

    img.src = coverUrl;
  };

  useEffect(() => {
    if (eloPair.length === 2) {
      if (eloPair[0]?.id && eloPair[0]?.cover) {
        extractAlbumColor(eloPair[0].id, eloPair[0].cover);
      }
      if (eloPair[1]?.id && eloPair[1]?.cover) {
        extractAlbumColor(eloPair[1].id, eloPair[1].cover);
      }
    }
  }, [eloPair]);

  const updateIndex = (newIndex: number) => {
    setSelectedAlbumIds((prev) => ({ ...prev, [rateMode]: null }));
    setModeIndices((prev) => ({ ...prev, [rateMode]: newIndex }));
  };

  const handleRandomize = () => {
    if (queue.length === 0) return;
    const randomIndex = Math.floor(Math.random() * queue.length);
    updateIndex(randomIndex);
  };

  const handleSaveRating = async () => {
    if (!currentAlbum || (currentRating === 0 && hoverRating === 0)) return;
    const finalScore = hoverRating > 0 ? hoverRating : currentRating;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ album: currentAlbum, rating: finalScore }),
      });
      if (res.ok) {
        await refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchEloMatchup = useCallback(async () => {
    setIsEloLoading(true);
    try {
      const excludeString = recentMatchups.join(",");
      const res = await fetch(
        `/api/ratings/elo/matchup?mode=${eloMode}&exclude=${excludeString}`,
      );
      const data = (await res.json()) as AppAlbum[];
      setEloPair(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEloLoading(false);
    }
  }, [eloMode, recentMatchups]);

  const handleSkipMatchup = () => {
    if (eloPair.length === 2 && eloPair[0] && eloPair[1]) {
      const idA = eloPair[0].id;
      const idB = eloPair[1].id;

      setRecentMatchups((prev) => {
        const updated = [...prev, idA, idB];

        if (updated.length > 24) {
          updated.splice(0, 2);
        }
        return updated;
      });
    }
  };

  const handleEloVote = async (winnerId: string, loserId: string) => {
    if (isEloLoading) return;
    setIsEloLoading(true);
    try {
      await fetch("/api/ratings/elo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, loserId }),
      });

      const pairKey = `${winnerId}-${loserId}`;
      setRecentMatchups((prev) => {
        const updated = [...prev, pairKey];
        if (updated.length > 15) updated.shift();
        return updated;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsEloLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "elo" && !loading) {
      void fetchEloMatchup();
    }
  }, [activeTab, loading, fetchEloMatchup]);

  if (loading && albums.length === 0)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">
            RATING STUDIO
          </h1>
          <div className="flex items-center gap-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-auto"
            >
              <TabsList className="h-7 border border-border/40 bg-secondary/20 p-1">
                <TabsTrigger
                  value="classic"
                  id="tab-rate-classic"
                  className="px-2 text-[9px] font-bold uppercase"
                >
                  Classic
                </TabsTrigger>
                <TabsTrigger
                  value="elo"
                  id="tab-rate-elo"
                  className="px-2 text-[9px] font-bold uppercase"
                >
                  Elo
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {activeTab === "classic"
                ? `${rateMode} Mode — ${queue.length} left`
                : `${eloMode} Engine Active`}
            </p>
          </div>
        </div>

        {activeTab === "classic" ? (
          <div
            className="flex gap-1.5 rounded-xl border border-border/40 bg-secondary/15 p-1"
            role="group"
            aria-label="Rating modes"
          >
            {[
              { id: "unrated", label: "Unrated", icon: Star },
              { id: "random", label: "Random", icon: Shuffle },
              { id: "re-rate", label: "Re-rate", icon: CheckCircle2 },
            ].map((mode) => (
              <div key={mode.id} className="group/tooltip relative">
                <Button
                  variant={rateMode === mode.id ? "default" : "ghost"}
                  className="h-8 gap-2 rounded-lg px-3 transition-all"
                  onClick={() => setRateMode(mode.id as RateMode)}
                  aria-pressed={rateMode === mode.id}
                >
                  <mode.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase">
                    {mode.label}
                  </span>
                </Button>
                <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-64 whitespace-normal rounded-xl border border-border bg-popover/90 p-3 text-[10px] font-bold leading-normal text-popover-foreground shadow-2xl backdrop-blur-md duration-150 animate-in fade-in slide-in-from-bottom-1 group-hover/tooltip:block">
                  {modeDescriptions.classic[mode.id as RateMode]}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex gap-1.5 rounded-xl border border-border/40 bg-secondary/15 p-1 duration-200 animate-in fade-in"
            role="group"
            aria-label="Matchmaking Engines"
          >
            {[
              { id: "discovery", label: "Discovery", icon: Sparkles },
              { id: "sbmm", label: "Championship", icon: Trophy },
              { id: "discrepancy", label: "Discrepancy", icon: AlertTriangle },
              { id: "random", label: "Random Match", icon: Shuffle },
            ].map((mode) => (
              <div key={mode.id} className="group/tooltip relative">
                <Button
                  variant={eloMode === mode.id ? "default" : "ghost"}
                  className="h-8 gap-2 rounded-lg px-3 transition-all"
                  onClick={() => setEloMode(mode.id as EloMode)}
                  aria-pressed={eloMode === mode.id}
                >
                  <mode.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase">
                    {mode.label}
                  </span>
                </Button>
                <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-64 whitespace-normal rounded-xl border border-border bg-popover/90 p-3 text-[10px] font-bold leading-normal text-popover-foreground shadow-2xl backdrop-blur-md duration-150 animate-in fade-in slide-in-from-bottom-1 group-hover/tooltip:block">
                  {modeDescriptions.elo[mode.id as EloMode]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent
          value="classic"
          className="mt-0 border-0 p-0 focus-visible:ring-0"
        >
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <div className="group relative aspect-square">
                <Card className="relative h-full overflow-hidden rounded-[32px] border-0 bg-transparent shadow-none">
                  {currentAlbum && (
                    <Image
                      src={currentAlbum.cover}
                      alt={`Album cover for ${currentAlbum.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-w-1280px) 100vw, 650px"
                      quality={90}
                      priority
                    />
                  )}

                  <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Previous album"
                      className="h-12 w-12 rounded-full border-0 bg-black/40 backdrop-blur-md hover:bg-black/60"
                      onClick={() =>
                        updateIndex(
                          modeIndices[rateMode] > 0
                            ? modeIndices[rateMode] - 1
                            : queue.length - 1,
                        )
                      }
                    >
                      <ChevronLeft
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Next album"
                      className="h-12 w-12 rounded-full border-0 bg-black/40 backdrop-blur-md hover:bg-black/60"
                      onClick={() =>
                        updateIndex(
                          modeIndices[rateMode] < queue.length - 1
                            ? modeIndices[rateMode] + 1
                            : 0,
                        )
                      }
                    >
                      <ChevronRight
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-8 xl:col-span-5">
              <div className="relative" ref={searchRef}>
                <div
                  className={`flex items-center gap-3 rounded-xl border bg-secondary/30 px-4 py-3 transition-all ${isSearchFocused ? "border-primary" : "border-transparent"}`}
                >
                  <Search
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    aria-label="Search and jump to album"
                    placeholder="Jump to album..."
                    className="w-full border-0 bg-transparent text-sm font-medium outline-none"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl backdrop-blur-xl">
                    <div className="max-h-[280px] overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-primary/5"
                          onClick={() => {
                            setSelectedAlbumIds((prev) => ({
                              ...prev,
                              [rateMode]: result.id,
                            }));
                            setSearchQuery("");
                            setIsSearchFocused(false);
                          }}
                        >
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={result.cover}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold">
                              {result.title}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {result.artist} •{" "}
                              {result.year ? result.year.slice(0, 4) : "—"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {currentAlbum ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="border-primary/20 py-0.5 text-[10px] font-bold uppercase text-primary"
                      >
                        {currentAlbum.genre}
                      </Badge>
                      {rateMode === "random" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRandomize}
                          className="h-7 gap-2 text-[10px] font-bold uppercase"
                        >
                          <Shuffle className="h-3 w-3" aria-hidden="true" />{" "}
                          Shuffle
                        </Button>
                      )}
                    </div>

                    <div className="flex h-[120px] flex-col justify-center">
                      <h2 className="mb-1 line-clamp-2 text-4xl font-black leading-tight tracking-tighter">
                        {currentAlbum.title}
                      </h2>
                      <p className="truncate text-lg font-bold text-muted-foreground">
                        {currentAlbum.artist}{" "}
                        <span
                          className="mx-2 text-primary/30"
                          role="presentation"
                        >
                          •
                        </span>{" "}
                        <span className="text-primary/60">
                          {currentAlbum.year.slice(0, 4)}
                        </span>
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 gap-2 rounded-lg px-4 text-xs font-bold"
                      asChild
                    >
                      <Link href={`/album/${currentAlbum.id}`}>
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />{" "}
                        View Details
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-6 rounded-[24px] border border-border/40 bg-secondary/10 p-8">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                        Current Score
                      </span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-5xl font-black tracking-tighter text-primary">
                          {hoverRating > 0
                            ? hoverRating.toFixed(1)
                            : currentRating > 0
                              ? currentRating.toFixed(1)
                              : "0.0"}
                        </span>
                        <span
                          className="text-2xl font-black text-muted-foreground/20"
                          role="presentation"
                        >
                          /10
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between px-1"
                      role="group"
                      aria-label="Select base rating from 1 to 10"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => {
                        const isStarred =
                          hoverRating > 0 ? hoverRating >= s : ratingInt >= s;
                        return (
                          <button
                            key={s}
                            className="transition-transform active:scale-75"
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() =>
                              setCurrentRating(
                                s +
                                  ratingDecimal / 10 -
                                  (ratingInt === s ? ratingDecimal / 10 : 0),
                              )
                            }
                            aria-label={`Set base score to ${s}`}
                            aria-pressed={ratingInt === s}
                          >
                            <Star
                              className={`h-7 w-7 transition-all duration-200 ${
                                isStarred
                                  ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                                  : "text-muted-foreground/10"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {ratingInt > 0 && (
                      <div className="space-y-2 pt-2 duration-200 animate-in fade-in slide-in-from-top-1">
                        <span className="block px-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                          Fine Tune Decimals (.0 - .9)
                        </span>
                        <div
                          className="grid grid-cols-5 gap-1.5 rounded-xl border border-border/40 bg-background/40 p-1.5 sm:grid-cols-10"
                          role="group"
                          aria-label="Select decimal score fraction"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
                            const isSelected = ratingDecimal === d;
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() =>
                                  setCurrentRating(ratingInt + d / 10)
                                }
                                className={`h-8 rounded-lg text-xs font-bold transition-all ${
                                  isSelected
                                    ? "scale-105 bg-primary text-primary-foreground shadow-md"
                                    : "bg-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                                }`}
                              >
                                .{d}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Button
                      className="h-12 w-full rounded-xl bg-primary text-sm font-black transition-all hover:bg-primary/90"
                      disabled={isSubmitting || currentRating === 0}
                      onClick={handleSaveRating}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : (
                        "CONFIRM"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-border bg-secondary/5 py-20 text-center">
                  <p className="text-sm font-bold uppercase text-muted-foreground">
                    Nothing to rate
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="elo"
          className="mt-0 border-0 p-0 focus-visible:ring-0"
        >
          <div className="flex flex-col items-center">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black italic tracking-tighter text-primary">
                PICK THE SUPERIOR ALBUM
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                The battle for the leaderboard
              </p>
            </div>

            <div className="relative grid w-full max-w-full items-center gap-6 px-4 md:grid-cols-11">
              {eloPair.length === 2 ? (
                <>
                  <div className="md:col-span-5">
                    <button
                      disabled={isEloLoading}
                      aria-label={`Vote for ${eloPair[0]!.title} by ${eloPair[0]!.artist} as superior`}
                      onClick={() => {
                        void handleEloVote(eloPair[0]!.id, eloPair[1]!.id);
                      }}
                      style={
                        {
                          "--tw-ring-color": eloColors[eloPair[0]!.id]
                            ? `${eloColors[eloPair[0]!.id]}`
                            : "transparent",
                        } as React.CSSProperties
                      }
                      className="group relative w-full overflow-hidden rounded-[16px] ring-0 transition-all duration-300 hover:ring-[12px] active:scale-[0.98]"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={eloPair[0]!.cover}
                          alt={`Album cover for ${eloPair[0]!.title}`}
                          fill
                          className="rounded-[16px] object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-w-768px) 100vw, 500px"
                          quality={85}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-6 left-6 right-6 text-left text-white opacity-0 transition-all group-hover:opacity-100">
                          <p className="line-clamp-1 text-xl font-black uppercase tracking-tighter">
                            {eloPair[0]!.title}
                          </p>
                          <p className="text-xs font-bold opacity-70">
                            {eloPair[0]!.artist}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center justify-center md:col-span-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
                      <Swords className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <button
                      disabled={isEloLoading}
                      aria-label={`Vote for ${eloPair[1]!.title} by ${eloPair[1]!.artist} as superior`}
                      onClick={() => {
                        void handleEloVote(eloPair[1]!.id, eloPair[0]!.id);
                      }}
                      style={
                        {
                          "--tw-ring-color": eloColors[eloPair[1]!.id]
                            ? `${eloColors[eloPair[1]!.id]}`
                            : "transparent",
                        } as React.CSSProperties
                      }
                      className="group relative w-full overflow-hidden rounded-[16px] ring-0 transition-all duration-300 hover:ring-[12px] active:scale-[0.98]"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={eloPair[1]!.cover}
                          alt={`Album cover for ${eloPair[1]!.title}`}
                          fill
                          className="rounded-[16px] object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-w-768px) 100vw, 500px"
                          quality={85}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-6 left-6 right-6 text-left text-white opacity-0 transition-all group-hover:opacity-100">
                          <p className="line-clamp-1 text-xl font-black uppercase tracking-tighter">
                            {eloPair[1]!.title}
                          </p>
                          <p className="text-xs font-bold opacity-70">
                            {eloPair[1]!.artist}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="col-span-11 flex h-[400px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-border/40 bg-secondary/5">
                  <Loader2
                    className="h-10 w-10 animate-spin text-primary/40"
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Finding worthy opponents...
                  </p>
                </div>
              )}
            </div>

            <div className="mt-12 flex gap-4">
              <Button
                variant="outline"
                className="rounded-full px-8 font-black uppercase tracking-widest"
                onClick={handleSkipMatchup}
                disabled={isEloLoading}
              >
                SKIP MATCHUP
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
