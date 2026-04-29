import { spotifyRequest } from "./api";
import type { Album } from "./types";

type SpotifyResponse = {
  items: any[];
  next: string | null;
};

export const getAllUserAlbums = async (): Promise<Album[]> => {
  let offset = 0;
  const limit = 50;

  const allAlbums: Album[] = [];

  while (true) {
    const data = await spotifyRequest<SpotifyResponse>(
      `/me/albums?limit=${limit}&offset=${offset}`
    );

    const mapped = data.items.map((item) => ({
      id: item.album.id,
      title: item.album.name,
      artist: item.album.artists.map((a: any) => a.name).join(", "),
      cover: item.album.images?.[0]?.url ?? "",
      year: item.album.release_date?.slice(0, 4) ?? "",
    }));

    allAlbums.push(...mapped);

    if (!data.next) break;

    offset += limit;
  }

  return allAlbums;
};
