import dbConnect from "@/db/mongodb";
import { randomQueries } from "@/lib/constants/constants";
import { getMoviesOfTheDay } from "@/services/movieService";

// TORBEN DON'T FORGET 10 RETRIES!!!

async function addImgImdb() {
  console.log("tbd");
}

// API Route Hanlder
export default async function moviesDayHandler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const movies = await getMoviesOfTheDay(randomQueries);
    return res.status(200).json(movies);
  }
  if (req.method === "POST") {
    const updatedMovies = await addImgImdb;
    return res.status(200).json(updatedMovies);
  } else {
    return res.status(405).json({ status: "Method Not Allowed" });
  }
}
