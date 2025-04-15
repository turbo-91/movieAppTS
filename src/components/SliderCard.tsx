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
  margin-left: 1vw;
  cursor: pointer;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 88vh;
  overflow: hidden;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  margin-left: 1vw;
`;

const MovieTitle = styled.h3`
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  white-space: normal; /* Allow wrapping */
  overflow-wrap: break-word; /* Break long words if necessary */
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
  onClick: (movie: IMovie) => void;
}

export default function SliderCard(props: Readonly<SliderCardProps>) {
  const { movie, onClick } = props;

  // Image handling
  const [imgSrc, setImgSrc] = useState(
    movie.imgNetzkino || movie.backdropImdb || movieThumbnail
  );

  const handleImageError = () => {
    if (movie.backdropImdb === "n/a") {
      setImgSrc(movieThumbnail);
    } else {
      setImgSrc(movie.backdropImdb || movieThumbnail);
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
      </InfoWrapper>
    </CardWrapper>
  );
}
