import Movie from "@/db/models/Movie";
import dbConnect from "@/db/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "GET") {
    const { query } = req.query; // Extract query from URL parameters

    if (query) {
      return getMovieByQuery(req, res, query as string);
    } else {
      return getAllMovies(req, res);
    }
  } else {
    return res.status(405).json({ status: "Method Not Allowed" });
  }
}

async function getAllMovies(req: NextApiRequest, res: NextApiResponse) {
  try {
    const movies = await Movie.find();

    if (!movies || movies.length === 0) {
      return res.status(404).json({ status: "Not Found" });
    }

    return res.status(200).json(movies);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error fetching movies", error: error });
  }
}

async function getMovieByQuery(
  req: NextApiRequest,
  res: NextApiResponse,
  query: string
) {
  try {
    const movies = await Movie.find({ queries: query });

    if (!movies || movies.length === 0) {
      return res
        .status(404)
        .json({ status: "No movies found for the given query" });
    }

    return res.status(200).json(movies);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error fetching movies", error: error });
  }
}
