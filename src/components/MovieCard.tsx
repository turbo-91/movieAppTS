import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import movieThumbnail from "/public/movieThumbnail.png";
import Image from "next/image";

export interface MovieCardProps {
  movie: IMovie;
}

const customLoader = ({ src }: { src: string }) => {
  return src; // ✅ Allows any external image URL
};

export default function MovieCard(props: Readonly<MovieCardProps>) {
  const { movie } = props;
  const [imageSrc, setImageSrc] = useState(movie.imgNetzkino || movie.imgImdb);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <>
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
    </>
  );
}
