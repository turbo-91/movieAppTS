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
    console.error("Error fetching movies by userId (", userId, "):", error);
    throw new Error("Unable to fetch movies");
  }
}

export async function addUserIdToMovie(movieId: string, userId: string) {
  await dbConnect();

  if (!userId?.trim() || !movieId?.trim()) {
    // "?.trim()" ensures not to pass strings with spaces only
    throw new Error(
      "Invalid input: userId and movieId must be non-empty strings"
    );
  }

  try {
    const movie = await await Movie.findOneAndUpdate(
      { _id: movieId },
      { $addToSet: { savedBy: userId } },
      { new: true }
    );
    return movie;
  } catch (error) {
    console.error("Error updating movie (", movieId, ") by userId:", error);
    throw new Error("Unable to fetch movies");
  }
}
