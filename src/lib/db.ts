import dns from "node:dns";
import mongoose from "mongoose";

// Prefer IPv4 so mongodb+srv lookups don't stall on broken IPv6 routes.
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      family: 4,
      serverSelectionTimeoutMS: 12_000,
    });
  }

  cached.conn = await cached.promise;
  global.mongooseCache = cached;
  return cached.conn;
}

export function hasMongoUri() {
  return Boolean(MONGODB_URI);
}
