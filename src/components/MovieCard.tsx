import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import movieThumbnail from "/public/movieThumbnail.png";
import Image from "next/image";

export interface MovieCardProps {
  movie: IMovie;
}

export default function SliderCard(props: Readonly<MovieCardProps>) {
  const { movie } = props;
  const [imageSrc, setImageSrc] = useState(
    movie.imgNetzkino || movieThumbnail.src
  );

  return (
    <>
      <h2>{movie.title}</h2>
      <p>{movie.year}</p>
      <Image
        src={imageSrc}
        alt={movie.title}
        fill
        onError={() => setImageSrc(movieThumbnail.src)}
      />
    </>
  );
}
