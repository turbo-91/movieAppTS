import dbConnect from "@/db/mongodb";
import Movie from "@/db/models/Movie";
import { IMovie } from "@/db/models/Movie";

export async function postMovies(movies: IMovie[]) {
  await dbConnect();

  if (!Array.isArray(movies) || movies.length === 0) {
    throw new Error("Invalid input: movies must be a non-empty array");
  }

  try {
    const bulkOps = movies.map((movie) => ({
      updateOne: {
        filter: { _id: movie._id }, // Check for existing movie by ID
        update: { $setOnInsert: movie }, // Insert only if not existing
        upsert: true, // Insert new movies, skip existing
      },
    }));

    await Movie.bulkWrite(bulkOps);
    console.log(`Successfully processed ${movies.length} movies.`);
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
  const numericId = Number(movieId);
  if (isNaN(numericId))
    throw new Error("Invalid input: movieId must be a valid number");
  try {
    const movie = await Movie.findOne({ _id: numericId });
    return movie || null;
  } catch (error) {
    console.error("Error fetching movie by ID:", error);
    throw new Error("Unable to fetch movie by ID");
  }
}
