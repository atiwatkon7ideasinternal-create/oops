import mongoose from 'mongoose';

let connecting: Promise<typeof mongoose> | null = null;

export async function connectMongo(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connecting) return connecting;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');

  connecting = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    await connecting;
    console.log('✓ MongoDB connected');
    return mongoose;
  } catch (err) {
    connecting = null;
    throw err;
  }
}
