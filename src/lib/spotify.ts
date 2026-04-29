export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
  
    return localStorage.getItem("access_token");
  }
  
  export function setAccessToken(token: string) {
    if (typeof window === "undefined") return;
  
    localStorage.setItem("access_token", token);
  }
  
  export function clearAccessToken() {
    if (typeof window === "undefined") return;
  
    localStorage.removeItem("access_token");
  }
  
  export async function spotifyFetch<T = any>(endpoint: string): Promise<T> {
    const token = getAccessToken();
  
    if (!token) {
      throw new Error("No Spotify access token found");
    }
  
    const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || "Spotify API error");
    }
  
    return res.json();
  }
  