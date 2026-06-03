import type { LastFmTopTagsResponse } from "~/types/lastfm";

const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY!;

class LastFmApiService {
  BASE_URL = "https://ws.audioscrobbler.com/2.0/";

  private artistTagsCache = new Map<string, string[]>();

  async request(params: Record<string, string>): Promise<unknown> {
    const search = new URLSearchParams({
      api_key: API_KEY,
      format: "json",
      ...params,
    });

    const res = await fetch(`${this.BASE_URL}?${search.toString()}`);

    if (!res.ok) {
      throw new Error("Last.fm API error");
    }

    return res.json() as Promise<unknown>;
  }

  async getArtistTags(artist: string): Promise<string[]> {
    if (this.artistTagsCache.has(artist)) {
      return this.artistTagsCache.get(artist)!;
    }
    const data = (await this.request({
      method: "artist.getTopTags",
      artist,
    })) as LastFmTopTagsResponse;

    const tags = data?.toptags?.tag?.map((tag) => tag.name) ?? [];
    this.artistTagsCache.set(artist, tags);
    return tags;
  }
}

export const lastFmApi = new LastFmApiService();
