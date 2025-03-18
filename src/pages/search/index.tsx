import React, { useState } from "react";
import useSWR from "swr";
import MovieDetail from "@/components/MovieDetail";
import { IMovie } from "@/db/models/Movie";
import { fetcher } from "@/lib/fetcher";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

  const { data: movies = [], error: fetchError } = useSWR(
    query ? `/api/movies?query=${query}` : null,
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

  return (
    <div>
      <input
        type="text"
        placeholder="Suchbegriff eingeben"
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === " " && e.preventDefault()} // space not allowed in input
      />

      {/* DISPLAY SEARCH ERROR MESSAGE*/}
      {error && <p className="error">{error}</p>}
      {fetchError && (
        <p className="error">Error fetching movies. Please try again.</p>
      )}

      {/* DISPLAY NO MOVIES FOUND OR ONE MOVIE SEARCH RESULTS OR ONE MOVIE IN DETAIL*/}
      {movies.length === 0 ? (
        <p>No movies found.</p>
      ) : selectedMovie ? (
        <MovieDetail
          movie={selectedMovie}
          onBack={() => setSelectedMovie(null)}
        />
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default SearchPage;
