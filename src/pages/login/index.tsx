import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { customLoader } from "@/lib/constants/constants";
import MovieCard from "@/components/MovieCard";
import { IMovie } from "@/db/models/Movie";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { useState } from "react";
import MovieDetail from "@/components/MovieDetail";

function Login() {
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);
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
        {/* DISPLAY MOVIE DETAIL IF A MOVIE IS SELECTED */}
        {selectedMovie ? (
          <MovieDetail
            movie={selectedMovie}
            onBack={() => setSelectedMovie(null)}
          />
        ) : (
          <>
            {watchlist ? (
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

            {/*       
            {movies.length > itemsPerPage && (
              <div style={{ marginTop: "1rem" }}>
                <button onClick={goToPreviousPage} disabled={currentPage === 1}>
                  Previous
                </button>
                <span style={{ margin: "0 1rem" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )} */}
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

export default Login;
