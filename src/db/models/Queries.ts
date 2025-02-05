import mongoose, { Schema, Document } from "mongoose";

export interface IQueries extends Document {
  queries: string[];
}

// Define Schema with TypeScript
const queriesSchema = new Schema<IQueries>({
  queries: { type: [String], required: true },
});

const Queries =
  mongoose.models.Queries || mongoose.model("Queries", queriesSchema);

export default Queries;
