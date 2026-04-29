"use client";

import { useEffect, useRef } from "react";
import { setAccessToken } from "~/lib/spotify";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const hasRun = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const getToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        console.error("No authorization code found");
        return;
      }

      const verifier = localStorage.getItem("code_verifier");

      if (!verifier) {
        console.error("No code verifier found");
        return;
      }

      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
          code_verifier: verifier,
        }),
      });

      const data = await res.json();

      console.log("TOKEN:", data);

      if (!data.access_token) {
        console.error("Failed to get access token", data);
        return;
      }

      // ✅ 1. persist token
      setAccessToken(data.access_token);
      localStorage.setItem("spotify_access_token", data.access_token);

      if (data.refresh_token) {
        localStorage.setItem("spotify_refresh_token", data.refresh_token);
      }

      // optional cleanup
      localStorage.removeItem("code_verifier");

      // ✅ 2. test request (optional)
      const profileRes = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      const profile = await profileRes.json();
      console.log("PROFILE:", profile);

      // ✅ 3. IMPORTANT: redirect to app
      router.push("/library");
    };

    getToken();
  }, [router]);

  return <div className="p-10">Authorizing Spotify...</div>;
}
