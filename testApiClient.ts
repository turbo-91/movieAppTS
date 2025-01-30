// testApiClient.ts
// import { fetchSearchResults } from "@/VI lib/apiClient";

async function fetchSearchResults(imdbId: string, query: string) {
  console.log("Start movie search fetching...");
  const netzkinoKey = process.env.NETZKINO_KEY;
  const tmdbKey = process.env.TMDB_KEY;

  const netzkinoUrl = `https://api.netzkino.de.simplecache.net/capi-2.0a/search?q=cate&d=${netzkinoKey}`;
  const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbKey}&language=en-US&external_source=imdb_id`;

  const response = await fetch(netzkinoUrl);
  if (!response.ok) throw new Error("Failed to fetch movies from netzkino");
  const data = await response.json();
  console.log("searchMovies response: ", data);

  return data;
}

async function testFetchSearchResults() {
  const imdbId = "tt1234567"; // Replace with a real IMDb ID
  const query = "cate"; // Replace with a test query

  try {
    const data = await fetchSearchResults(imdbId, query);
    console.log("API Response:", data);
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
}

testFetchSearchResults();
