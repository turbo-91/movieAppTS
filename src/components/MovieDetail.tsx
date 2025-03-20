import { IMovie } from "@/db/models/Movie";
import movieThumbnail from "/public/movieThumbnail.png";
import { useState } from "react";
import Image from "next/image";

interface MovieDetailProps {
  movie: IMovie;
  onBack: () => void;
}

export default function MovieDetail({ movie, onBack }: MovieDetailProps) {
  const customLoader = ({ src }: { src: string }) => {
    return src; // ✅ Allows any external image URL
  };
  const [imageSrc, setImageSrc] = useState(
    movie.imgImdb || movie.imgNetzkino || movieThumbnail.src
  );

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <button onClick={onBack} className="text-red-500">
        Back to Movies
      </button>
      <h2 className="text-2xl">{movie.title}</h2>
      <p>{movie.overview}</p>
      <p>{movie.regisseur}</p>
      <p>{movie.stars}</p>
      <Image
        loader={customLoader}
        src={imageSrc}
        alt={movie.title}
        width={600}
        height={200}
        onError={() => setImageSrc(movieThumbnail.src)}
      />
    </div>
  );
}
