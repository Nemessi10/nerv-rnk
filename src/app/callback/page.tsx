"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { spotifyAuth } from "~/lib/spotify/spotify-auth";
import { useAuthStore } from "~/stores/auth-store";
import { spotifyApi } from "~/lib/spotify/spotify-api";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const init = useAuthStore((s) => s.init);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    const code = searchParams.get("code");
    if (!code) return;

    isMounted.current = true;

    const handle = async () => {
      try {
        await spotifyAuth.handleCallback(code);
        spotifyApi.clearCache();
        await init();
        router.push("/");
      } catch (err) {
        console.error("CALLBACK ERROR:", err);
        router.push("/");
      }
    };

    handle();
  }, [searchParams, init, router]);

  return <div className="flex min-h-screen items-center justify-center">Connecting Spotify...</div>;
}