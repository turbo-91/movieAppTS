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
      if (req.query.slug !== undefined) {
        return getMovieBySlug(req, res);
      }
      return req.query.query ? getMovieByQuery(req, res) : getAllMovies(res);
    case "POST":
      return Array.isArray(req.body)
        ? postMovies(req, res)
        : postMovie(req, res);
    default:
      return res.status(405).json({ status: "Method Not Allowed" });
  }
}

const getMovieBySlug = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!req.query.slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    const movie = await Movie.find({ slug: req.query.slug });

    return movie.length
      ? res.status(200).json(movie)
      : res.status(404).json({ status: "Not Found" });
  } catch (error) {
    return handleApiError(res, "Error fetching movie by slug", error);
  }
};

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
  } catch (error: any) {
    const errorMessage = error.message.includes("Movie validation failed")
      ? "Missing required fields"
      : "Error finding movie";

    return res.status(400).json({ error: errorMessage });
  }
};

const postMovies = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const newMovies = await Movie.insertMany(req.body);
    return res
      .status(201)
      .json({ success: true, status: "Movies created", data: newMovies });
  } catch (error: any) {
    const errorMessage = error.message.includes("Movie validation failed")
      ? "Missing required fields"
      : "Error creating movies";

    return res.status(400).json({ error: errorMessage });
  }
};
