"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/use-auth";

export default function CallbackPage() {
  const hasRun = useRef(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        console.error("No code");
        return;
      }

      const verifier = sessionStorage.getItem("code_verifier");

      if (!verifier) {
        console.error("Missing code_verifier");
        router.replace("/");
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

      if (!data.access_token) {
        console.error(data);
        return;
      }

      await login(data.access_token);

      sessionStorage.removeItem("code_verifier");

      router.replace("/library");
    };

    run();
  }, [login, router]);

  return <div className="p-10">Authorizing...</div>;
}
