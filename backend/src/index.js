import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/database.js";
import { User } from "./models/user.model.js";

const port = Number(process.env.PORT || 4000);

try {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer from 1 to 65535.");
  }
  await connectDB();
  await User.init();
  const server = app.listen(port, "127.0.0.1", () => {
    console.log(`MongoDB connected. Server running at http://localhost:${port}`);
  });
  server.on("error", () => {
    console.error("Could not start the server. Check whether PORT is already in use.");
    process.exit(1);
  });
} catch {
  console.error("Startup failed. Check PORT, MONGODB_URI, Atlas database credentials, and IP access.");
  process.exit(1);
}
