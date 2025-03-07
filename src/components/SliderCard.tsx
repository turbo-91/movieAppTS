import { Movie } from "@/db/models/Movie";

export interface SliderCardProps {
  movie: Movie;
}

export default function SliderCard(props: Readonly<SliderCardProps>) {
  const { movie } = props;

  return (
    <>
      <h2>{movie.title}</h2>
      <p>{movie.year}</p>
      <img src={movie.imgNetzkinoSmall} alt={movie.title} width="200" />
    </>
  );
}
