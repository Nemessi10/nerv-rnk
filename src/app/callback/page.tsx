"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { spotifyAuth } from "~/lib/spotify/spotify-auth";
import { useAuthStore } from "~/stores/auth-store";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) return;

    const handle = async () => {
      try {
        await spotifyAuth.handleCallback(code);

        await init();

        router.push("/library");
      } catch (err) {
        console.error("CALLBACK ERROR:", err);
        router.push("/");
      }
    };

    handle();
  }, [searchParams, init, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      Connecting Spotify...
    </div>
  );
}