import dbConnect from "../db/mongodb";
import axios from "axios";
import Movie from "../db/models/Movie";
import { IMovie } from "../db/models/Movie";
import { idToImg } from "../lib/iDtoImg";
import Query from "../db/models/Query";

export async function fetchMoviesOfTheDay(names: string[]) {
  await dbConnect();

  const query = names[Math.floor(Math.random() * names.length)];
  const usedQueries = await getAllQueriesFromDB();
  const netzkinoKey = process.env.NEXT_PUBLIC_NETZKINO_KEY;
  const today = new Date().toLocaleDateString();

  const netzkinoURL = `https://api.netzkino.de.simplecache.net/capi-2.0a/search`;

  // Check if today's movies already exist in the database
  const todaysMovies = await Movie.find({ dateFetched: today });
  if (todaysMovies.length > 0) {
    console.log("Returning movies already fetched for today");
    return todaysMovies.slice(0, 5); // Return only the top 5
  }

  // query has already been used: movies in database
  console.log("query before querycheck", query);

  if (usedQueries.some((q) => q.query.includes(query))) {
    const movies = await getMoviesByQuery(query);
    return movies.slice(0, 5);
  }

  // query has not been used yet: fetch movies from APIs

  try {
    const response = await axios.get(
      `${netzkinoURL}?q=${query}&d=${netzkinoKey}`
    );

    if (!response.data || !Array.isArray(response.data.posts)) {
      throw new Error("Invalid API response");
    }

    const movies: IMovie[] = response.data.posts.map((movie: any) => {
      const imdbLink = movie.custom_fields?.["IMDb-Link"]?.[0];
      console.log("imdbLink in movie", imdbLink);
      const imgImdb = imdbLink ? idToImg(imdbLink) : null;
      console.log("imdgImdb in movie after extraction", imgImdb);

      return {
        netzkinoId: movie.id,
        slug: movie.slug,
        title: movie.title,
        year: movie.custom_fields?.Jahr,
        overview: movie.content,
        imgNetzkino:
          movie.custom_fields?.featured_img_all?.[0] || movie.thumbnail, // need other fallback
        imgNetzkinoSmall:
          movie.custom_fields?.featured_img_all_small?.[0] || movie.thumbnail, // need other fallback
        imgImdb: imgImdb,
        queries: query,
        dateFetched: today,
      };
    });

    console.log("movies vor return", movies);

    postMovies(movies);
    postQuery(query);
    return movies.slice(0, 5);
  } catch (error) {
    console.error(
      `Error fetching movies for query "${query}" from Netzkino API:`,
      error
    );
    return {
      success: false,
      error:
        "We encountered an error retrieving movies. Please try again later.",
    };
  }
}

export async function getAllMoviesFromDB() {
  await dbConnect();
  try {
    const movies = await Movie.find();
    return movies;
  } catch (error) {
    console.error("Error fetching all movies from DB:", error);
    throw new Error("Unable to fetch movies from the database");
  }
}

export async function getMoviesByQuery(query: string) {
  await dbConnect();
  try {
    const movies = await Movie.find({ queries: query });
    return movies;
  } catch (error) {
    console.error(`Error fetching movies for query "${query}" from DB:`, error);
    throw new Error("Unable to fetch movies for the specified query");
  }
}

export async function postMovies(movies: IMovie[]) {
  await dbConnect();

  if (!Array.isArray(movies) || movies.length === 0) {
    throw new Error("Invalid input: movies must be a non-empty array");
  }

  try {
    const newMovies = await Movie.insertMany(movies);
    return {
      success: true,
      status: "Movies successfully added",
      data: newMovies,
    };
  } catch (error) {
    console.error("Error posting movies:", error);
    throw new Error("Error inserting movies into the database");
  }
}

export async function getAllQueriesFromDB() {
  await dbConnect();
  try {
    const queries = await Query.find();
    return queries;
  } catch (error) {
    console.error("Error fetching queries from DB:", error);
    throw new Error("Unable to fetch queries");
  }
}

export async function postQuery(query: string) {
  await dbConnect();

  if (!query || typeof query !== "string") {
    throw new Error("Invalid input: query must be a non-empty string");
  }

  try {
    const newQuery = await Query.create({ query });
    return {
      success: true,
      status: "Query successfully added",
      data: newQuery,
    };
  } catch (error) {
    console.error("Error posting query:", error);
    throw new Error("Error inserting query into the database");
  }
}
