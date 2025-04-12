import React, { useState, useEffect } from "react";
import useSWR from "swr";
import MovieCard from "@/components/MovieCard";
import MovieDetail from "@/components/MovieDetail";
import { IMovie } from "@/db/models/Movie";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "use-debounce";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { SquareLoader } from "react-spinners";

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
`;

const StyledInput = styled.input`
  width: 50vw; /* Set the desired width */
  padding: 0 1rem;
  font-size: 1rem;
  height: 3rem;
  border: 0.2rem solid white;
  border-radius: 5rem;
  background-color: black;
  color: white;
  box-shadow: none;

  &::placeholder {
    color: white;
    opacity: 1;
  }

  &:focus::placeholder {
    opacity: 0;
  }

  &:focus {
    outline: none;
  }
`;

const InputWrapperTop = styled.div`
  width: 50vw;
  margin: 1rem auto 0 auto;
  display: flex;
  justify-content: center;
`;

const CenteredContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 88vh;
`;

const ResponseWrapper = styled.div`
  width: 100%;
  /* Force the response text to align left */
  align-self: flex-start;
  text-align: left;
  padding: 0 20px;
  font-weight: var(--font-weight-light);
  font-size: 1.5rem;
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
`;

const SpinnerWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
`;

export interface SearchProps {
  selectedMovie: IMovie | null;
  setSelectedMovie: (movie: IMovie | null) => void;
}

function SearchPage(props: Readonly<SearchProps>) {
  const { setSelectedMovie, selectedMovie } = props;
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showDebouncedError, setShowDebouncedError] = useState(false);

  // Debounce the query with 700ms delay
  const [debouncedQuery] = useDebounce(query, 1200);

  const {
    data: movies = [],
    error: fetchError,
    isValidating,
  } = useSWR(
    query ? `/api/movies/search?query=${debouncedQuery}` : null,
    fetcher,
    { dedupingInterval: 700 }
  );

  // Handles input while allowing only lowercase letters
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^[a-z]*$/.test(value)) {
      setQuery(value);
      setError(""); // Clears error when valid input
    } else {
      setError("Only lowercase letters (a-z) are allowed.");
    }
  };

  useEffect(() => {
    console.log(movies);
  }, [movies]);

  // Debounce the no movies found message
  useEffect(() => {
    if ((error || fetchError) && query.trim() !== "") {
      const timer = setTimeout(() => {
        setShowDebouncedError(true);
      }, 1200); // Adjust the debounce delay (ms) as desired
      return () => clearTimeout(timer);
    } else {
      setShowDebouncedError(false);
    }
  }, [error, fetchError, query]);

  // Route Protection

  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("login");
  }

  return (
    <SearchContainer>
      {/* Render the input field always */}
      {!selectedMovie &&
      (movies.length === 0 || error || fetchError || query.trim() === "") ? (
        <CenteredContent>
          <InputWrapperTop>
            <StyledInput
              type="text"
              placeholder="Suchbegriff eingeben"
              value={query}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
            />
          </InputWrapperTop>
          {query.trim() === "" && !isValidating ? (
            <p className="error">Bitte gib einen Suchbegriff ein.</p>
          ) : (
            showDebouncedError && (
              <p className="error">{`Hmm... Wir konnten keine Filme finden für '${query}'.`}</p>
            )
          )}
          {/* Show spinner while fetching */}
          {query.trim() !== "" && isValidating && (
            <SpinnerWrapper>
              <SquareLoader color="#ffffff" />
            </SpinnerWrapper>
          )}
        </CenteredContent>
      ) : (
        !selectedMovie &&
        movies.length > 0 &&
        !(error || fetchError) &&
        query.trim() !== "" &&
        !isValidating && (
          <>
            <InputWrapperTop>
              <StyledInput
                type="text"
                placeholder="Suchbegriff eingeben"
                value={query}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === " " && e.preventDefault()}
              />
            </InputWrapperTop>
            {/* Show spinner under the input when fetching new data */}
            {isValidating && (
              <SpinnerWrapper>
                <SquareLoader color="#ffffff" />
              </SpinnerWrapper>
            )}

            <ResponseWrapper>
              <p>{`${movies.length} ${
                movies.length === 1 ? "Suchergebnis" : "Suchergebnisse"
              } für '${query}'...`}</p>
            </ResponseWrapper>

            <CardGrid>
              {movies.map((movie: IMovie) => (
                <MovieCard
                  key={movie._id}
                  onClick={() => setSelectedMovie(movie)}
                  movie={movie}
                />
              ))}
            </CardGrid>
          </>
        )
      )}

      {/* Display movie detail when a movie is clicked */}
      {selectedMovie && (
        <MovieDetail
          movie={selectedMovie}
          onBack={() => setSelectedMovie(null)}
        />
      )}
    </SearchContainer>
  );
}
export default SearchPage;
