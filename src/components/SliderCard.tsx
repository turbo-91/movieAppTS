import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import movieThumbnail from "@/lib/img/movieThumbnail.png";

export interface SliderCardProps {
  movie: IMovie;
}

export default function SliderCard(props: Readonly<SliderCardProps>) {
  const { movie } = props;
  const [imageSrc, setImageSrc] = useState(
    movie.imgNetzkino || movieThumbnail.src
  );

  return (
    <>
      <h2>{movie.title}</h2>
      <p>{movie.year}</p>
      <img
        src={imageSrc}
        alt={movie.title}
        width="400"
        onError={() => setImageSrc(movieThumbnail.src)}
      />
    </>
  );
}
