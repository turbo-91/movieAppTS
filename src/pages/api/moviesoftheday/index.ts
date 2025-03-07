import dbConnect from "@/db/mongodb";
import { names } from "@/lib/constants/constants";
import { getMoviesOfTheDay } from "@/services/movieService";

// TORBEN DON'T FORGET 10 RETRIES!!!

// API Route Hanlder
export default async function moviesDayHandler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ status: "Method Not Allowed" });
  }

  const movies = await getMoviesOfTheDay(names);
  res.status(200).json(movies);
}
