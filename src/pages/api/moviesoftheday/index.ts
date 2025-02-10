import dbConnect from "@/db/mongodb";
import Movie from "@/db/models/Movie";
import axios from "axios";
import { names } from "@/lib/constants/constants";
import type { NextApiRequest, NextApiResponse } from "next";
import Query from "@/db/models/Query";
import { IMovie } from "@/db/models/Movie";

interface TmdbMovieResult {
  poster_path: string | null;
}

interface TmdbResponse {
  movie_results: TmdbMovieResult[];
}

// API Route Hanlder
export default async function moviesDayHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ status: "Method Not Allowed" });
  }

  return getMoviesOfTheDay(names, res);
}

// Step 1: do we already have the necessary data in our database?
async function getMoviesOfTheDay(names: string[], res: NextApiResponse) {
  // Check if movies have already been fetched for today
  const today = new Date().toLocaleDateString();
  const existingMovies = await getStoredMoviesForToday(today);
  if (existingMovies.length > 0) {
    return res.status(200).json(existingMovies.slice(0, 5));
  }

  // Check if query related data already exists in our database
  const query = names[Math.floor(Math.random() * names.length)];
  const usedQueries = await getAllQueriesFromDB();

  if (usedQueries.some((q) => q.query.includes(query))) {
    const storedMovies = await getMoviesByQuery(query);
    return res.status(200).json(storedMovies.slice(0, 5));
  }

  // query has not been used yet: fetch movies from APIs
  try {
    const movies = await fetchAndStoreMovies(query, today);
    return res.status(200).json(movies.slice(0, 5));
  } catch (error) {
    console.error(`Error fetching movies for query "${query}":`, error);
    return res.status(500).json({
      success: false,
      error:
        "We encountered an error retrieving movies. Please try again later.",
    });
  }
}

async function getStoredMoviesForToday(today: string) {
  return Movie.find({ dateFetched: today });
}

// Step 2: fetch data from external APIs and store it
async function fetchAndStoreMovies(query: string, today: string) {
  const netzkinoKey = process.env.NEXT_PUBLIC_NETZKINO_KEY;
  const netzkinoURL = `https://api.netzkino.de.simplecache.net/capi-2.0a/search?q=${query}&d=${netzkinoKey}`;

  // start fetching from netzkino API
  const response = await axios.get(netzkinoURL);
  if (
    !response.data ||
    !Array.isArray(response.data.posts) ||
    response.data.posts.length === 0
  ) {
    throw new Error("Invalid or empty API response");
  }

  // formate responses
  const movies: IMovie[] = await Promise.all(
    response.data.posts.map(async (movie: any) =>
      formatMovieData(movie, query, today)
    )
  );

  // post to db and return to frontend
  console.log("movies final", movies);
  await postMovies(movies);
  await postQuery(query);
  return movies;
}

async function formatMovieData(movie: any, query: string, today: string) {
  // fetch additional image from TmdB
  const imdbLink = movie.custom_fields?.["IMDb-Link"]?.[0] || "";
  const imdbId = extractImdbId(imdbLink);
  const imgImdb = imdbId
    ? await fetchMoviePosterFromTmdb(imdbId, movie.title)
    : "N/A";

  // format final data in Movie Type
  return {
    netzkinoId: movie.id,
    slug: movie.slug,
    title: movie.title,
    year: movie.custom_fields?.Jahr?.[0] || "Unknown",
    regisseur: movie.custom_fields?.Regisseur?.[0] || "Unknown",
    stars: movie.custom_fields?.Stars?.[0] || "Unknown",
    overview: movie.content || "No overview available",
    imgNetzkino:
      movie.custom_fields?.featured_img_all?.[0] || movie.thumbnail || "",
    imgNetzkinoSmall:
      movie.custom_fields?.featured_img_all_small?.[0] || movie.thumbnail || "",
    imgImdb: imgImdb,
    queries: query,
    dateFetched: today,
  };
}

// Heloer function to extract ImdBId from Netzkino Response
function extractImdbId(imdbLink: string) {
  return imdbLink.split("/").find((part) => part.startsWith("tt")) || "";
}

// Helper function to fetch Movier Poster from ImdB
async function fetchMoviePosterFromTmdb(
  imdbId: string,
  title: string
): Promise<string> {
  const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
  const tmdbURL = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbApiKey}&language=de&external_source=imdb_id`;

  try {
    const response = await axios.get<TmdbResponse>(tmdbURL);
    const movieResults = response.data?.movie_results || [];

    return movieResults.length > 0 && movieResults[0].poster_path
      ? `https://image.tmdb.org/t/p/w500${movieResults[0].poster_path}`
      : "N/A";
  } catch (error) {
    console.error(`Error fetching TMDB poster for "${title}":`, error);
    return "N/A";
  }
}

// Crud Operations

async function getAllQueriesFromDB() {
  try {
    return Query.find();
  } catch (error) {
    console.error("Error fetching queries from DB:", error);
    throw new Error("Unable to fetch queries");
  }
}

async function getMoviesByQuery(query: string) {
  try {
    return Movie.find({ queries: query });
  } catch (error) {
    console.error(`Error fetching movies for query "${query}":`, error);
    throw new Error("Unable to fetch movies for the specified query");
  }
}

async function postMovies(movies: IMovie[]) {
  if (!Array.isArray(movies) || movies.length === 0) {
    throw new Error("Invalid input: movies must be a non-empty array");
  }

  try {
    await Movie.insertMany(movies);
    console.log("Movies successfully added to DB.");
  } catch (error) {
    console.error("Error inserting movies into the database:", error);
    throw new Error("Database insertion failed");
  }
}

async function postQuery(query: string) {
  if (!query || typeof query !== "string") {
    throw new Error("Invalid input: query must be a non-empty string");
  }

  try {
    await Query.create({ query });
    console.log("Query successfully added to DB.");
  } catch (error) {
    console.error("Error inserting query into the database:", error);
    throw new Error("Database insertion failed");
  }
}
