export type Track = {
  id: string;
  title: string;
  durationMs: number;
};

export type AppAlbum = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  cover: string;
  year: string;
  genre?: string;
  subgenres?: string[];
  spotifyAddedAt?: string | null;
  lastPlayedAt?: string | null;
  rating?: number;
  eloRating?: number;
  moods?: string[];
};

export type AlbumDetails = AppAlbum & {
  tracks: Track[];
  totalTracks: number;
};
