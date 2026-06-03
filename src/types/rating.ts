export interface RecentRating {
  id: string;
  albumId: string;
  title: string;
  artist: string;
  cover: string | null;
  genre: string | null;
  rating: number;
  createdAt: string;
}
