export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
  
    if (!refreshToken) {
      throw new Error("NO_REFRESH_TOKEN");
    }
  
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
  
    const data = await res.json();
  
    if (!res.ok || !data.access_token) {
      throw new Error("REFRESH_FAILED");
    }
  
    const expiresAt = Date.now() + data.expires_in * 1000;
  
    localStorage.setItem("spotify_access_token", data.access_token);
    localStorage.setItem("spotify_expires_at", expiresAt.toString());
  
    if (data.refresh_token) {
      localStorage.setItem("spotify_refresh_token", data.refresh_token);
    }
  
    return data.access_token;
  };
  