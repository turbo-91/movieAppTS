import { IMovie } from "@/db/models/Movie";
import movieThumbnail from "/public/movieThumbnail.png";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { mutate } from "swr";
import { useEffect } from "react";
import { useWatchlist } from "@/lib/hooks/useWatchlist";

interface MovieDetailProps {
  movie: IMovie;
  onBack: () => void;
}

export default function MovieDetail({ movie, onBack }: MovieDetailProps) {
  // Session and Watchlist
  const { data: session } = useSession();
  const userId = session?.user?.userId; // check custom nextAuth type in types folder that ensures type safety in combination with nextAuth
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoading } =
    useWatchlist(userId, movie._id);

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
