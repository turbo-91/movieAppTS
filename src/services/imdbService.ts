import axios from "axios";
import Movie from "@/db/models/Movie";
import movieThumbnail from "/public/movieThumbnail.png";
import { backdropUrl } from "@/lib/constants/constants";
import { IMovie } from "@/db/models/Movie";

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
