import express from "express";

const app = express();

app.use(express.json({ limit: "16kb" }));

app.get("/", (req, res) => {
  res.json({ message: "Backend assignment API" });
});

export default app;
