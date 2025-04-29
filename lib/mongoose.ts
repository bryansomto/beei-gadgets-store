import mongoose from 'mongoose';

// Global cache for connection (useful in development to avoid multiple connections)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function mongooseConnect() {
  // In tests, skip MONGODB_URI entirely (MongoMemoryServer handles connection manually)
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('❌ Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected');
  } catch (err) {
    cached.promise = null;
    console.error('❌ MongoDB connection failed', err);
    throw err;
  }

  return cached.conn;
}
