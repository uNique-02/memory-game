// server.js
import express from "express";
import axios from "axios";
import cors from "cors"; // ✅ Allow frontend requests
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Enable CORS for all origins (or configure as needed)
app.use(cors());

app.get("/api/random-characters", async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 6;

    const requests = Array.from({ length: count }, () =>
      axios.get("https://api.jikan.moe/v4/random/characters")
    );

    const responses = await Promise.all(requests);
    const characters = responses.map((r) => r.data.data);

    res.json(characters);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: "Jikan API fetch failed." });
  }
});

// Production: serve frontend
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");

  app.use(express.static(frontendDistPath));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
