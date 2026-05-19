import Cookies from "js-cookie";

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

const STORAGE_KEY = "spotify_pkce_verifier";
const ACCESS_TOKEN_KEY = "spotify_access_token";
const REFRESH_TOKEN_KEY = "spotify_refresh_token";
const EXPIRES_AT_KEY = "spotify_expires_at";
const COOKIE_ACCESS_TOKEN = "spotify_at";

const SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-library-read",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative",
];

class SpotifyAuthService {
  private refreshPromise: Promise<string | null> | null = null;
  private static instance: SpotifyAuthService;

  static getInstance() {
    if (!SpotifyAuthService.instance) {
      SpotifyAuthService.instance = new SpotifyAuthService();
    }
    return SpotifyAuthService.instance;
  }

  private generateRandomString(length: number) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((x) => chars[x % chars.length])
      .join("");
  }

  private async sha256(plain: string) {
    const encoder = new TextEncoder();
    return crypto.subtle.digest("SHA-256", encoder.encode(plain));
  }

  private base64encode(input: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async initAuth() {
    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const refresh_token = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    const expiresAt = sessionStorage.getItem(EXPIRES_AT_KEY);

    if (token && expiresAt && Date.now() < Number(expiresAt)) {
      return token;
    }

    if (refresh_token) {
      return await this.refreshAccessToken();
    }

    return null;
  }

  async login() {
    const verifier = this.generateRandomString(64);

    sessionStorage.setItem(STORAGE_KEY, verifier);

    const hashed = await this.sha256(verifier);
    const challenge = this.base64encode(hashed);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      redirect_uri: REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleCallback(code: string) {
    const verifier = sessionStorage.getItem(STORAGE_KEY);

    if (!verifier) {
      throw new Error(
        "Missing PKCE code verifier. User must restart login flow.",
      );
    }

    const response = await fetch("/api/auth/spotify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        codeVerifier: verifier,
        redirectUri: REDIRECT_URI,
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error("[SpotifyAuth ERROR]:", raw);
      throw new Error(`Spotify auth failed: ${raw}`);
    }

    const data = JSON.parse(raw);

    sessionStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    sessionStorage.setItem(
      EXPIRES_AT_KEY,
      String(Date.now() + data.expires_in * 1000),
    );

    Cookies.set(COOKIE_ACCESS_TOKEN, data.access_token, { expires: 1 / 24 });

    await fetch("/api/auth/sync-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: data.access_token,
      }),
    });

    sessionStorage.removeItem(STORAGE_KEY);

    return data;
  }

  async getAccessToken() {
    if (typeof window === "undefined") {
      return null;
    }

    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const expiresAt = sessionStorage.getItem(EXPIRES_AT_KEY);

    if (!token || !expiresAt) return null;

    const isExpired = Date.now() >= Number(expiresAt) - 60_000;

    if (isExpired) {
      const newToken = await this.refreshAccessToken();
      return newToken;
    }
    return token;
  }

  async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      console.log("♻️ Refresh in progress, waiting...");
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        console.log("🚀 Starting new refresh token request...");
        
        const currentRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);

        if (!currentRefreshToken) {
          throw new Error("No refresh token available in storage");
        }

        const res = await fetch("/api/auth/spotify/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: currentRefreshToken,
          }),
        });

        if (!res.ok) throw new Error("Refresh failed");

        const data = await res.json();
        const newToken = data.access_token;

        if (typeof window !== "undefined") {
          sessionStorage.setItem(ACCESS_TOKEN_KEY, newToken);
          if (data.refresh_token) {
            sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
          }
          
          sessionStorage.setItem(
            EXPIRES_AT_KEY,
            String(Date.now() + data.expires_in * 1000)
          );
          Cookies.set(COOKIE_ACCESS_TOKEN, newToken, { expires: 1 / 24 });
        }

        return newToken;
      } catch (error) {
        console.error("AUTH REFRESH ERROR:", error);
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  logout() {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      Cookies.remove(COOKIE_ACCESS_TOKEN);
    }

    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_AT_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = "/";
  }

  isAuthenticated() {
    return !!sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }
}

export const spotifyAuth = SpotifyAuthService.getInstance();
