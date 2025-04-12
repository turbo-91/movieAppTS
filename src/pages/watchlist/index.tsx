import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { customLoader } from "@/lib/constants/constants";
import MovieCard from "@/components/MovieCard";
import { IMovie } from "@/db/models/Movie";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import MovieDetail from "@/components/MovieDetail";

export interface WatchlistProps {
  selectedMovie: IMovie | null;
  setSelectedMovie: (movie: IMovie | null) => void;
}

function Watchlist(props: Readonly<WatchlistProps>) {
  const { setSelectedMovie, selectedMovie } = props;
  const { data: session } = useSession();
  const userName = session?.user?.name || "user";
  const userId = session?.user?.userId;
  const { watchlist } = useWatchlist(userId);

  if (session) {
    return (
      <>
        <div>Hi, {userName}!</div>
        <button onClick={() => signOut()}>Logout</button>
        <div>Your watchlist:</div>

        {selectedMovie ? (
          <MovieDetail
            movie={selectedMovie}
            onBack={() => setSelectedMovie(null)}
          />
        ) : (
          <>
            {watchlist && watchlist.length > 0 ? (
              <ul>
                {watchlist.map((movie: IMovie) => (
                  <MovieCard
                    key={movie._id}
                    onClick={() => setSelectedMovie(movie)}
                    movie={movie}
                  />
                ))}
              </ul>
            ) : (
              <div>No Movies in your watchlist.</div>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <div>
      <button onClick={() => signIn("github")}>
        Jetzt einloggen mit
        <Image
          loader={customLoader}
          src="/github-mark.png"
          alt="Github mark"
          width={20}
          height={20}
        />
        <Image
          loader={customLoader}
          src="/GitHub_Logo.png"
          alt="Github Logo"
          width={60}
          height={20}
        />
      </button>
    </div>
  );
}

export default Watchlist;
