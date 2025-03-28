import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import { customLoader } from "@/lib/constants/constants";
import Image from "next/image";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export interface MovieCardProps {
  key: number;
  movie: IMovie;
  onClick: (movie: IMovie) => void;
}

export default function MovieCard(props: Readonly<MovieCardProps>) {
  const { movie, onClick } = props;

  // Watchlist
  const { data: session } = useSession();
  const userId = session?.user?.userId; // beachte: custom nextAuth type in types folder that ensures type safety in combination with nextAuth
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist(
    userId,
    movie._id
  );
  const router = useRouter();

  // Image
  const [imageSrc, setImageSrc] = useState(movie.imgNetzkino || movie.imgImdb);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <div>
      <div onClick={() => onClick(movie)}>
        <h2>{movie.title}</h2>
        <p>{movie.year}</p>
        <Image
          loader={customLoader}
          src={imageSrc}
          alt={movie.title}
          width={600}
          height={200}
          onError={() => setHasError(true)}
        />
      </div>
      {isInWatchlist ? (
        <button
          onClick={() =>
            removeFromWatchlist(() => {
              router.replace(router.asPath);
            })
          }
        >
          Remove from Watchlist
        </button>
      ) : (
        <button onClick={addToWatchlist}>Add to Watchlist</button>
      )}
    </div>
  );
}
