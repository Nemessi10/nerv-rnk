import { refreshAccessToken } from "~/lib/spotify-refresh";
import { clearSpotifyAuth } from "~/lib/auth-utils";

const getValidToken = async () => {
  const token = localStorage.getItem("spotify_access_token");
  const expiresAtRaw = localStorage.getItem("spotify_expires_at");

  if (!token || !expiresAtRaw) return null;

  const expiresAt = Number(expiresAtRaw);

  if (Date.now() < expiresAt - 5000) {
    return token;
  }

  return await refreshAccessToken();
};

export const spotifyRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  let token = localStorage.getItem("spotify_access_token");

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const makeRequest = (t: string) =>
    fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${t}`,
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

  let res = await makeRequest(token);

  if (res.status === 401) {
    console.log("🔄 Token expired → trying refresh");

    try {
      token = await refreshAccessToken();
    } catch (err) {
      console.log("Refresh failed → logout");

      clearSpotifyAuth();
      window.location.href = "/";

      throw err;
    }

    console.log("🔁 Retrying request with new token");

    res = await makeRequest(token);
  }

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status}`);
  }

  return res.json();
};
