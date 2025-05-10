import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Disc3, Plus, Star, TrendingUp } from "lucide-react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";

// Mock data for trending albums
const trendingAlbums = [
  {
    id: 1,
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    cover: "/placeholder.svg?height=300&width=300",
    year: 1973,
    genre: "Progressive Rock",
    rating: 9.2,
  },
  {
    id: 2,
    title: "OK Computer",
    artist: "Radiohead",
    cover: "/placeholder.svg?height=300&width=300",
    year: 1997,
    genre: "Alternative Rock",
    rating: 9.5,
  },
  {
    id: 3,
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2015,
    genre: "Hip Hop",
    rating: 9.3,
  },
  {
    id: 4,
    title: "Kid A",
    artist: "Radiohead",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2000,
    genre: "Electronic",
    rating: 9.0,
  },
  {
    id: 5,
    title: "Vespertine",
    artist: "Björk",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2001,
    genre: "Electronic",
    rating: 8.8,
  },
];

// Mock data for recently rated albums
const recentlyRated = [
  {
    id: 6,
    title: "Blonde",
    artist: "Frank Ocean",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2016,
    genre: "R&B",
    rating: 9.1,
    ratedAt: "2 hours ago",
  },
  {
    id: 7,
    title: "Currents",
    artist: "Tame Impala",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2015,
    genre: "Psychedelic Pop",
    rating: 8.7,
    ratedAt: "Yesterday",
  },
  {
    id: 8,
    title: "In Rainbows",
    artist: "Radiohead",
    cover: "/placeholder.svg?height=300&width=300",
    year: 2007,
    genre: "Alternative Rock",
    rating: 9.4,
    ratedAt: "3 days ago",
  },
];

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your music universe.
          </p>
        </div>
        <Button className="gap-2 bg-accent hover:bg-accent/90" size="lg">
          <Plus className="h-4 w-4" />
          Rate a new album
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-no-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Your Library</CardTitle>
            <CardDescription>{`You've rated 127 albums so far`}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc3 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Average Rating</p>
                  <p className="text-2xl font-bold">8.4</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm font-medium">Top Genre</p>
                  <p className="text-lg font-medium">Alternative</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="btn-no-border w-full hover:bg-secondary/20"
              asChild
            >
              <Link href="/library">View Library</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="card-no-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Listening Trends</CardTitle>
            <CardDescription>Your music taste is evolving</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Electronic</span>
                <span className="text-sm text-muted-foreground">+12%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary/30">
                <div className="h-2 w-[65%] rounded-full bg-primary"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hip Hop</span>
                <span className="text-sm text-muted-foreground">+8%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary/30">
                <div className="h-2 w-[45%] rounded-full bg-accent"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Indie Rock</span>
                <span className="text-sm text-muted-foreground">-3%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary/30">
                <div className="h-2 w-[30%] rounded-full bg-secondary"></div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="btn-no-border w-full hover:bg-secondary/20"
              asChild
            >
              <Link href="/analytics">View Analytics</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="card-no-border bg-card md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Feeling Undecided?</CardTitle>
            <CardDescription>
              Let us help you pick something to rate
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid gap-2">
              <Button
                variant="secondary"
                className="btn-no-border justify-start gap-2 bg-secondary/70 hover:bg-secondary"
              >
                <TrendingUp className="h-4 w-4" />
                Random album from your collection
              </Button>
              <Button
                variant="secondary"
                className="btn-no-border justify-start gap-2 bg-secondary/70 hover:bg-secondary"
              >
                <TrendingUp className="h-4 w-4" />
                {`Something you haven't listened to in a while`}
              </Button>
              <Button
                variant="secondary"
                className="btn-no-border justify-start gap-2 bg-secondary/70 hover:bg-secondary"
              >
                <TrendingUp className="h-4 w-4" />
                Explore a new genre: Jazz
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="btn-no-border w-full hover:bg-secondary/20"
              asChild
            >
              <Link href="/rate">Go to Rating Page</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="trending">
          <div className="flex items-center justify-between">
            <TabsList className="tab-no-border bg-secondary/30">
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Trending Albums
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Recently Rated
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/library">View All</Link>
            </Button>
          </div>

          <TabsContent value="trending" className="mt-4">
            <ScrollArea className="pb-4">
              <div className="flex gap-4">
                {trendingAlbums.map((album) => (
                  <Link
                    href={`/album/${album.id}`}
                    key={album.id}
                    className="min-w-[200px] max-w-[200px]"
                  >
                    <Card className="album-card glow-primary overflow-hidden bg-card">
                      <div className="aspect-square overflow-hidden">
                        <Image
                          src={album.cover || "/placeholder.svg"}
                          alt={album.title}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover transition-all hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <h3 className="line-clamp-1 font-medium">
                            {album.title}
                          </h3>
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {album.artist}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className="border-0 bg-secondary/70 text-xs hover:bg-secondary"
                            >
                              {album.genre}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-accent text-accent" />
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
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyRated.map((album) => (
                <Card
                  key={album.id}
                  className="card-no-border overflow-hidden bg-card"
                >
                  <div className="flex gap-3 p-3">
                    <Image
                      src={album.cover || "/placeholder.svg"}
                      alt={album.title}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="line-clamp-1 font-medium">
                          {album.title}
                        </h3>
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {album.artist}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-0 text-xs">
                          {album.genre}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          <span className="text-xs font-medium">
                            {album.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-secondary/10 px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      Rated {album.ratedAt}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
