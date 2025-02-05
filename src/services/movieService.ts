import dbConnect from "@/db/mongodb";
import Movie from "@/db/models/Movie";
import { IMovie } from "@/db/models/Movie";

export async function fetchMoviesOfTheDay(
  names: string[],
  usedQueries: string[]
) {
  await dbConnect();
  const query = names[Math.floor(Math.random() * names.length)];
  const netzkinoKey = "devtest"; // put in env file!!!!!!

  const netzkinoURL = `https://api.netzkino.de.simplecache.net/capi-2.0a/search?q=${query}&d=${netzkinoKey}`;

  if (usedQueries.includes(query)) {
    getMoviesByQuery(query);
    // jetzt mal comitten
  } else {
    console.log(`send API request with query: ${query}`);
  }
}

export async function getAllMoviesFromDB() {
  await dbConnect();
  return await Movie.find();
}

export async function getMoviesByQuery(query: string) {
  await dbConnect();
  return await Movie.find({ queries: query });
}
