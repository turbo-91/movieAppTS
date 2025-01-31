export async function fetchSearchResults(imdbId: string, query: string) {
  console.log("Start movie search fetching...");
  const netzkinoKey = process.env.NETZKINO_KEY;
  const tmdbKey = process.env.TMDB_KEY;

  const netzkinoUrl = `https://api.netzkino.de.simplecache.net/capi-2.0a/search?q=cate&d=${netzkinoKey}`;
  const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbKey}&language=en-US&external_source=imdb_id`;

  // fetching from netzkinoAPI
  const response = await fetch(netzkinoUrl);
  if (!response.ok) throw new Error("Failed to fetch movies from netzkino");
  const fetchedMovies = await response.json();

  console.log("Netzkino response: ", fetchedMovies);

  if (response == null) {
    const fallback: [] = [];
    console.log("No movies found from API 1.");
    return fallback;
  }

  return fetchedMovies;
}
