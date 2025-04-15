import React from "react";
import { useSession } from "next-auth/react";
import MovieCard from "@/components/MovieCard";
import { IMovie } from "@/db/models/Movie";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import MovieDetail from "@/components/MovieDetail";
import styled from "styled-components";
import { useRouter } from "next/router";

const WatchlistContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* ensures children start from the left edge */
  margin-bottom: 0;
  padding-left: 1rem; /* sets a consistent left offset for all children */
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
`;

const Paragraph = styled.h1`
  font-weight: var(--font-weight-light);
  text-align: left;
  margin-left: 1rem;
`;

export interface WatchlistProps {
  selectedMovie: IMovie | null;
  setSelectedMovie: (movie: IMovie | null) => void;
}

function Watchlist(props: Readonly<WatchlistProps>) {
  const { setSelectedMovie, selectedMovie } = props;

  // Route protection: Redirect to login if not authenticated
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === "unauthenticated") {
    router.push("/");
  }

  const userName = session?.user?.name || "user";
  const userId = session?.user?.userId;
  const { watchlist } = useWatchlist(userId);

  if (session) {
    return (
      <>
        {selectedMovie ? (
          <MovieDetail
            movie={selectedMovie}
            onBack={() => setSelectedMovie(null)}
          />
        ) : (
          <WatchlistContainer>
            <Paragraph>{`Hey, ${userName}. Du hast ${
              watchlist.length === 1
                ? `einen Film in deiner Watchlist:`
                : `${watchlist.length} Filme in deiner Watchlist:`
            }`}</Paragraph>
            {watchlist && watchlist.length > 0 ? (
              <CardGrid>
                {watchlist.map((movie: IMovie) => (
                  <MovieCard
                    key={movie._id}
                    onClick={() => setSelectedMovie(movie)}
                    movie={movie}
                  />
                ))}
              </CardGrid>
            ) : (
              <div>No Movies in your watchlist.</div>
            )}
          </WatchlistContainer>
        )}
      </>
    );
  }
}
export default Watchlist;
