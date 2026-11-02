import mongoose from "mongoose";

export default function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body exceeds the 16 KB limit." });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "Username or email already exists." });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "Invalid field value. Check the documented field requirements." });
  }
  if (mongoose.connection.readyState !== 1 || error.name?.includes("Network") || error.name?.includes("ServerSelection")) {
    return res.status(503).json({ message: "Database unavailable. Try again shortly." });
  }
  res.status(500).json({ message: "Internal server error" });
}
