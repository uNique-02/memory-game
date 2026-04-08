// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Helper: delay
 */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * 🔥 SIMPLE CACHE (prevents repeated API hits)
 */
let cache = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 1000 * 60; // 1 minute

/**
 * Route: Get random characters
 */
app.get("/api/random-characters", async (req, res) => {
  console.log("API HIT");

  try {
    const count = parseInt(req.query.count) || 6;

    // ✅ Serve from cache if still fresh
    if (Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log("⚡ Using cached data");
      return res.json(cache.data);
    }

    const characters = [];

    for (let i = 0; i < count; i++) {
      let success = false;
      let retries = 3;

      while (!success && retries > 0) {
        try {
          const response = await axios.get(
            "https://api.jikan.moe/v4/random/characters"
          );

          characters.push(response.data.data);
          success = true;

          // ✅ safer delay (IMPORTANT)
          await delay(1000);
        } catch (err) {
          if (err.response?.status === 429) {
            console.log("⚠️ Rate limited, retrying...");
            retries--;

            // exponential backoff
            await delay(1500);
          } else {
            throw err;
          }
        }
      }
    }

    // ✅ Save to cache
    cache = {
      data: characters,
      timestamp: Date.now(),
    };

    res.json(characters);
  } catch (err) {
    console.error("Proxy error:", err.response?.status, err.message);

    if (err.response?.status === 429) {
      return res.status(429).json({
        error: "Too many requests. Please slow down.",
      });
    }

    res.status(500).json({
      error: "Jikan API fetch failed.",
    });
  }
});

/**
 * Production: Serve frontend
 */
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "..", "client", "dist");

  app.use(express.static(frontendDistPath));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});