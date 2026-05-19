import { useState, useEffect } from "react";
import type { EloMatch } from "~/types/elo";

export function useEloMatches() {
  const [matches, setMatches] = useState<EloMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/elo/matches")
      .then((res) => res.json())
      .then((data: EloMatch[]) => {
        setMatches(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { matches, loading };
}