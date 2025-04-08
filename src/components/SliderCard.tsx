import { useState } from "react";
import Movie, { IMovie } from "@/db/models/Movie";
import { customLoader } from "@/lib/constants/constants";
import Image from "next/image";
import styled from "styled-components";
import movieThumbnail from "/public/movieThumbnail.png";

const CardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  border-left: 0.2rem solid white;
  margin-left: 2vw;
  cursor: pointer;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 88vh;
  overflow: hidden;
`;

const IconWrapper = styled.div`
  position: absolute;
  margin: 0;
  padding: 0;
  right: 17px;
  z-index: 10;
`;

const WatchlistButton = styled.button`
  all: unset;
  cursor: pointer;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  margin-left: 2vw;
`;

const MovieTitle = styled.h3`
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  white-space: nowrap;
  margin: 0;
`;

const MovieYear = styled.p`
  font-size: 3rem;
  font-weight: var(--font-weight-light);
  white-space: nowrap;
  margin: 0;
`;

const People = styled.p`
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  white-space: nowrap;
  margin-top: 0;
  margin-bottom: 0;
`;

export interface SliderCardProps {
  movie: IMovie;
  isInWatchlist: boolean;
  onClick: (movie: IMovie) => void;
  onAddToWatchlist: () => void;
  onRemoveFromWatchlist: () => void;
}

export default function SliderCard(props: Readonly<SliderCardProps>) {
  const {
    movie,
    onClick,
    isInWatchlist,
    onAddToWatchlist,
    onRemoveFromWatchlist,
  } = props;

  // Choose the best image source or fallback
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
    <CardWrapper onClick={() => onClick(movie)}>
      <ImageContainer>
        <Image
          src={imgSrc}
          alt={movie.title}
          loader={customLoader}
          loading="lazy"
          fill
          style={{ objectFit: "cover" }}
          onError={handleImageError}
        />
      </ImageContainer>
      <InfoWrapper>
        <People>Regie von {movie.regisseur}</People>
        <MovieYear>{movie.year}</MovieYear>
        <MovieTitle>{movie.title}</MovieTitle>
        {/* <IconWrapper>
          {isInWatchlist ? (
            <WatchlistButton
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromWatchlist();
              }}
            >
              <Star
                fill="#FFD700"
                color="#FFD700"
                size={55}
                strokeWidth={1.2}
              />
            </WatchlistButton>
          ) : (
            <WatchlistButton
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchlist();
              }}
            >
              <Star color="#FFD700" size={55} strokeWidth={1.2} />
            </WatchlistButton>
          )}
        </IconWrapper> */}
      </InfoWrapper>
    </CardWrapper>
  );
}
