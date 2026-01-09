import express from "express";
import { pool } from "../db.js";
import { sanitizeGallery } from "../utils.js";

const router = express.Router();

router.get("/", async (req, res) => {
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

router.post("/", async (req, res) => {
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

router.put("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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

export default router;
