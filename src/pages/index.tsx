import { useState } from "react";
import { IMovie } from "@/db/models/Movie";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import SliderCard from "@/components/SliderCard";
import MovieDetail from "@/components/MovieDetail";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWatchlist } from "@/lib/hooks/useWatchlist";

export interface HomeProps {
  selectedMovie: IMovie | null;
  setSelectedMovie: (movie: IMovie | null) => void;
}

export default function Home(props: Readonly<HomeProps>) {
  const { setSelectedMovie, selectedMovie } = props;
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useSession();
  const userId = session?.user?.userId;

  // Use top-level watchlist hook
  const {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isLoading: isWatchlistLoading,
  } = useWatchlist(userId);

  useEffect(() => {
    // Perform a GET request using fetch
    fetch("/api/moviesoftheday")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMovies(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  // slider functionality

  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 1,
    autoplay: true,
    pauseOnHover: true,
    speed: 30000,
    autoplaySpeed: 1,
    cssEase: "linear",
    lazyload: "ondemand",
  };

  if (isLoading) return <p>... loading</p>;
  if (error) console.log(error.message);
  if (!movies.length && error) return <p>No movies found.</p>;

  return (
    <div>
      {selectedMovie ? (
        <MovieDetail
          movie={selectedMovie}
          onBack={() => setSelectedMovie(null)}
        />
      ) : (
        <Slider {...settings}>
          {movies.map((movie) => {
            const isInWatchlist = watchlist?.some((m) => m._id === movie._id);
            return (
              <SliderCard
                key={movie._id}
                movie={movie}
                isInWatchlist={isInWatchlist}
                onClick={() => setSelectedMovie(movie)}
                onAddToWatchlist={() => addToWatchlist(movie._id)}
                onRemoveFromWatchlist={() => removeFromWatchlist(movie._id)}
              />
            );
          })}
        </Slider>
      )}
    </div>
  );
}
