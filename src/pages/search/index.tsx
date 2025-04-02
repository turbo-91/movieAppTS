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

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* space between cards */
  justify-content: center; /* or space-between / flex-start */
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

  // Reset to first page when query changes (or when movies update)
  useEffect(() => {
    setCurrentPage(1);
  }, [query, movies]);

  // Calculate pagination values
  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = movies.slice(startIndex, endIndex);

  // Handlers for pagination
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

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
    <div>
      <input
        type="text"
        placeholder="Suchbegriff eingeben"
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === " " && e.preventDefault()} // space not allowed in input
      />

      {/* DISPLAY NO MOVIES FOUN AS DEFAULT */}
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
            {currentMovies.map((movie: IMovie) => (
              <MovieCard
                key={movie._id}
                onClick={() => setSelectedMovie(movie)}
                movie={movie}
              />
            ))}
          </CardGrid>

          {/* PAGINATION CONTROLS */}
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
          )}
        </>
      )}
    </div>
  );
}

export default SearchPage;
