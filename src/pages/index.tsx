import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import SliderCard from "@/components/SliderCard";
import MovieDetail from "@/components/MovieDetail";

export default function Home() {
  const { data: movies, error } = useSWR("/api/moviesoftheday", fetcher, {
    shouldRetryOnError: false,
  });

  const isLoading = !movies && !error;
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

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

  if (isLoading) return <p>... loading</p>;
  if (error) console.log(error.message);
  if (!movies.length && error) return <p>No movies found.</p>;
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
          {movies.map((movie: IMovie) => (
            <SliderCard
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
