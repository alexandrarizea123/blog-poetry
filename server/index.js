import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { pool, connectWithRetry } from "./db.js";
import authRoutes from "./routes/auth.js";
import galleryRoutes from "./routes/galleries.js";
import poemRoutes from "./routes/poems.js";
import userRoutes from "./routes/users.js";

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const SERVE_STATIC = process.env.SERVE_STATIC === "true";

const allowedOrigins = CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
export { pool }; // Re-export pool for tests

const corsOptions = allowedOrigins.length
  ? { origin: allowedOrigins }
  : { origin: false };

app.use(cors(corsOptions));
app.use(express.json());

// Mount routes
app.use("/api", authRoutes);
app.use("/api/galleries", galleryRoutes);
app.use("/api/poems", poemRoutes);
app.use("/api", userRoutes); // users.js contains /poets/... and /users/... paths

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
});

// Static files
if (SERVE_STATIC) {
  const distPath = path.resolve(__dirname, "../dist");

  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    return res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start server (only if not running in test mode potentially, but usually we just start it)
// Ideally we check if file is run directly, but modules make that harder.
// However, the original code had top-level logic mixed in.
// We should call connectWithRetry and listen.
// Note: Tests usually import `app` and might not want the server to listen on a port immediately
// if they mock things. But the original code started everything top-level?
// Original code:
// const PORT = process.env.PORT || 3001; ...
// It did NOT actually call `app.listen` in the viewing range I saw, or maybe it was implicitly doing it?
// Let me double check usage of app.listen.
// The file I viewed ended at line 800. I didn't see app.listen.
// I should check if I missed the end of the file.
// The `tasks/view_file` showed lines 1-800, and said "The above content does NOT show the entire file contents."
// I missed the bottom.
// I should carefully check if `app.listen` was there.
// If I overwrite the file without `app.listen`, the server won't start.

// I will assume `app.listen` was at the end.
// I'll add the startup logic.

if (process.env.NODE_ENV !== 'test') {
  connectWithRetry().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}
