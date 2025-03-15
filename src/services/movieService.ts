import dbConnect from "../db/mongodb";
import axios from "axios";
import Movie from "../db/models/Movie";
import idToImg from "@/lib/idToImg";
import Query from "../db/models/Query";
import { IMovie } from "@/db/models/Movie";
import { NetzkinoMovie } from "@/types/NetzkinoMovie";
import movieThumbnail from "@/lib/img/movieThumbnail.png";
import { backdropUrl } from "@/lib/constants/constants";
import { netzkinoURL } from "@/lib/constants/constants";
import { netzkinoKey } from "@/lib/constants/constants";

export async function getMoviesOfTheDay(randomQueries: string[]) {
  await dbConnect();
  // Check if today's movies already exist in the database
  const today = new Date().toLocaleDateString();
  const todaysMovies = await Movie.find({ dateFetched: today });
  if (todaysMovies.length > 0) {
    return todaysMovies.slice(0, 5); // Return only the top 5
  }
  // movies have not been fetched today: fetch movies from APIs
  const collectedMovies: IMovie[] = [];
  const maxRetries = 10;
  for (
    let retryCount = 0;
    collectedMovies.length < 5 && retryCount < maxRetries;
    retryCount++
  ) {
    const query =
      randomQueries[Math.floor(Math.random() * randomQueries.length)];
    try {
      const response = await axios.get(
        `${netzkinoURL}?q=${query}&d=${netzkinoKey}`
      );

      if (!response.data || !Array.isArray(response.data.posts)) {
        throw new Error("Invalid Netzkino API response");
      }
      if (response.data.count_total > 0) {
        postQuery(query); // post query in db to avoid future API fetching - part of pseudo caching
      }
      const movies: IMovie[] = response.data.posts.map(
        (movie: NetzkinoMovie) => {
          const imdbLink = movie.custom_fields?.["IMDb-Link"]?.[0];
          const imgImdb = imdbLink ? idToImg(imdbLink) : null;
          const fallbackImg = movie.thumbnail || movieThumbnail;
          return {
            _id: movie.id,
            netzkinoId: movie.id,
            slug: movie.slug,
            title: movie.title,
            year: movie.custom_fields?.Jahr || ["n/a"],
            regisseur: movie.custom_fields?.Regisseur || ["n/a"],
            stars: movie.custom_fields?.Stars || ["n/a"],
            overview: movie.content || "n/a",
            imgNetzkino:
              movie.custom_fields?.featured_img_all?.[0] || fallbackImg,
            imgNetzkinoSmall:
              movie.custom_fields?.featured_img_all_small?.[0] || fallbackImg,
            imgImdb: imgImdb || "n/a",
            queries: query,
            dateFetched: today,
          };
        }
      );
      collectedMovies.push(...movies);
    } catch (error) {
      console.error(
        `Error fetching movies for query "${query}" from Netzkino API:`,
        error
      );
    }
  }

  if (collectedMovies.length < 5) {
    // Not enough movies collected, return an error
    return {
      success: false,
      error: "Not enough movies could be fetched.",
    };
  }

  postMovies(collectedMovies); // save fetched movies to db

  return collectedMovies.slice(0, 5);
}

export async function getSearchMovies(query: string) {
  console.log("search query: ", query);
}

export async function postMovies(movies: IMovie[]) {
  await dbConnect();

  if (!Array.isArray(movies) || movies.length === 0) {
    throw new Error("Invalid input: movies must be a non-empty array");
  }

  try {
    const newMovies = await Movie.insertMany(movies);
    addImgImdb(newMovies);
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

export async function addImgImdb(movies: IMovie[]) {
  for (const movie of movies) {
    const imdbId = movie.imgImdb;
    try {
      const response = await axios.get(imdbId);
      const backdrop = response.data.movie_results?.[0]?.backdrop_path;
      const backdrop_path = backdrop
        ? `${backdropUrl}${backdrop}`
        : movieThumbnail.src;
      const updatedMovie = await Movie.findByIdAndUpdate(
        movie._id,
        { imgImdb: backdrop_path },
        { new: true }
      );
    } catch (error) {
      console.error(`Error updating movie ${movie.netzkinoId}:`, error);
    }
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

export async function getMoviesByQueryFromDB(query: string) {
  await dbConnect();
  try {
    const movies = await Movie.find({ queries: query });
    return movies;
  } catch (error) {
    console.error(`Error fetching movies for query "${query}" from DB:`, error);
    throw new Error("Unable to fetch movies for the specified query");
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
