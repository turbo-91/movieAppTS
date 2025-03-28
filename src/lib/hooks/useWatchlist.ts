// hooks/useWatchlist.ts
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { IMovie } from "@/db/models/Movie";

export const useWatchlist = (userId?: string, movieId?: number) => {
  const { data: watchlist, error } = useSWR(
    userId ? `/api/movies/watchlist?userid=${userId}` : null,
    fetcher
  );

  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    if (watchlist && Array.isArray(watchlist) && movieId) {
      setIsInWatchlist(watchlist.some((m: IMovie) => m._id === movieId));
    }
  }, [watchlist, movieId]);

  const addToWatchlist = async () => {
    if (!userId || !movieId) return;

    const res = await fetch("/api/movies/watchlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, movieId }),
    });

    if (res.ok) {
      mutate(`/api/movies/watchlist?userid=${userId}`);
    } else {
      console.error("Failed to add to watchlist");
    }
  };

  const removeFromWatchlist = async (onSuccess?: () => void) => {
    if (!userId || !movieId) return;

    const res = await fetch("/api/movies/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, movieId }),
    });

    if (res.ok) {
      mutate(`/api/movies/watchlist?userid=${userId}`);
      if (typeof onSuccess === "function") {
        onSuccess(); // puhs component
      }
    } else {
      console.error("Failed to remove from watchlist");
    }
  };

  return {
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isLoading: !watchlist && !error,
    error,
  };
};
