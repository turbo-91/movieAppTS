import { NextApiRequest, NextApiResponse } from "next";
import { getMovieById } from "@/services/movieDB";
import handleApiError from "@/lib/handleApiError";

export default async function movieByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: "Method Not Allowed" });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Movie ID is required" });
    }

    const movie = await getMovieById(id);
    return movie
      ? res.status(200).json(movie)
      : res.status(404).json({ status: "Movie Not Found" });
  } catch (error) {
    return handleApiError(res, "Error fetching movie by ID", error);
  }
}
