import { env } from "@/data/env/server";
import mongoose, { Connection } from "mongoose";

const MONGO_URI = env.DATABASE_URL;

if (!MONGO_URI) {
  throw new Error("Please define the DATABASE_URL environment variable");
}

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var mongoose: CachedConnection;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => {
      console.log("Connected to MongoDB with Mongoose");
      return mongoose.connection;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
