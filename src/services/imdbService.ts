import axios from "axios";
import Movie from "@/db/models/Movie";
import movieThumbnail from "/public/movieThumbnail.png";
import { posterUrl } from "@/lib/constants/constants";
import { IMovie } from "@/db/models/Movie";
import dbConnect from "@/db/mongodb";

export async function addImgImdb(movies: IMovie[]) {
  await dbConnect();
  for (const movie of movies) {
    const imdbId = movie.imgImdb;
    if (imdbId === "n/a") {
      const updatedMovie = await Movie.findByIdAndUpdate(
        movie._id,
        { imgImdb: movie.imgNetzkino },
        { new: true }
      );
    } else {
      try {
        const response = await axios.get(imdbId);
        const poster = response.data.movie_results?.[0]?.poster_path;
        const poster_path = poster
          ? `${posterUrl}${poster}`
          : movie.imgNetzkino || movieThumbnail.src;
        const updatedMovie = await Movie.findByIdAndUpdate(
          movie._id,
          { imgImdb: poster_path },
          { new: true }
        );
      } catch (error) {
        console.error(`Error updating movie ${movie.netzkinoId}:`, error);
      }
    }
  }
}
