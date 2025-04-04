import axios from "axios";
import movieThumbnail from "/public/movieThumbnail.png";
import { posterUrl } from "@/lib/constants/constants";
import { IMovie } from "@/db/models/Movie";

export async function addImgImdb(movie: IMovie) {
  if (movie.imgImdb === "n/a") return;
  const res = await axios.get(movie.imgImdb);
  const poster = res.data.movie_results?.[0]?.poster_path;
  movie.imgImdb = poster ? `${posterUrl}${poster}` : movieThumbnail.src;
  return movie;
}

export async function enrichMovies(movies: IMovie[]): Promise<IMovie[]> {
  const enrichedMovies = await Promise.all(
    movies.map(async (movie) => {
      const enriched = await addImgImdb(movie);
      return enriched || movie;
    })
  );

  return enrichedMovies;
}

// export async function addImgImdb(movies: IMovie[]) {
//   await dbConnect();
//   for (const movie of movies) {
//     const imdbId = movie.imgImdb;
//     if (imdbId === "n/a") {
//       const updatedMovie = await Movie.findByIdAndUpdate(
//         movie._id,
//         { imgImdb: movie.imgNetzkino },
//         { new: true }
//       );
//     } else {
//       try {
//         const response = await axios.get(imdbId);
//         const poster = response.data.movie_results?.[0]?.poster_path;
//         const poster_path = poster
//           ? `${posterUrl}${poster}`
//           : movie.imgNetzkino || movieThumbnail.src;
//         const updatedMovie = await Movie.findByIdAndUpdate(
//           movie._id,
//           { imgImdb: poster_path },
//           { new: true }
//         );
//       } catch (error) {
//         console.error(`Error updating movie ${movie.netzkinoId}:`, error);
//       }
//     }
//   }
// }
