import mongoose from "mongoose";
import { MongoClient, ServerApiVersion } from "mongodb";

// Ensure MONGODB_URI is defined
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

// MongoDB connection options
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// Cached connections for performance
let cachedConnection: mongoose.Connection | null = null;
let cachedPromise: Promise<mongoose.Connection> | null = null;
let clientPromise: Promise<MongoClient>;

// Handle global caching in development (prevents multiple connections)
if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(
      MONGODB_URI,
      options
    ).connect();
  }
  clientPromise = globalWithMongo._mongoClient;
} else {
  clientPromise = new MongoClient(MONGODB_URI, options).connect();
}

async function dbConnect(): Promise<mongoose.Connection> {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is undefined. Check your .env.local file.");
    throw new Error("Please define the MONGODB_URI environment variable.");
  }

  if (cachedConnection) return cachedConnection;

  if (!cachedPromise) {
    const opts: mongoose.ConnectOptions = { bufferCommands: false };
    cachedPromise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => mongoose.connection);
  }

  try {
    cachedConnection = await cachedPromise;
  } catch (error) {
    cachedPromise = null;
    throw error;
  }

  return cachedConnection;
}

export { clientPromise };
export default dbConnect;
