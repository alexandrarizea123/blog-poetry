import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { isValidPassword, sanitizeUser } from "../utils.js";

const router = express.Router();

const allowedRoles = new Set(["poet", "cititor"]);

router.post("/register", async (req, res) => {
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

router.post("/login", async (req, res) => {
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

router.post("/logout", (_req, res) => {
    return res.json({ ok: true });
});

export default router;
