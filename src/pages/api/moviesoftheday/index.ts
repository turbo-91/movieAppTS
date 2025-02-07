import dbConnect from "@/db/mongodb";
import Movie from "@/db/models/Movie";
import axios from "axios";
import { names } from "@/lib/constants/constants";
import type { NextApiRequest, NextApiResponse } from "next";
import Query from "@/db/models/Query";
import { IMovie } from "@/db/models/Movie";

interface TmdbMovieResult {
  poster_path: string | null;
}

interface TmdbResponse {
  movie_results: TmdbMovieResult[];
}

export default async function moviesDayHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      return getMoviesOfTheDay(names, res);
    default:
      return res.status(405).json({ status: "Method Not Allowed" });
  }
}

export async function getMoviesOfTheDay(names: string[], res: NextApiResponse) {
  await dbConnect();

  const query = names[Math.floor(Math.random() * names.length)];
  const usedQueries = await getAllQueriesFromDB();
  console.log("usedQueries in beginning", usedQueries);
  const netzkinoKey = process.env.NEXT_PUBLIC_NETZKINO_KEY;
  const today = new Date().toLocaleDateString();

  const netzkinoURL = `https://api.netzkino.de.simplecache.net/capi-2.0a/search`;

  // Check if today's movies already exist in the database
  const todaysMovies = await Movie.find({ dateFetched: today });
  if (todaysMovies.length > 0) {
    console.log("Returning movies already fetched for today");
    return res.status(200).json(todaysMovies.slice(0, 5));
  }

  // query has already been used: movies in database
  console.log("query before querycheck", query);

  if (usedQueries.some((q) => q.query.includes(query))) {
    const usedMovies = await getMoviesByQuery(query);
    return res.status(200).json(usedMovies.slice(0, 5));
  }

  // query has not been used yet: fetch movies from APIs

  try {
    const response = await axios.get(
      `${netzkinoURL}?q=${query}&d=${netzkinoKey}`
    );

    if (!response.data || !Array.isArray(response.data.posts)) {
      throw new Error("Invalid API response");
    }

    if (response.data.posts.length === 0) {
      getMoviesOfTheDay(names, res);
    }

    console.log("netzkino response data", response.data);

    const movies: IMovie[] = await Promise.all(
      response.data.posts.map(async (movie: any) => {
        const imdbLink = movie.custom_fields?.["IMDb-Link"]?.[0];
        console.log("imdbLink in movie", imdbLink);
        const imdbFetchLink = idToImg(imdbLink);
        console.log("imdbId in movie after extraction", imdbFetchLink);
        const imgImdb = await fetchMoviePosterFromTmdb(
          imdbFetchLink,
          movie.title
        ); // Now correctly awaited

        return {
          netzkinoId: movie.id,
          slug: movie.slug,
          title: movie.title,
          year: movie.custom_fields?.Jahr[0],
          overview: movie.content || "No overview available",
          imgNetzkino:
            movie.custom_fields?.featured_img_all?.[0] || movie.thumbnail,
          imgNetzkinoSmall:
            movie.custom_fields?.featured_img_all_small?.[0] || movie.thumbnail,
          imgImdb: imgImdb,
          queries: query,
          dateFetched: today,
        };
      })
    );

    // const movies: IMovie[] = response.data.posts.map((movie: any) => {
    //   const imdbLink = movie.custom_fields?.["IMDb-Link"]?.[0];
    //   console.log("imdbLink in movie", imdbLink);
    //   const imgImdb = imdbLink ? idToImg(imdbLink) : null;
    //   console.log("imdgImdb in movie after extraction", imgImdb);

    //   return {
    //     netzkinoId: movie.id,
    //     slug: movie.slug,
    //     title: movie.title,
    //     year: movie.custom_fields?.Jahr[0],
    //     overview: movie.content,
    //     imgNetzkino:
    //       movie.custom_fields?.featured_img_all?.[0] || movie.thumbnail, // need other fallback
    //     imgNetzkinoSmall:
    //       movie.custom_fields?.featured_img_all_small?.[0] || movie.thumbnail, // need other fallback
    //     imgImdb: imgImdb,
    //     queries: query,
    //     dateFetched: today,
    //   };
    // });

    console.log("movies vor return", movies);

    postMovies(movies);
    postQuery(query);
    return res.status(200).json(movies.slice(0, 5));
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

export function idToImg(imdbLink: string) {
  const imdbKey = process.env.NEXT_PUBLIC_TMDB_KEY;
  const parts = imdbLink.split("/");
  const imdbId = parts.find((part) => part.startsWith("tt"));
  const imdbImgLink = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${imdbKey}&language=de&external_source=imdb_id`;
  return imdbImgLink;
}

async function fetchMoviePosterFromTmdb(
  imdbFetchLink: string,
  title: string
): Promise<string> {
  const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_KEY;

  console.log(`tmdb api key is `, tmdbApiKey);

  try {
    const response = await axios.get<TmdbResponse>(imdbFetchLink);
    const tmdbInfo = response.data;

    if (
      !tmdbInfo ||
      !tmdbInfo.movie_results ||
      tmdbInfo.movie_results.length === 0
    ) {
      console.log(`No additional entry found in TMDB for movie: ${title}`);
      return "N/A";
    }

    const movieResult = tmdbInfo.movie_results[0];
    return movieResult.poster_path
      ? `https://image.tmdb.org/t/p/w500${movieResult.poster_path}`
      : "N/A";
  } catch (error) {
    console.error(`Error fetching data from TMDB for movie: ${title}`, error);
    return "N/A";
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
