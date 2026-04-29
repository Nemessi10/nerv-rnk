"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Search, Star } from "lucide-react";

import { useSpotifyLibrary } from "~/hooks/use-spotify-library";

export default function LibraryPage() {
  const { albums, loading } = useSpotifyLibrary();

  const [searchQuery, setSearchQuery] = useState("");

  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading library...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Library</h1>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <Input
          placeholder="Search albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((album) => (
          <Link href={`/album/${album.id}`} key={album.id}>
            <Card>
              <Image
                src={album.cover}
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
    </div>
  );
}
