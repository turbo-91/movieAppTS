import mongoose, { Schema, Document } from "mongoose";

export interface IQuery extends Document {
  query: string;
}

const queriesSchema = new Schema<IQuery>({
  query: { type: String, required: true },
});

const Query =
  mongoose.models.Queries || mongoose.model("Queries", queriesSchema);

export default Query;
