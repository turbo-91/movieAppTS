import dbConnect from "../db/mongodb";
import axios from "axios";
import Movie from "../db/models/Movie";
import idToImg from "@/lib/idToImg";
import Query from "../db/models/Query";

// next step: imgImdb ist nur der link, da fehlt der backdrop path DUH

export async function getMoviesOfTheDay(randomQueries: string[]) {
  await dbConnect();
  console.log("Fetching daily movies...");

  const netzkinoKey = process.env.NEXT_PUBLIC_NETZKINO_KEY;
  const today = new Date().toLocaleDateString();

  const netzkinoURL = `https://api.netzkino.de.simplecache.net/capi-2.0a/search`;

  // Check if today's movies already exist in the database
  console.log("Today's date: " + today);
  console.log("Checking if movies are already stored for today...");

  const todaysMovies = await Movie.find({ dateFetched: today });
  if (todaysMovies.length > 0) {
    console.log("Returning movies already fetched for today");
    return todaysMovies.slice(0, 5); // Return only the top 5
  }

  // movies have not been fetched today: fetch movies from APIs
  const collectedMovies: (typeof Movie)[] = [];
  const maxRetries = 10;
  for (
    let retryCount = 0;
    collectedMovies.length < 5 && retryCount < maxRetries;
    retryCount++
  ) {
    const query =
      randomQueries[Math.floor(Math.random() * randomQueries.length)];
    console.log("Fetching movies from external API using query: ", query);
    try {
      const response = await axios.get(
        `${netzkinoURL}?q=${query}&d=${netzkinoKey}`
      );

      if (!response.data || !Array.isArray(response.data.posts)) {
        throw new Error("Invalid Netzkino API response");
      }

      console.log("count total", response.data.count_total);
      if (response.data.count_total > 0) {
        postQuery(query);
      }

      // console.log("response from netzkino", response.data);

      const movies: (typeof Movie)[] = response.data.posts.map((movie: any) => {
        const imdbLink = movie.custom_fields?.["IMDb-Link"]?.[0];
        // console.log("imdbLink in movie", imdbLink);
        const imgImdb = imdbLink ? idToImg(imdbLink) : null;
        // console.log("imdgImdb in movie after extraction", imgImdb);

        return {
          netzkinoId: movie.id,
          slug: movie.slug,
          title: movie.title,
          year: movie.custom_fields?.Jahr || ["n/a"],
          regisseur: movie.custom_fields?.Regisseur || ["n/a"],
          stars: movie.custom_fields?.Stars || ["n/a"],
          overview: movie.content || "n/a",
          imgNetzkino:
            movie.custom_fields?.featured_img_all?.[0] || movie.thumbnail, // need other fallback
          imgNetzkinoSmall:
            movie.custom_fields?.featured_img_all_small?.[0] || movie.thumbnail, // need other fallback
          imgImdb: imgImdb || "n/a",
          queries: query,
          dateFetched: today,
        };
      });

      // console.log("movies from current retry", movies);

      // Accumulate movies from this API call
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

  // Save fetched movies to the database
  postMovies(collectedMovies);

  return collectedMovies.slice(0, 5);
}

export async function postMovies(movies: Movie[]) {
  await dbConnect();

  if (!Array.isArray(movies) || movies.length === 0) {
    throw new Error("Invalid input: movies must be a non-empty array");
  }

  try {
    const newMovies = await Movie.insertMany(movies);
    const moviesData = newMovies.map((movie) => movie.toObject()); // Convert Mongoos Model instances to plain objects = typescript stuff
    addImgImdb(moviesData);
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

//////////////////////// Next step: extract backdrop_path, paste it into img url and then change the imgImdb field with that link via PUT request

export async function addImgImdb(movies: Movie[]) {
  const moviesData = movies.map((movie) => movie.toObject()); // Convert Mongoose Model instances to plain objects

  for (const movie of moviesData) {
    // ✅ Use for...of loop
    const imdbLink = movie.imgImdb ?? "";
    const parts = imdbLink.split("/");
    const imdbId = parts.find((part: string) => part.startsWith("tt"));

    if (!imdbId) continue; // ✅ Skip if no IMDb ID is found -----> needs fallback image

    try {
      const imdbResponse = await axios.get(
        `https://api.themoviedb.org/3/find/${imdbId}?api_key=78247849b9888da02ffb1655caa3a9b9&language=de&external_source=imdb_id`
      );
      console.log("IMDb response for", imdbId, imdbResponse.data);
    } catch (error) {
      console.error("Error fetching imdbImg:", error);
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
