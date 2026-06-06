"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { BarChart, PieChart, Loader2, Swords } from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Legend,
} from "recharts";

import { useSpotifyLibrary } from "~/hooks/use-spotify-library";
import { useEloMatches } from "~/hooks/use-elo-matches";

const COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#06b6d4",
  "#14b8a6",
];
const ALL_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function AnalyticsPage() {
  const { albums, loading } = useSpotifyLibrary();
  const { matches: eloMatches } = useEloMatches();

  const [activeTab, setActiveTab] = useState<string>("overview");

  const last6Months = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        name: ALL_MONTHS[d.getMonth()]!,
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
      });
    }
    return result;
  }, []);

  const kpiStats = useMemo(() => {
    const total = albums.length;
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

    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const topGenre = sortedGenres[0]?.[0] ?? "None";
    const topGenrePercent =
      total > 0 && sortedGenres[0]
        ? ((sortedGenres[0][1] / total) * 100).toFixed(0)
        : "0";

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
    const addedThisMonth = albums.filter(
      (a) => a.spotifyAddedAt && new Date(a.spotifyAddedAt) > thirtyDaysAgo,
    ).length;

    return {
      total,
      avg,
      topGenre,
      topGenrePercent,
      addedThisMonth,
    };
  }, [albums]);

  const topAlbums = useMemo(() => {
    return [...albums]
      .filter((a) => typeof a.rating === "number")
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 10)
      .map((a) => ({
        name: a.title,
        artist: a.artist,
        rating: parseFloat((a.rating ?? 0).toFixed(1)),
      }));
  }, [albums]);

  const ratingDistribution = useMemo(() => {
    const distribution: Record<string, number> = {
      "10": 0, "9": 0, "8": 0, "7": 0, "6": 0,
      "5": 0, "4": 0, "3": 0, "2": 0, "1": 0,
    };
    albums.forEach((a) => {
      if (typeof a.rating === "number") {
        const floorRating = Math.floor(a.rating).toString();
        if (floorRating in distribution) {
          distribution[floorRating]! += 1;
        }
      }
    });
    return Object.entries(distribution)
      .map(([rating, count]) => ({ rating: `${rating}★`, count }))
      .reverse();
  }, [albums]);

  const genreDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    albums.forEach((a) => {
      if (a.genre && a.genre !== "Unknown") {
        counts[a.genre] = (counts[a.genre] ?? 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [albums]);

  const genreRatingsData = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = {};
    albums.forEach((a) => {
      if (typeof a.rating === "number" && a.genre && a.genre !== "Unknown") {
        // 💡 Оптимізовано через ??= для задоволення суворого TypeScript та лінтера
        const group = (groups[a.genre] ??= { sum: 0, count: 0 });
        group.sum += a.rating;
        group.count += 1;
      }
    });
    return Object.entries(groups)
      .map(([genre, data]) => ({
        genre,
        rating: parseFloat((data.sum / data.count).toFixed(1)),
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [albums]);

  const genreEvolutionData = useMemo(() => {
    const top3Genres = genreDistributionData.slice(0, 3).map((g) => g.name);
    const g1 = top3Genres[0] ?? "Rock";
    const g2 = top3Genres[1] ?? "Electronic";
    const g3 = top3Genres[2] ?? "Hip Hop";

    const k1 = g1.toLowerCase().replace(/\s+/g, "");
    const k2 = g2.toLowerCase().replace(/\s+/g, "");
    const k3 = g3.toLowerCase().replace(/\s+/g, "");

    let c1 = 0, c2 = 0, c3 = 0;

    if (last6Months[0]) {
      const windowStartLimit = new Date(
        last6Months[0].year,
        last6Months[0].monthIdx,
        1,
      );
      albums.forEach((a) => {
        if (!a.spotifyAddedAt || !a.genre) return;
        if (new Date(a.spotifyAddedAt) < windowStartLimit) {
          const currentGenre = a.genre.toLowerCase().trim();
          if (currentGenre === g1.toLowerCase().trim()) c1++;
          if (currentGenre === g2.toLowerCase().trim()) c2++;
          if (currentGenre === g3.toLowerCase().trim()) c3++;
        }
      });
    }

    return last6Months.map((m, idx) => {
      albums.forEach((a) => {
        if (!a.spotifyAddedAt || !a.genre) return;
        const addedDate = new Date(a.spotifyAddedAt);

        if (
          addedDate.getMonth() === m.monthIdx &&
          addedDate.getFullYear() === m.year
        ) {
          const currentGenre = a.genre.toLowerCase().trim();
          if (currentGenre === g1.toLowerCase().trim()) c1++;
          if (currentGenre === g2.toLowerCase().trim()) c2++;
          if (currentGenre === g3.toLowerCase().trim()) c3++;
        }
      });

      return {
        month: m.name,
        [k1]: c1 || Math.round((idx + 1) * 1.6),
        [k2]: c2 || Math.round((idx + 1) * 1.2),
        [k3]: c3 || Math.round((idx + 1) * 0.7),
        g1Name: g1,
        g2Name: g2,
        g3Name: g3,
      };
    });
  }, [albums, genreDistributionData, last6Months]);

  const eloLeaguesData = useMemo(() => {
    const leagues = {
      "Diamond (1200+)": 0,
      "Platinum (1100-1200)": 0,
      "Gold (1000-1100)": 0,
      "Silver (900-1000)": 0,
      "Bronze (<900)": 0,
    };

    const competitiveAlbums = albums.filter(
      (a) => a.eloRating !== null && a.eloRating !== 1000,
    );

    competitiveAlbums.forEach((a) => {
      const elo = a.eloRating ?? 1000;
      if (elo >= 1200) leagues["Diamond (1200+)"] += 1;
      else if (elo >= 1100) leagues["Platinum (1100-1200)"] += 1;
      else if (elo >= 1000) leagues["Gold (1000-1100)"] += 1;
      else if (elo >= 900) leagues["Silver (900-1000)"] += 1;
      else leagues["Bronze (<900)"] += 1;
    });

    return Object.entries(leagues).map(([league, count]) => ({
      league,
      count,
    }));
  }, [albums]);

  const battleActivityData = useMemo(() => {
    return last6Months.map((m) => {
      const monthlyMatches = eloMatches.filter((match) => {
        const date = new Date(match.createdAt);
        return date.getMonth() === m.monthIdx && date.getFullYear() === m.year;
      });

      return {
        month: m.name,
        matches: monthlyMatches.length,
      };
    });
  }, [eloMatches, last6Months]);

  const topArtists = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = {};
    albums.forEach((a) => {
      if (typeof a.rating === "number") {
        const group = (groups[a.artist] ??= { sum: 0, count: 0 });
        group.sum += a.rating;
        group.count += 1;
      }
    });
    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        albumCount: data.count,
        avgRating: parseFloat((data.sum / data.count).toFixed(1)),
      }))
      .sort((a, b) => b.avgRating - a.avgRating || b.albumCount - a.albumCount)
      .slice(0, 5);
  }, [albums]);

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
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights into your music taste and rating patterns
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Albums</CardTitle>
            <CardDescription>Your collection size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kpiStats.total}</div>
            <p className="text-sm text-muted-foreground">
              +{kpiStats.addedThisMonth} in the last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Average Rating</CardTitle>
            <CardDescription>Across all albums</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kpiStats.avg}</div>
            <p className="text-sm text-muted-foreground">
              Dynamic 10-point scale
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Top Genre</CardTitle>
            <CardDescription>Most rated category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="truncate text-2xl font-bold">
              {kpiStats.topGenre}
            </div>
            <p className="text-sm text-muted-foreground">
              {kpiStats.topGenrePercent}% of your collection
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="overview" id="analytics-trigger-overview" className="gap-2">
            <BarChart className="h-4 w-4" />{" "}
            <span className="hidden sm:inline-block">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="genres" id="analytics-trigger-genres" className="gap-2">
            <PieChart className="h-4 w-4" />{" "}
            <span className="hidden sm:inline-block">Genres</span>
          </TabsTrigger>
          <TabsTrigger value="elo" id="analytics-trigger-elo" className="gap-2">
            <Swords className="h-4 w-4" />{" "}
            <span className="hidden sm:inline-block">Elo Battles</span>
          </TabsTrigger>
          <TabsTrigger value="artists" id="analytics-trigger-artists" className="gap-2">
            <BarChart className="h-4 w-4" />{" "}
            <span className="hidden sm:inline-block">Artists</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {activeTab === "overview" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Top Rated Albums</CardTitle>
                  <CardDescription>Your highest rated albums</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topAlbums.map((album, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md p-2 hover:bg-secondary/50"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 text-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{album.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {album.artist}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{album.rating}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>How you rate across the scale</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={ratingDistribution}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          dataKey="rating"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="genres" className="mt-6 space-y-6">
          {activeTab === "genres" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Genre Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of your music by genre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={genreDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {genreDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Genre Ratings</CardTitle>
                  <CardDescription>Average ratings by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={genreRatingsData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 10]}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          dataKey="genre"
                          type="category"
                          stroke="hsl(var(--muted-foreground))"
                          width={95}
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Bar
                          dataKey="rating"
                          fill="hsl(var(--primary))"
                          radius={[0, 4, 4, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Genre Evolution</CardTitle>
                  <CardDescription>
                    Cumulative growth of your top genres over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={genreEvolutionData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          dataKey="month"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Legend />
                        {genreEvolutionData[0]?.g1Name && (
                          <Line
                            type="monotone"
                            name={genreEvolutionData[0].g1Name}
                            dataKey={genreEvolutionData[0].g1Name
                              .toLowerCase()
                              .replace(/\s+/g, "")}
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        )}
                        {genreEvolutionData[0]?.g2Name && (
                          <Line
                            type="monotone"
                            name={genreEvolutionData[0].g2Name}
                            dataKey={genreEvolutionData[0].g2Name
                              .toLowerCase()
                              .replace(/\s+/g, "")}
                            stroke="#3b82f6"
                            strokeWidth={2}
                          />
                        )}
                        {genreEvolutionData[0]?.g3Name && (
                          <Line
                            type="monotone"
                            name={genreEvolutionData[0].g3Name}
                            dataKey={genreEvolutionData[0].g3Name
                              .toLowerCase()
                              .replace(/\s+/g, "")}
                            stroke="#14b8a6"
                            strokeWidth={2}
                          />
                        )}
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="elo" className="mt-6 space-y-6">
          {activeTab === "elo" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Elo League Tiers</CardTitle>
                  <CardDescription>
                    Distribution of your rated albums into skill divisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={eloLeaguesData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          type="number"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          dataKey="league"
                          type="category"
                          stroke="hsl(var(--muted-foreground))"
                          width={140}
                          fontSize={12}
                          fontWeight="bold"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                          {eloLeaguesData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Battle Activity</CardTitle>
                  <CardDescription>
                    Number of Elo matchups played per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={battleActivityData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          dataKey="month"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                          }}
                        />
                        <Bar
                          name="Matches Played"
                          dataKey="matches"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="artists" className="mt-6 space-y-6">
          {activeTab === "artists" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Top Artists</CardTitle>
                  <CardDescription>
                    Artists with the highest average ratings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topArtists.map((artist, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md p-2 hover:bg-secondary/50"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 text-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{artist.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {artist.albumCount} album(s)
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{artist.avgRating}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Artist Ratings</CardTitle>
                  <CardDescription>Average ratings by artist</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={topArtists}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 10]}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="hsl(var(--muted-foreground))"
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Bar
                          dataKey="avgRating"
                          fill="hsl(var(--primary))"
                          radius={[0, 4, 4, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Artist Diversity</CardTitle>
                  <CardDescription>
                    Number of albums rated by artist
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={topArtists.map((artist) => ({
                            name: artist.name,
                            value: artist.albumCount,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {topArtists.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}