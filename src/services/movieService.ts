import dbConnect from "../db/mongodb";
import Movie from "../db/models/Movie";
import { isQueryInDb, postQuery } from "./queryService";
import { getMoviesByQuery } from "./movieDB";
import { IMovie } from "@/db/models/Movie";
import { fetchMoviesFromNetzkino } from "./netzkinoFetcher";
import { postMovies } from "./movieDB";
import { addImgImdb } from "./imdbService";
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
    return { movies: todaysMovies.slice(0, 5) }; // Return only top 5
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
    const fallbackImg = movieThumbnail.src;
    const movies = await fetchMoviesFromNetzkino(query);

    movies.forEach((movie: IMovie) => {
      if (movie.imgNetzkino && movie.imgNetzkino !== fallbackImg) {
        moviesOfTheDay.push(movie);
      } else {
        otherMovies.push(movie);
      }
    });

    if (movies.length > 0) {
      await postQuery(query); // Cache query in DB
    }
  }

  if (moviesOfTheDay.length < 5) {
    return {
      movies: moviesOfTheDay,
      success: false,
      error: "Not enough quality movies could be fetched.",
    };
  }

  const taskId = uuidv4();
  await TaskStatus.create({ taskId, status: "processing" });

  await postMovies(moviesOfTheDay);
  runImgTask(taskId, moviesOfTheDay);
  console.log("taskId in getMoviesOfTheDay servuce", taskId);

  if (otherMovies.length > 0) {
    await postMovies(otherMovies);
    addImgImdb(otherMovies);
  }

  return {
    movies: moviesOfTheDay.slice(0, 5),
    taskId,
  };
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
