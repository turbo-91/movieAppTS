import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { customLoader } from "@/lib/constants/constants";
import MovieCard from "@/components/MovieCard";
import { IMovie } from "@/db/models/Movie";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import MovieDetail from "@/components/MovieDetail";
import styled from "styled-components";

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
  const { data: session } = useSession();
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
