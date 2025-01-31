import { Movie } from "@/V types/Movie";

function extractImdbId(imdbLink: string): string | null {
  let imdbId = "";
  let isFound = false; // Flag to check if "tt" is found

  for (const char of imdbLink) {
    if (!isFound) {
      // Look for "tt"
      if (imdbId.endsWith("t") && char === "t") {
        isFound = true; // "tt" is found
        imdbId = "tt";
      } else {
        imdbId = char === "t" ? "t" : ""; // Reset if a single 't' is found
      }
    } else {
      // Collect numeric characters after "tt"
      if (/\d/.test(char)) {
        imdbId += char;
      } else {
        break; // Stop if a non-numeric character is found
      }
    }
  }

  return isFound ? imdbId : null; // Return the IMDb ID or null if not found
}

export async function fetchSearchResults(imdbId: string, query: string) {
  console.log("Start movie search fetching...");
  const netzkinoKey = process.env.NETZKINO_KEY;
  const tmdbKey = process.env.TMDB_KEY;

  const netzkinoUrl = `https://api.netzkino.de.simplecache.net/capi-2.0a/search?q=cate&d=${netzkinoKey}`;
  const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbKey}&language=en-US&external_source=imdb_id`;

  // fetching from netzkinoAPI
  const response = await fetch(netzkinoUrl);
  if (!response.ok) throw new Error("Failed to fetch movies from netzkino");
  const data = await response.json();
  console.log("Netzkino response: "), data;
  const netzkinoMovies = data.posts;

  if (response == null) {
    const fallback: [] = [];
    console.log("No movies found from API 1.");
    return fallback;
  }

  const fetchedMovies: Movie[] = [];
  for (const movie of netzkinoMovies) {
    console.log(movie);
    if (!movie) continue;
    // step1: extract imdb-Link & cutout imdbId
    const imdbLink = movie.custom_fields["IMDb-Link"];
    const imdbId = extractImdbId(imdbLink);
    // step2: fetch from tmdb with imdbId
    const response = await fetch(tmdbUrl);
    if (!response.ok) throw new Error("Failed to fetch movies from netzkino");
    const data = await response.json();
    console.log("Tmdb response: ", data);
    // step3: extract posterpath & concatenate with image baseUrl
    const imdbMovieImgPath = data.movie_results[0].poster_path;
    const imgUrl = `"https://image.tmdb.org/t/p/w500"${imdbMovieImgPath}`;

    const processedMovie: Movie = {
      slug: movie.slug,
      title: movie.title,
      overview: movie.content,
      year: movie.custom_fields.jahr,
      imgUrl: imgUrl,
    };

    if (!fetchedMovies.some((m) => m.slug === processedMovie.slug)) {
      fetchedMovies.push(processedMovie);

      //   movieRepo.save(movie); --------- save movies to database? is there an array that is being fetched when the application starts? Do we need a check here or earlier if movie already exists in that array? pseudo caching...
    }

    return fetchedMovies;
  }
  console.log("fetchedMovies after complete process: ", fetchedMovies);
}
