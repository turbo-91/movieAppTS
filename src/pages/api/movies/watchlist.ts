import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/mongodb";
import { getMoviesByUser } from "@/services/watchlistService";
import handleApiError from "@/lib/handleApiError";

export default async function watchlistHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const { userid, movieId } = req.query;

  switch (req.method) {
    case "GET":
      try {
        if (!userid || typeof userid !== "string") {
          return res
            .status(400)
            .json({ error: "UserId parameter is required" });
        }

        const movies = await getMoviesByUser(userid);

        if (!movies || movies.length === 0) {
          return res.status(404).json({ status: "Not Found" });
        }

        return res.status(200).json(movies);
      } catch (error) {
        return handleApiError(res, "Error fetching movies", error);
      }
    case "POST":
      try {
        if (!userid || typeof userid !== "string") {
          return res
            .status(400)
            .json({ error: "UserId parameter is required" });
        }

        const updatedMovie = await updateUserToMovie(movieId, userid);

        if (!updatedMovie || updatedMovie.length === 0) {
          return res.status(404).json({ status: "Movie not Found" });
        }

        return res.status(200).json(updatedMovie);
      } catch (error) {
        return handleApiError(res, "Error saving userId to movie", error);
      }
    default:
      return res.status(405).json({ status: "Method Not Allowed" });
  }
}
