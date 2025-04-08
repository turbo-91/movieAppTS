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

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 1000px;
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* space between cards */
  justify-content: center;
`;

function SearchPage() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Debounce the query with 700ms delay
  const [debouncedQuery] = useDebounce(query, 700);

  const { data: movies = [], error: fetchError } = useSWR(
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
      <InputWrapper>
        <input
          type="text"
          placeholder="Suchbegriff eingeben"
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === " " && e.preventDefault()} // space not allowed in input
        />
      </InputWrapper>

      {/* 
      {/* DISPLAY NO MOVIES FOUND AS DEFAULT */}
      {!selectedMovie && (error || fetchError || movies.length === 0) && (
        <p className="error">No movies found.</p>
      )}

      {/* DISPLAY MOVIE DETAIL IF A MOVIE IS SELECTED */}
      {selectedMovie ? (
        <MovieDetail
          movie={selectedMovie}
          onBack={() => setSelectedMovie(null)}
        />
      ) : (
        <>
          {/* DISPLAY PAGINATED MOVIE LIST */}
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
      )}
    </SearchContainer>
  );
}

export default SearchPage;
