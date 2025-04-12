// hooks/useWatchlist.ts
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { IMovie } from "@/db/models/Movie";

// hooks/useWatchlist.ts

export const useWatchlist = (userId?: string) => {
  const { data: watchlist, error } = useSWR(
    userId ? `/api/movies/watchlist?userid=${userId}` : null,
    fetcher
  );

  const addToWatchlist = async (movieId: number) => {
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

  const removeFromWatchlist = async (movieId: number) => {
    if (!userId || !movieId) return;

    const res = await fetch("/api/movies/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, movieId }),
    });

    if (res.ok) {
      mutate(`/api/movies/watchlist?userid=${userId}`);
    } else {
      console.error("Failed to remove from watchlist");
    }
  };

  function isInWatchlist(movieId: number): boolean {
    if (watchlist) {
      return watchlist.some(function (movie: IMovie) {
        return movie._id === movieId;
      });
    } else {
      return false;
    }
  }

  return {
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isLoading: !watchlist && !error,
    error,
  };
};
