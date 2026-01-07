import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import pg from "pg";

const { Pool } = pg;

const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const allowedOrigins = CORS_ORIGIN.split(",").map((origin) => origin.trim());

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable.");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const app = express();

app.use(cors({ origin: allowedOrigins }));
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
      return res.status(409).json({ error: "Email deja folosit." });
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

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
