import dbConnect from "@/db/mongodb";
import { randomQueries } from "@/lib/constants/constants";
import { getMoviesOfTheDay } from "@/services/movieService";

// TORBEN DON'T FORGET 10 RETRIES!!!

// API Route Hanlder
export default async function moviesDayHandler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ status: "Method Not Allowed" });
  }

  const movies = await getMoviesOfTheDay(randomQueries);
  res.status(200).json(movies);
}
