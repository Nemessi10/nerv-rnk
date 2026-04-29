"use client";

import { useEffect, useRef } from "react";

export default function CallbackPage() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const getToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      const verifier = localStorage.getItem("code_verifier");

      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
          grant_type: "authorization_code",
          code: code!,
          redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
          code_verifier: verifier!,
        }),
      });

      const data = await res.json();

      console.log("TOKEN:", JSON.stringify(data, null, 2));

      localStorage.setItem("access_token", data.access_token);

      const profileRes = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      
      const profile = await profileRes.json();
      
      console.log("PROFILE:", JSON.stringify(profile, null, 2));
      
    };

    getToken();
  }, []);

  return <div className="p-10">Authorizing...</div>;
}
