import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import { customLoader } from "@/lib/constants/constants";
import Image from "next/image";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Icon, Star } from "lucide-react";
import styled from "styled-components";

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
            <Star fill="white" size={35} strokeWidth={1} />
          </WatchlistButton>
        ) : (
          <WatchlistButton onClick={addToWatchlist}>
            <Star size={35} strokeWidth={1} />
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
          src={imageSrc}
          alt={movie.title}
          width={450}
          height={225}
          onError={() => setHasError(true)}
        />
      </div>
    </CardWrapper>
  );
}
