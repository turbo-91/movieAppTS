import mongoose, { Schema, Document } from "mongoose";

export interface IMovie extends Document {
  netzkinoId: number;
  slug: string;
  title: string;
  year: number;
  overview: string;
  imgNetzkino: string;
  imgNetzkinoSmall: string;
  imgImdb: string;
  queries: string[];
}

// Define Schema with TypeScript
const movieSchema = new Schema<IMovie>({
  netzkinoId: { type: Number, required: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  year: { type: Number, required: true },
  overview: { type: String, required: true },
  imgNetzkino: { type: String, required: true },
  imgNetzkinoSmall: { type: String, required: true },
  imgImdb: { type: String, required: true },
  queries: { type: [String], required: true },
});

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);

export default Movie;
