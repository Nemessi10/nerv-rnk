const getToken = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("spotify_access_token");
};

export const spotifyRequest = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const token = getToken();

  if (!token) {
    throw new Error("No Spotify access token found");
  }

  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status}`);
  }

  return res.json();
};
