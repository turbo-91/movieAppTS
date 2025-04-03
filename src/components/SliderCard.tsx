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
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useEffect } from "react";
import { trusted } from "mongoose";

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
  taskId: string;
  movie: IMovie;
  onClick: (movie: IMovie) => void;
}

export default function SliderCard(props: Readonly<SliderCardProps>) {
  const { movie, onClick, taskId } = props;

  // Watchlist
  const { data: session } = useSession();
  const userId = session?.user?.userId; // beachte: custom nextAuth type in types folder that ensures type safety in combination with nextAuth
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist(
    userId,
    movie._id
  );
  const router = useRouter();

  // Poll task status if a taskId exists
  const { data: statusData } = useSWR(
    taskId ? `/api/status/${taskId}` : null,
    fetcher,
    {
      refreshInterval: 2000,
      shouldRetryOnError: false,
    }
  );

  const [status, setStatus] = useState(statusData);
  useEffect(() => {
    if (statusData?.status) {
      setStatus(statusData.status);
    }
  }, [statusData]);

  // Image
  const [imgSrc, setImgSrc] = useState(
    movie.imgNetzkino || movie.imgImdb || movieThumbnail
  );
  const handleImageError = () => {
    setImgSrc(movieThumbnail);
    let attempts = 0;

    const tryUpdateImage = () => {
      if (statusData?.status === "done") {
        setImgSrc(movie.imgImdb);
        return;
      }

      attempts++;
      if (attempts < 3) {
        console.log(`Attempt ${attempts} failed. Retrying in 5s...`);
        setTimeout(tryUpdateImage, 5000); // wait 5 seconds, then try again
      } else {
        console.log("All attempts failed.");
      }
    };

    tryUpdateImage();
  };

  useEffect(() => {
    console.log("data in slider:", movie);
    console.log("taskId in slider:", taskId);
    console.log("status in slider:", status);
  }, [taskId, status, movie]);

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
