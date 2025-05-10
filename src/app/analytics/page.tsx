"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { BarChart, LineChart, PieChart } from "lucide-react";
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

// Mock data for analytics
const topAlbums = [
  {
    name: "My Beautiful Dark Twisted Fantasy",
    artist: "Kanye West",
    rating: 9.6,
  },
  { name: "OK Computer", artist: "Radiohead", rating: 9.5 },
  { name: "In Rainbows", artist: "Radiohead", rating: 9.4 },
  { name: "To Pimp a Butterfly", artist: "Kendrick Lamar", rating: 9.3 },
  { name: "Loveless", artist: "My Bloody Valentine", rating: 9.3 },
  { name: "The Dark Side of the Moon", artist: "Pink Floyd", rating: 9.2 },
  { name: "Madvillainy", artist: "Madvillain", rating: 9.2 },
  { name: "Blonde", artist: "Frank Ocean", rating: 9.1 },
  { name: "Kid A", artist: "Radiohead", rating: 9.0 },
  { name: "Rumours", artist: "Fleetwood Mac", rating: 9.0 },
];

const genreData = [
  { name: "Alternative Rock", value: 35 },
  { name: "Hip Hop", value: 25 },
  { name: "Electronic", value: 15 },
  { name: "R&B", value: 10 },
  { name: "Rock", value: 8 },
  { name: "Psychedelic Pop", value: 7 },
];

const COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#06b6d4",
  "#14b8a6",
];

const ratingDistribution = [
  { rating: "10", count: 5 },
  { rating: "9", count: 15 },
  { rating: "8", count: 30 },
  { rating: "7", count: 40 },
  { rating: "6", count: 20 },
  { rating: "5", count: 10 },
  { rating: "4", count: 5 },
  { rating: "3", count: 2 },
  { rating: "2", count: 0 },
  { rating: "1", count: 0 },
];

const ratingTrend = [
  { month: "Jan", avgRating: 7.8 },
  { month: "Feb", avgRating: 7.9 },
  { month: "Mar", avgRating: 8.1 },
  { month: "Apr", avgRating: 8.0 },
  { month: "May", avgRating: 8.2 },
  { month: "Jun", avgRating: 8.3 },
  { month: "Jul", avgRating: 8.4 },
  { month: "Aug", avgRating: 8.5 },
  { month: "Sep", avgRating: 8.4 },
  { month: "Oct", avgRating: 8.6 },
  { month: "Nov", avgRating: 8.7 },
  { month: "Dec", avgRating: 8.8 },
];

const topArtists = [
  { name: "Radiohead", albumCount: 3, avgRating: 9.3 },
  { name: "Kendrick Lamar", albumCount: 2, avgRating: 9.2 },
  { name: "Pink Floyd", albumCount: 2, avgRating: 9.1 },
  { name: "Björk", albumCount: 1, avgRating: 8.8 },
  { name: "Kanye West", albumCount: 1, avgRating: 9.6 },
];

export default function AnalyticsPage() {
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
            <div className="text-4xl font-bold">127</div>
            <p className="text-sm text-muted-foreground">
              +12 in the last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Average Rating</CardTitle>
            <CardDescription>Across all albums</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">8.4</div>
            <p className="text-sm text-muted-foreground">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Top Genre</CardTitle>
            <CardDescription>Most rated category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Alternative Rock</div>
            <p className="text-sm text-muted-foreground">
              35% of your collection
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline-block">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="genres" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline-block">Genres</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline-block">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="artists" className="gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline-block">Artists</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
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
                    <XAxis dataKey="rating" />
                    <YAxis />
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
        </TabsContent>

        <TabsContent value="genres" className="mt-6 space-y-6">
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
                        data={genreData}
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
                        {genreData.map((entry, index) => (
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
                <CardDescription>Average ratings by genre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { genre: "Alt Rock", rating: 8.7 },
                        { genre: "Hip Hop", rating: 8.9 },
                        { genre: "Electronic", rating: 8.2 },
                        { genre: "R&B", rating: 8.5 },
                        { genre: "Rock", rating: 7.9 },
                        { genre: "Psych Pop", rating: 8.3 },
                      ]}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis type="number" domain={[0, 10]} />
                      <YAxis dataKey="genre" type="category" />
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Genre Evolution</CardTitle>
              <CardDescription>
                How your genre preferences have changed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={[
                      { month: "Jan", rock: 30, electronic: 10, hiphop: 15 },
                      { month: "Feb", rock: 28, electronic: 12, hiphop: 18 },
                      { month: "Mar", rock: 27, electronic: 15, hiphop: 20 },
                      { month: "Apr", rock: 25, electronic: 18, hiphop: 22 },
                      { month: "May", rock: 24, electronic: 20, hiphop: 25 },
                      { month: "Jun", rock: 22, electronic: 22, hiphop: 28 },
                      { month: "Jul", rock: 20, electronic: 25, hiphop: 30 },
                      { month: "Aug", rock: 18, electronic: 28, hiphop: 32 },
                      { month: "Sep", rock: 17, electronic: 30, hiphop: 33 },
                      { month: "Oct", rock: 15, electronic: 32, hiphop: 35 },
                      { month: "Nov", rock: 13, electronic: 35, hiphop: 36 },
                      { month: "Dec", rock: 12, electronic: 38, hiphop: 38 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rock"
                      stroke="#8b5cf6"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="electronic"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="hiphop"
                      stroke="#06b6d4"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rating Trends</CardTitle>
              <CardDescription>
                How your average ratings have changed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={ratingTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="month" />
                    <YAxis domain={[7, 9]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgRating"
                      stroke="hsl(var(--primary))"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rating Activity</CardTitle>
              <CardDescription>
                Number of albums rated per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={[
                      { month: "Jan", count: 5 },
                      { month: "Feb", count: 8 },
                      { month: "Mar", count: 12 },
                      { month: "Apr", count: 10 },
                      { month: "May", count: 15 },
                      { month: "Jun", count: 18 },
                      { month: "Jul", count: 20 },
                      { month: "Aug", count: 15 },
                      { month: "Sep", count: 12 },
                      { month: "Oct", count: 10 },
                      { month: "Nov", count: 8 },
                      { month: "Dec", count: 6 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="month" />
                    <YAxis />
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
        </TabsContent>

        <TabsContent value="artists" className="mt-6 space-y-6">
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
                          {artist.albumCount} albums
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
                    <XAxis type="number" domain={[8, 10]} />
                    <YAxis dataKey="name" type="category" width={80} />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
