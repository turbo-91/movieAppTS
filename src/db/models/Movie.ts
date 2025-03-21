import mongoose, { Schema, Document } from "mongoose";

export interface IMovie extends Document {
  _id: number;
  netzkinoId: number;
  slug: string;
  title: string;
  year: [string];
  overview: string;
  regisseur: [string];
  stars: [string];
  imgNetzkino: string;
  imgNetzkinoSmall: string;
  imgImdb: string;
  queries: string[];
  dateFetched?: string[];
  savedBy?: string[];
}

const movieSchema = new Schema<IMovie>({
  _id: { type: Number, required: true },
  netzkinoId: { type: Number, required: true, unique: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  year: { type: [String], required: true },
  regisseur: { type: [String], required: true },
  stars: { type: [String], required: true },
  overview: { type: String, required: true },
  imgNetzkino: { type: String, required: true },
  imgNetzkinoSmall: { type: String, required: true },
  imgImdb: { type: String, required: true },
  queries: { type: [String], required: true },
  dateFetched: { type: String, required: false },
  savedBy: { type: [String], required: false },
});

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);

export default Movie;
