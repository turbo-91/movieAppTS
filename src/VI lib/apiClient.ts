import { Movie } from "@/V types/Movie";
import { moviesInDb } from "./constants/constants";

export async function fetchSearchResults(query: string, tmdbKey: string) {
  console.log("Start movie search fetching...");
  console.log("tmdbkey: ", tmdbKey);

  if (!tmdbKey) {
    throw new Error("Missing TMDB API key. Set it in your .env file.");
  }

  const netzkinoUrl = `https://api.netzkino.de.simplecache.net/capi-2.0a/search?q=${query}`;

  // Fetching from Netzkino API
  const response = await fetch(netzkinoUrl);
  if (!response.ok) throw new Error("Failed to fetch movies from Netzkino");
  const data = await response.json();
  const netzkinoMovies = data.posts;

  if (!netzkinoMovies || netzkinoMovies.length === 0) {
    console.log("No movies found from API 1.");
    return [];
  }

  const fetchedMovies: Movie[] = [];
  for (const movie of netzkinoMovies) {
    console.log("Processing movie:", movie.title);

    // 🎯 Extract IMDb ID inline
    const imdbId =
      movie.custom_fields?.["IMDb-Link"]?.[0]?.match(/tt\d+/)?.[0] || null;

    if (!imdbId) {
      console.warn(
        `⚠ Skipping movie "${movie.title}" - No valid IMDb ID found.`
      );
      continue;
    }

    console.log(`✅ IMDb ID for "${movie.title}":`, imdbId);

    // ✅ Check if the movie already exists in moviesInDb
    const existsInDb = moviesInDb.some((m) => m.slug === movie.slug);

    if (existsInDb) {
      console.log(`⏭ Skipping "${movie.title}" - Already exists in database.`);
      continue;
    }

    // Fetch from TMDB
    const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbKey}&language=en-US&external_source=imdb_id`;
    const tmdbResponse = await fetch(tmdbUrl);
    if (!tmdbResponse.ok) {
      console.error(`Failed to fetch TMDB data for IMDb ID: ${imdbId}`);
      continue;
    }
    const tmdbData = await tmdbResponse.json();
    console.log("Tmdb response: ", tmdbData);

    // Get poster path
    const imdbMovieImgPath =
      tmdbData?.movie_results?.length > 0
        ? tmdbData.movie_results[0].poster_path
        : null;

    // Use a placeholder if no image is found
    const placeholderImgUrl =
      "https://via.placeholder.com/500x750?text=No+Image+Available";
    const imgUrl = imdbMovieImgPath
      ? `https://image.tmdb.org/t/p/w500${imdbMovieImgPath}`
      : placeholderImgUrl;

    // Construct movie object
    const year = movie.custom_fields?.["Jahr"]?.[0] || "Unknown";
    console.log(`🎬 Year for "${movie.title}":`, year); // Debugging log ✅

    const processedMovie: Movie = {
      slug: movie.slug,
      title: movie.title,
      overview: movie.content || "No description available",
      year: year,
      imgUrl: imgUrl,
    };

    // Add movie to results
    fetchedMovies.push(processedMovie);
    moviesInDb.push(processedMovie);
  }

  console.log("Fetched movies after complete process: ", fetchedMovies);
  return fetchedMovies;
}
