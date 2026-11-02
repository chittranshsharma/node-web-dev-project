import express from "express";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import errorHandler from "./middleware/error-handler.js";

const app = express();

app.use(express.json({ limit: "16kb" }));

app.get("/", (req, res) => {
  res.json({ message: "Backend assignment API" });
});

app.use((req, res, next) => {
  if (["POST", "PATCH"].includes(req.method)) {
    if (!req.is("application/json")) {
      return res.status(415).json({ message: "Use Content-Type: application/json." });
    }
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Request body must be a JSON object." });
    }
  }
  next();
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;
