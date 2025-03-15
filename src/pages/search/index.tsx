import React, { useState, useEffect } from "react";
import MovieDetail from "@/components/MovieDetail";
import { IMovie } from "@/db/models/Movie";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

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

  // Debounced search request & fetching
  useEffect(() => {
    const searchUrl = `searchUrl`;

    const fetchMovies = async () => {
      if (!query) return setMovies([]); // Clears movies list if input is empty
      try {
        const response = await fetch(searchUrl);
        if (!response.ok) throw new Error();
        setMovies(await response.json());
        setError("");
      } catch {
        setError("Error fetching movies. Please try again.");
        setMovies([]);
      }
    };
    const timeout = setTimeout(fetchMovies, 700);
    return () => clearTimeout(timeout);
  }, [query]);

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
