import mongoose from 'mongoose';

const maskUri = (uri) => {
  try {
    const u = new URL(uri.trim());
    if (u.username) u.username = '***';
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return uri;
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('MONGODB_URI not set');

  // Optional: extract dbName safely (not required if URI already has /SmartClinic)
  let dbName;
  try {
    const u = new URL(uri);
    if (u.pathname && u.pathname !== '/') {
      dbName = decodeURIComponent(u.pathname.slice(1)); // "SmartClinic"
    }
  } catch { /* ignore */ }

  try {
    await mongoose.connect(uri, dbName ? { dbName } : undefined);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(`Failed to connect to MongoDB at ${maskUri(uri)}:`, err);
    throw err;
  }
};
