import { useState, useEffect } from "react";

export interface DBRatingShortcut {
  albumId: string;
  rating: number;
}

export function useRecentRatings(isLoggedIn: boolean) {
  const [recentRatings, setRecentRatings] = useState<DBRatingShortcut[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    fetch("/api/ratings/recent")
      .then((res) => res.json())
      .then((data: DBRatingShortcut[]) => {
        if (Array.isArray(data)) setRecentRatings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoggedIn]);

  return { recentRatings, loading };
}
