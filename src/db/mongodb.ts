import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://torbenJost:caWkwZVrb9W5Ljpg@cluster0.lhj4cxs.mongodb.net/moviesAppTS";
console.log(MONGODB_URI);

if (!MONGODB_URI) {
  console.error("MONGODB_URI is undefined. Check your .env.local file.");
  throw new Error("Please define the MONGODB_URI environment variable.");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
