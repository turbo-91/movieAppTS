import dbConnect from "@/db/mongodb";
import handleApiError from "@/lib/handleApiError";
import { getSearchMovies } from "@/services/movieService";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function getSearchResults(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const movies = await getSearchMovies(query);

    if (!movies || movies.length === 0) {
      return res.status(200).json({ results: [], message: "No movies found" });
    }

    return res.status(200).json(movies);
  } catch (error) {
    return handleApiError(res, "Error fetching movies", error);
  }
}
