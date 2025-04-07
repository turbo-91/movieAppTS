import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import { customLoader } from "@/lib/constants/constants";
import Image from "next/image";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Icon, Star, Film } from "lucide-react";
import styled from "styled-components";
import movieThumbnail from "/public/movieThumbnail.png";

const CardWrapper = styled.div`
  position: relative;

  &:hover .hover-info {
    opacity: 1;
  }
`;

const HoverInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  padding: 0.3rem;
`;

const Year = styled.p`
  margin-left: auto;
  padding: 0.3rem;
  white-space: nowrap;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const WatchlistButton = styled.button`
  all: unset;
  cursor: pointer;
  font-size: 1.2rem;
`;

export interface SliderCardProps {
  key: number;
  movie: IMovie;
  onClick: (movie: IMovie) => void;
}

export default function SliderCard(props: Readonly<SliderCardProps>) {
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
  const [imgSrc, setImgSrc] = useState(
    movie.imgNetzkino || movie.imgImdb || movieThumbnail
  );
  const handleImageError = () => {
    if (movie.imgImdb === "n/a") {
      setImgSrc(movieThumbnail);
    } else {
      setImgSrc(movie.imgImdb || movieThumbnail);
    }
  };

  return (
    <CardWrapper>
      <IconWrapper>
        {isInWatchlist ? (
          <WatchlistButton
            onClick={() =>
              removeFromWatchlist(() => {
                router.replace(router.asPath);
              })
            }
          >
            <Star fill="#FFD700" color="#FFD700" size={35} strokeWidth={1} />
          </WatchlistButton>
        ) : (
          <WatchlistButton onClick={addToWatchlist}>
            <Star color="#FFD700" size={35} strokeWidth={1.5} />
          </WatchlistButton>
        )}
      </IconWrapper>

      <HoverInfo className="hover-info">
        <TitleRow>
          <Title>{movie.title}</Title>
          <Year>{movie.year}</Year>
        </TitleRow>
      </HoverInfo>

      <div onClick={() => onClick(movie)}>
        <Image
          loader={customLoader}
          src={imgSrc}
          alt={movie.title}
          width={450}
          height={225}
          onError={handleImageError}
        />
      </div>
    </CardWrapper>
  );
}
