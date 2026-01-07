import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const SERVE_STATIC = process.env.SERVE_STATIC === "true";
const DB_CONNECT_RETRIES = Number(process.env.DB_CONNECT_RETRIES ?? 10);
const DB_CONNECT_DELAY_MS = Number(process.env.DB_CONNECT_DELAY_MS ?? 1000);
const allowedOrigins = CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable.");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const app = express();

const corsOptions = allowedOrigins.length
  ? { origin: allowedOrigins }
  : { origin: false };
app.use(cors(corsOptions));
app.use(express.json());

const allowedRoles = new Set(["poet", "cititor"]);

function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

function sanitizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role
  };
}

function sanitizePoem(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    authorId: row.author_id ?? null,
    galleryId: row.gallery_id ?? null
  };
}

function sanitizeGallery(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    authorId: row.author_id ?? null
  };
}

async function ensureSchema() {
  await pool.query(`create table if not exists users (
    id serial primary key,
    name text not null,
    email text not null unique,
    password_hash text not null,
    role text not null check (role in ('poet', 'cititor')),
    created_at timestamptz not null default now()
  )`);
  await pool.query(`create table if not exists galleries (
    id serial primary key,
    author_id integer not null references users(id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now(),
    unique (author_id, name)
  )`);
  await pool.query(`create table if not exists poems (
    id serial primary key,
    author_id integer references users(id) on delete set null,
    gallery_id integer references galleries(id) on delete set null,
    title text not null,
    content text not null,
    created_at timestamptz not null default now()
  )`);
  await pool.query(
    "alter table poems add column if not exists gallery_id integer references galleries(id) on delete set null"
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry() {
  for (let attempt = 1; attempt <= DB_CONNECT_RETRIES; attempt += 1) {
    try {
      await ensureSchema();
      return;
    } catch (error) {
      const isLastAttempt = attempt === DB_CONNECT_RETRIES;
      console.error(
        `Database connection failed (attempt ${attempt}/${DB_CONNECT_RETRIES}).`
      );
      if (isLastAttempt) {
        throw error;
      }
      await wait(DB_CONNECT_DELAY_MS);
    }
  }
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
});

app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body ?? {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Date incomplete." });
  }

  if (!allowedRoles.has(role)) {
    return res.status(400).json({ error: "Rol invalid." });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "Parola nu respecta cerintele." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(name).trim();

  try {
    const existing = await pool.query(
      "select id from users where email = $1",
      [normalizedEmail]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "E-mail deja folosit." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "insert into users (name, email, password_hash, role) values ($1, $2, $3, $4) returning id, name, email, role",
      [normalizedName, normalizedEmail, passwordHash, role]
    );

    return res.status(201).json({ user: sanitizeUser(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: "Eroare la inregistrare." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "Date incomplete." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    const result = await pool.query(
      "select id, name, email, role, password_hash from users where email = $1",
      [normalizedEmail]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Credentiale invalide." });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Credentiale invalide." });
    }

    if (role && role !== user.role) {
      return res.status(403).json({ error: "Rolul nu corespunde contului." });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: "Eroare la autentificare." });
  }
});

app.post("/api/logout", (_req, res) => {
  return res.json({ ok: true });
});

app.get("/api/galleries", async (req, res) => {
  const authorIdParam =
    typeof req.query.authorId === "string"
      ? Number(req.query.authorId)
      : null;
  const hasAuthorId = Number.isInteger(authorIdParam);

  try {
    const result = await pool.query(
      hasAuthorId
        ? "select id, name, author_id, created_at from galleries where author_id = $1 order by created_at desc"
        : "select id, name, author_id, created_at from galleries order by created_at desc",
      hasAuthorId ? [authorIdParam] : []
    );

    return res.json({ galleries: result.rows.map(sanitizeGallery) });
  } catch (error) {
    return res.status(500).json({ error: "Eroare la incarcare." });
  }
});

app.post("/api/galleries", async (req, res) => {
  const { name, authorId } = req.body ?? {};

  const normalizedName = typeof name === "string" ? name.trim() : "";
  const parsedAuthorId =
    typeof authorId === "number" && Number.isInteger(authorId)
      ? authorId
      : null;

  if (!normalizedName || parsedAuthorId === null) {
    return res.status(400).json({ error: "Date incomplete." });
  }

  try {
    const result = await pool.query(
      "insert into galleries (name, author_id) values ($1, $2) returning id, name, author_id, created_at",
      [normalizedName, parsedAuthorId]
    );

    return res.status(201).json({ gallery: sanitizeGallery(result.rows[0]) });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({ error: "Galerie existenta." });
    }
    return res.status(500).json({ error: "Eroare la salvare." });
  }
});

app.put("/api/galleries/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, authorId } = req.body ?? {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Id invalid." });
  }

  const normalizedName = typeof name === "string" ? name.trim() : "";
  const parsedAuthorId =
    typeof authorId === "number" && Number.isInteger(authorId)
      ? authorId
      : null;

  if (!normalizedName || parsedAuthorId === null) {
    return res.status(400).json({ error: "Date incomplete." });
  }

  try {
    const result = await pool.query(
      "update galleries set name = $1 where id = $2 and author_id = $3 returning id, name, author_id, created_at",
      [normalizedName, id, parsedAuthorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Galeria nu a fost gasita." });
    }

    return res.json({ gallery: sanitizeGallery(result.rows[0]) });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({ error: "Galerie existenta." });
    }
    return res.status(500).json({ error: "Eroare la editare." });
  }
});

app.delete("/api/galleries/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Id invalid." });
  }

  const authorIdParam =
    typeof req.query.authorId === "string"
      ? Number(req.query.authorId)
      : null;
  const hasAuthorId = Number.isInteger(authorIdParam);

  if (!hasAuthorId) {
    return res.status(400).json({ error: "Date incomplete." });
  }

  try {
    const result = await pool.query(
      "delete from galleries where id = $1 and author_id = $2 returning id",
      [id, authorIdParam]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Galeria nu a fost gasita." });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Eroare la stergere." });
  }
});

app.get("/api/poems", async (_req, res) => {
  try {
    const result = await pool.query(
      "select id, title, content, created_at, author_id, gallery_id from poems order by created_at desc"
    );

    return res.json({ poems: result.rows.map(sanitizePoem) });
  } catch (error) {
    return res.status(500).json({ error: "Eroare la incarcare." });
  }
});

app.post("/api/poems", async (req, res) => {
  const { title, content, authorId, galleryId } = req.body ?? {};

  if (!title || !content) {
    return res.status(400).json({ error: "Date incomplete." });
  }

  const normalizedTitle = String(title).trim();
  const normalizedContent = String(content).trim();
  const parsedAuthorId =
    typeof authorId === "number" && Number.isInteger(authorId)
      ? authorId
      : null;
  const parsedGalleryId =
    typeof galleryId === "number" &&
    Number.isInteger(galleryId) &&
    galleryId > 0
      ? galleryId
      : null;

  if (!normalizedTitle || !normalizedContent) {
    return res.status(400).json({ error: "Date incomplete." });
  }

  try {
    const result = await pool.query(
      "insert into poems (title, content, author_id, gallery_id) values ($1, $2, $3, $4) returning id, title, content, created_at, author_id, gallery_id",
      [normalizedTitle, normalizedContent, parsedAuthorId, parsedGalleryId]
    );

    return res.status(201).json({ poem: sanitizePoem(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: "Eroare la salvare." });
  }
});

app.put("/api/poems/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, content, authorId, galleryId } = req.body ?? {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Id invalid." });
  }

  if (!title || !content) {
    return res.status(400).json({ error: "Date incomplete." });
  }

  const normalizedTitle = String(title).trim();
  const normalizedContent = String(content).trim();
  const parsedAuthorId =
    typeof authorId === "number" && Number.isInteger(authorId)
      ? authorId
      : null;
  const parsedGalleryId =
    typeof galleryId === "number" &&
    Number.isInteger(galleryId) &&
    galleryId > 0
      ? galleryId
      : null;

  if (!normalizedTitle || !normalizedContent || parsedAuthorId === null) {
    return res.status(400).json({ error: "Date incomplete." });
  }

  try {
    const result = await pool.query(
      "update poems set title = $1, content = $2, gallery_id = $3 where id = $4 and author_id = $5 returning id, title, content, created_at, author_id, gallery_id",
      [normalizedTitle, normalizedContent, parsedGalleryId, id, parsedAuthorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Poezia nu a fost gasita." });
    }

    return res.json({ poem: sanitizePoem(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: "Eroare la editare." });
  }
});

app.delete("/api/poems/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Id invalid." });
  }

  const authorIdParam =
    typeof req.query.authorId === "string"
      ? Number(req.query.authorId)
      : null;
  const hasAuthorId = Number.isInteger(authorIdParam);

  try {
    const result = await pool.query(
      hasAuthorId
        ? "delete from poems where id = $1 and author_id = $2 returning id"
        : "delete from poems where id = $1 returning id",
      hasAuthorId ? [id, authorIdParam] : [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Poezia nu a fost gasita." });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Eroare la stergere." });
  }
});

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

async function startServer() {
  try {
    await connectWithRetry();
    const server = app.listen(PORT, () => {
      console.log(`Server Jurnal de poezie pornit pe http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      server.close(() => {
        console.log("HTTP server closed.");
      });
      try {
        await pool.end();
      } catch (closeError) {
        console.error("Failed to close database connection.");
        console.error(closeError);
      }
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start server.");
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

startServer();
