import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

export default async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI in .env before starting the server.");
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000
  });
}
