import Movie from "@/db/models/Movie";
import dbConnect from "@/db/mongodb";
import handleApiError from "@/lib/handleApiError";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function moviesHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      return req.query.query ? getMovieByQuery(req, res) : getAllMovies(res);
    case "POST":
      return Array.isArray(req.body)
        ? postMovies(req, res)
        : postMovie(req, res);
    default:
      return res.status(405).json({ status: "Method Not Allowed" });
  }
}

const getAllMovies = async (res: NextApiResponse) => {
  try {
    const movies = await Movie.find();
    return res
      .status(movies.length ? 200 : 404)
      .json(movies.length ? movies : { status: "Not Found" });
  } catch (error) {
    return handleApiError(res, "Error fetching movies", error);
  }
};

const getMovieByQuery = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const movies = await Movie.find({ queries: req.query.query });
    return res
      .status(movies.length ? 200 : 404)
      .json(
        movies.length
          ? movies
          : { status: "No movies found for the given query" }
      );
  } catch (error) {
    return handleApiError(res, "Error fetching movies", error);
  }
};

const postMovie = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const newMovie = await Movie.create(req.body);
    return res
      .status(201)
      .json({ success: true, status: "Movie created", data: newMovie });
  } catch (error) {
    return handleApiError(res, "Error creating movie", error, 400);
  }
};

const postMovies = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const newMovies = await Movie.insertMany(req.body);
    return res
      .status(201)
      .json({ success: true, status: "Movies created", data: newMovies });
  } catch (error) {
    return handleApiError(res, "Error creating movies", error, 400);
  }
};
