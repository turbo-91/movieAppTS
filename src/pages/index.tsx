import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import MovieCard from "@/components/MovieCard";
import MovieDetail from "@/components/MovieDetail";

export default function Home() {
  const { data, error } = useSWR("api/moviesoftheday", fetcher, {
    shouldRetryOnError: false,
  });

  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

  if (!data && !error) return <div>Loading...</div>;
  if (error) return <div>Error loading movies: {error.message}</div>;
  if (!data.length) return <p>No movies found.</p>;

  // slider functionality

  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    speed: 10000,
    autoplaySpeed: 0,
    cssEase: "linear",
  };

  return (
    <div>
      <h1>Movies of the Day</h1>

      {selectedMovie ? (
        <MovieDetail
          movie={selectedMovie}
          onBack={() => setSelectedMovie(null)}
        />
      ) : (
        <Slider {...settings}>
          {data.map((movie: IMovie) => (
            <MovieCard
              key={movie.netzkinoId}
              movie={movie}
              onClick={() => setSelectedMovie(movie)}
            />
          ))}
        </Slider>
      )}
    </div>
  );
}
