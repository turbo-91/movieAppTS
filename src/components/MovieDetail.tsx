import { IMovie } from "@/db/models/Movie";
import movieThumbnail from "/public/movieThumbnail.png";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { mutate } from "swr";
import { useEffect } from "react";

interface MovieDetailProps {
  movie: IMovie;
  onBack: () => void;
}

export default function MovieDetail({ movie, onBack }: MovieDetailProps) {
  // Session and Watchlist
  const { data: session } = useSession();
  const userId = session?.user?.userId; // check custom nextAuth type in types folder that ensures type safety in combination with nextAuth

  const { data: watchlist, error } = useSWR(
    userId ? `/api/movies/watchlist?userid=${userId}` : null,
    fetcher
  );

  useEffect(() => {
    if (watchlist && Array.isArray(watchlist)) {
      setIsInWatchlist(watchlist.some((m: IMovie) => m._id === movie._id));
    }
  }, [watchlist, movie._id]);

  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const addToWatchlist = async () => {
    if (!userId) return;

    const res = await fetch("/api/movies/watchlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, movieId: movie._id }),
    });

    if (res.ok) {
      mutate(`/api/movies/watchlist?userid=${userId}`);
    } else {
      console.error("Failed to add to watchlist");
    }
  };

  const removeFromWatchlist = async () => {
    if (!userId) return;

    const res = await fetch("/api/movies/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, movieId: movie._id }),
    });

    if (res.ok) {
      mutate(`/api/movies/watchlist?userid=${userId}`);
    } else {
      console.error("Failed to remove from watchlist");
    }
  };

  // Image functionality
  const [imageSrc, setImageSrc] = useState(
    movie.imgImdb || movie.imgNetzkino || movieThumbnail.src
  );
  const customLoader = ({ src }: { src: string }) => {
    return src; // ✅ Allows any external image URL
  };

  console.log("is in Watchlist?", isInWatchlist);
  console.log("movieId ", movie._id);
  console.log("userId ", userId);
  return (
    <div>
      <button onClick={onBack}>Back to Movies</button>
      <h2>{movie.title}</h2>
      <p>{movie.overview}</p>
      <p>{movie.regisseur}</p>
      <p>{movie.stars}</p>
      <Image
        loader={customLoader}
        src={imageSrc}
        alt={movie.title}
        width={600}
        height={200}
        onError={() => setImageSrc(movieThumbnail.src)}
      />
      {isInWatchlist ? (
        <button onClick={removeFromWatchlist}>Remove from Watchlist</button>
      ) : (
        <button onClick={addToWatchlist}>Add to Watchlist</button>
      )}
    </div>
  );
}
