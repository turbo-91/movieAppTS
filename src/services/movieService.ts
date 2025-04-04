import dbConnect from "../db/mongodb";
import Movie from "../db/models/Movie";
import { isQueryInDb, postQuery } from "./queryService";
import { getMoviesByQuery } from "./movieDB";
import { IMovie } from "@/db/models/Movie";
import { fetchMoviesFromNetzkino } from "./netzkinoFetcher";
import { postMovies } from "./movieDB";
import { addImgImdb, enrichMovies } from "./imdbService";
import Bottleneck from "bottleneck";
import movieThumbnail from "/public/movieThumbnail.png";
import { v4 as uuidv4 } from "uuid";
import { runImgTask } from "@/lib/imdbTaskRunner";
import TaskStatus from "@/db/models/TaskStatus";

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
  const moviesOfTheDay: IMovie[] = [];
  const otherMovies: IMovie[] = [];
  const maxRetries = 10;

  for (
    let retryCount = 0;
    moviesOfTheDay.length < 5 && retryCount < maxRetries;
    retryCount++
  ) {
    const query =
      randomQueries[Math.floor(Math.random() * randomQueries.length)];
    const movies = await fetchMoviesFromNetzkino(query);
    movies.map(async (movie) => {
      if (movie.imgNetzkino) {
        await addImgImdb(movie);
        moviesOfTheDay.push(movie);
      }
      if (!movie.imgNetzkino) {
        otherMovies.push(movie);
      }
    });

    if (movies.length > 0) {
      await postQuery(query); // Cache query in DB
    }
  }

  if (moviesOfTheDay.length === 0) {
    return { success: false, error: "Not enough movies could be fetched." };
  }

  if (otherMovies.length > 0) {
    const enrichedMovies = await enrichMovies(otherMovies);
    postMovies(enrichedMovies);
    console.log(" anzahl other movies nach enrichments", enrichedMovies.length);
  }

  console.log("anzahl movies of the day", moviesOfTheDay.length);

  postMovies(moviesOfTheDay);
  return moviesOfTheDay.slice(0, 5);
}

const limiter = new Bottleneck({
  minTime: 1000, // Wait at least 1000ms between calls
});

export async function getSearchMovies(query: string) {
  await dbConnect();
  const queryInDb = await isQueryInDb(query);
  if (queryInDb === true) {
    const cachedMovies = getMoviesByQuery(query);
    return cachedMovies;
  } else {
    const movies: IMovie[] = await limiter.schedule(() =>
      fetchMoviesFromNetzkino(query)
    );
    if (!movies.length) return [];
    await postQuery(query);
    await postMovies(movies);
    const taskId = uuidv4();
    await TaskStatus.create({ taskId, status: "processing" });
    runImgTask(taskId, movies);
    return { movies, taskId };
  }
}
