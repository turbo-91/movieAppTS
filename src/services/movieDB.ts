import dbConnect from "@/db/mongodb";
import Movie from "@/db/models/Movie";
import { IMovie } from "@/db/models/Movie";

export async function postMovies(movies: IMovie[]) {
  await dbConnect();

  if (!Array.isArray(movies) || movies.length === 0) {
    throw new Error("Invalid input: movies must be a non-empty array");
  }

  try {
    return await Movie.insertMany(movies);
  } catch (error) {
    console.error("Error inserting movies into DB:", error);
    throw new Error("Database insertion failed");
  }
}

export async function getAllMoviesFromDB() {
  await dbConnect();
  try {
    const movies = await Movie.find();
    return movies;
  } catch (error) {
    console.error("Error fetching all movies from DB:", error);
    throw new Error("Unable to fetch movies from the database");
  }
}

export async function getMoviesByQuery(query: string) {
  await dbConnect();

  if (!query || typeof query !== "string") {
    throw new Error("Invalid input: query must be a non-empty string");
  }

  try {
    const movies = await Movie.find({ queries: query });
    return movies;
  } catch (error) {
    console.error("Error fetching movies by query:", error);
    throw new Error("Unable to fetch movies");
  }
}

export async function getMovieById(movieId: string) {
  await dbConnect();
  if (!movieId || typeof movieId !== "string")
    throw new Error("Invalid input: movieId must be a non-empty string");
  try {
    const movie = await Movie.findById(movieId);
    return movie || null;
  } catch (error) {
    console.error("Error fetching movie by ID:", error);
    throw new Error("Unable to fetch movie by ID");
  }
}
