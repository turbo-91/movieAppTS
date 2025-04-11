import { IMovie } from "@/db/models/Movie";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { customLoader } from "@/lib/constants/constants";
import movieThumbnail from "/public/movieThumbnail.png";
import styled from "styled-components";

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface MovieDetailProps {
  movie: IMovie;
  onBack: () => void;
}

export default function MovieDetail({ movie, onBack }: MovieDetailProps) {
  // Session and Watchlist
  const { data: session } = useSession();
  const userId = session?.user?.userId; // beachte: custom nextAuth type in types folder that ensures type safety in combination with nextAuth
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist(
    userId,
    movie._id
  );
  const router = useRouter();

  // Image
  const [imgSrc, setImgSrc] = useState(
    movie.imgNetzkino || movie.imgImdb || movieThumbnail
  );
  const handleImageError = () => {
    setImgSrc(movieThumbnail);
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
        src={imgSrc}
        alt={movie.title}
        width={600}
        height={200}
        onError={handleImageError}
      />
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
