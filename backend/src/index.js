import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT || 4000);

app.listen(port, "127.0.0.1", () => {
  console.log(`Server running at http://localhost:${port}`);
});
