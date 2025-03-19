import React, { useState, useEffect } from "react";
import useSWR from "swr";
import MovieDetail from "@/components/MovieDetail";
import { IMovie } from "@/db/models/Movie";
import { fetcher } from "@/lib/fetcher";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: movies = [], error: fetchError } = useSWR(
    query ? `/api/movies/search?query=${query}` : null,
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

  return (
    <div>
      <input
        type="text"
        placeholder="Suchbegriff eingeben"
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === " " && e.preventDefault()} // space not allowed in input
      />

      {/* DISPLAY SEARCH ERROR MESSAGE */}
      {error && <p className="error">{error}</p>}
      {fetchError && (
        <p className="error">Error fetching movies. Please try again.</p>
      )}

      {/* DISPLAY NO MOVIES FOUND */}
      {movies.length === 0 && !selectedMovie && !fetchError && (
        <p>No movies found.</p>
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
          <ul>
            {currentMovies.map((movie: IMovie) => (
              <li key={movie._id} onClick={() => setSelectedMovie(movie)}>
                {movie.title}
              </li>
            ))}
          </ul>

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
