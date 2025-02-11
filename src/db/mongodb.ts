import mongoose from "mongoose";

let cachedConnection: mongoose.Connection | null = null;
let cachedPromise: Promise<mongoose.Connection> | null = null;

async function dbConnect(): Promise<mongoose.Connection> {
  const MONGODB_URI = process.env.MONGODB_URI; // Move this inside the function

  if (!MONGODB_URI) {
    console.error("MONGODB_URI is undefined. Check your .env.local file.");
    throw new Error("Please define the MONGODB_URI environment variable.");
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  if (!cachedPromise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

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

export default dbConnect;
