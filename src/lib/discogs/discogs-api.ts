import type { DiscogsSearchResult } from "~/types/discogs";

const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN!;

class DiscogsApiService {
  private BASE_URL = "https://api.discogs.com";

  // Discogs requires a unique User-Agent to identify application
  private headers = {
    Authorization: `Discogs token=${DISCOGS_TOKEN}`,
    "User-Agent": "NervRnkMusicRatingApp/1.0",
  };

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAlbumGenres(
    artist: string,
    albumTitle: string,
    retryCount?: number
  ): Promise<{ genre: string; subgenres: string[] }> {
    const currentRetry = retryCount ?? 0;

    try {
      const query = new URLSearchParams({
        type: "release",
        artist: artist,
        release_title: albumTitle,
        per_page: "1",
      });

      const res = await fetch(
        `${this.BASE_URL}/database/search?${query.toString()}`,
        {
          headers: this.headers,
        },
      );

      if (res.status === 429) {
        console.warn(
          `[Discogs API] Rate Limit hit for ${artist} - ${albumTitle}.`,
        );

        if (currentRetry < 3) {
          const resetHeader = res.headers.get("X-Discogs-Ratelimit-Reset");
          const waitTimeSeconds = resetHeader ? Number(resetHeader) : 3;

          console.log(
            `[Discogs API] Waiting ${waitTimeSeconds}s before retry #${currentRetry + 1}...`,
          );
          await this.sleep(waitTimeSeconds * 1000);

          return this.getAlbumGenres(artist, albumTitle, currentRetry + 1);
        }

        console.error(
          `[Discogs API] Max retries reached for ${artist} - ${albumTitle}.`,
        );
        return { genre: "Unknown", subgenres: [] };
      }

      if (!res.ok) {
        throw new Error(`Discogs API error: ${res.status}`);
      }

      const data = (await res.json()) as DiscogsSearchResult;
      const firstResult = data.results?.[0];

      const genre = firstResult?.genre?.join(" / ") ?? "Unknown";
      const subgenres = firstResult?.style ?? [];

      return { genre, subgenres };
    } catch (error) {
      console.error(
        `Failed to fetch Discogs tags for ${artist} - ${albumTitle}:`,
        error,
      );
      return { genre: "Unknown", subgenres: [] };
    }
  }
}

export const discogsApi = new DiscogsApiService();
