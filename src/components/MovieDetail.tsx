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

const UnitContainer = styled.div`
  display: flex;
  flex-direction: row;
  /* Let the text and image each control their own widths */
  align-items: flex-start;
  justify-content: flex-start;
`;

const ImageContainer = styled.div`
  position: relative;
  height: 60vh;
  width: 40vw; /* smaller than full width so there's more space for text */
  overflow: hidden;
  flex-shrink: 0; /* prevents image from shrinking; remove if you want it to shrink */
`;

const ContentContainer = styled.div`
  flex: 1; /* let this container grow as much as possible */
  display: flex;
  flex-direction: column-reverse;
  color: white;
  line-height: 1.6; /* extra spacing between lines */
  padding: 1rem;
  /* max-width: none;  remove any artificial width limitation */
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
    movie.posterImdb || movie.imgNetzkino || movieThumbnail
  );
  const handleImageError = () => {
    setImgSrc(movieThumbnail);
  };

  console.log("is in Watchlist?", isInWatchlist);
  console.log("movieId ", movie._id);
  console.log("userId ", userId);
  return (
    <DetailContainer>
      <button onClick={onBack}>Back to Movies</button>
      <UnitContainer>
        <ImageContainer>
          <Image
            loader={customLoader}
            src={imgSrc}
            alt={movie.title}
            fill
            style={{ objectFit: "contain", objectPosition: "center" }}
            onError={handleImageError}
          />
        </ImageContainer>
        <ContentContainer>
          <h2>{movie.title}</h2>
          <p>{movie.overview}</p>
          <p>{movie.regisseur}</p>
          <p>{movie.stars}</p>
        </ContentContainer>
      </UnitContainer>
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
    </DetailContainer>
  );
}
