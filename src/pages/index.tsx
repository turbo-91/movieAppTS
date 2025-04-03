import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import SliderCard from "@/components/SliderCard";
import MovieDetail from "@/components/MovieDetail";
import { useEffect } from "react";

export default function Home() {
  const { data, error } = useSWR("/api/moviesoftheday", fetcher, {
    shouldRetryOnError: false,
  });

  const isLoading = !data && !error;
  const movies: IMovie[] = data?.movies || [];
  const taskId = data?.taskId || null;

  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

  // Poll task status if a taskId exists
  const { data: statusData } = useSWR(
    taskId ? `/api/status/${taskId}` : null,
    fetcher,
    {
      refreshInterval: 2000,
      shouldRetryOnError: false,
    }
  );

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

  useEffect(() => {
    console.log("taskId in page:", taskId);
    console.log("status in page:", statusData);
  }, [taskId, statusData, data]);

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
              taskId={taskId}
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
