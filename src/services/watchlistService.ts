import dbConnect from "@/db/mongodb";
import Movie from "@/db/models/Movie";

export async function getMoviesByUser(userId: string) {
  await dbConnect();

  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid input: userId must be a non-empty string");
  }

  try {
    const movies = await Movie.find({ savedBy: userId });
    return movies;
  } catch (error) {
    console.error("Error fetching movies by userId:", error);
    throw new Error("Unable to fetch movies");
  }
}
