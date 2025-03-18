import dbConnect from "../db/mongodb";
import Movie from "../db/models/Movie";
import { postQuery } from "./movieServiceOld";
import { IMovie } from "@/db/models/Movie";
import { fetchMoviesFromNetzkino } from "./netzkinoFetcher";
import { postMovies } from "./movieDB";
import { addImgImdb } from "./movieServiceOld";

// Fetches movies of the day from Netzkino API, caches them in the database,
// and fetches additional image from ImdB.

export async function getMoviesOfTheDay(randomQueries: string[]) {
  await dbConnect();

  // Check if today's movies already exist in the database
  const today = new Date().toLocaleDateString();
  const todaysMovies = await Movie.find({ dateFetched: today });
  if (todaysMovies.length > 0) {
    return todaysMovies.slice(0, 5); // Return only the top 5
  }

  // movies have not been fetched today: fetch movies from APIs
  const collectedMovies: IMovie[] = [];
  const maxRetries = 10;

  for (
    let retryCount = 0;
    collectedMovies.length < 5 && retryCount < maxRetries;
    retryCount++
  ) {
    const query =
      randomQueries[Math.floor(Math.random() * randomQueries.length)];
    const movies = await fetchMoviesFromNetzkino(query);

    if (movies.length > 0) {
      await postQuery(query); // Cache query in DB
      collectedMovies.push(...movies);
    }
  }

  if (collectedMovies.length < 5) {
    return { success: false, error: "Not enough movies could be fetched." };
  }

  await postMovies(collectedMovies); // save fetched movies to db
  addImgImdb(collectedMovies);

  return collectedMovies.slice(0, 5);
}

export async function getSearchMovies(query: string) {
  const movies: IMovie[] = await fetchMoviesFromNetzkino(query);
  if (!movies.length) return;

  await postQuery(query);
  await postMovies(movies);
  addImgImdb(movies);
}
