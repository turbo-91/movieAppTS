import dbConnect from "@/db/mongodb";
import Movie from "@/db/models/Movie";
import axios from "axios";
import { IMovie } from "@/db/models/Movie";
import { idToImg } from "@/lib/iDtoImg";

export async function fetchMoviesOfTheDay(
  names: string[],
  usedQueries: string[]
) {
  await dbConnect();

  const query = names[Math.floor(Math.random() * names.length)];
  const netzkinoKey = process.env.NEXT_PUBLIC_NETZKINO_KEY;

  const netzkinoURL = `https://api.netzkino.de.simplecache.net/capi-2.0a/search`;

  // query has already been used: movies in database

  if (usedQueries.includes(query)) {
    return getMoviesByQuery(query);
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
      };
    });

    console.log("movies vor return", movies);

    postMovies(movies);

    // post route queries bauen
    // post query to list

    return movies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
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

export async function postMovies(movies) {
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
