import express from "express";
import { pool } from "../db.js";
import { sanitizePoem, parseNumericId } from "../utils.js";

const router = express.Router();

router.get("/", async (_req, res) => {
    try {
        const result = await pool.query(
            "select id, title, content, created_at, author_id, gallery_id from poems order by created_at desc"
        );

        return res.json({ poems: result.rows.map(sanitizePoem) });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la incarcare." });
    }
});

router.post("/", async (req, res) => {
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

router.put("/:id", async (req, res) => {
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

router.post("/:id/read", async (req, res) => {
    const poemId = Number(req.params.id);
    const readerId = parseNumericId(req.body?.readerId);

    if (!Number.isInteger(poemId) || readerId === null) {
        return res.status(400).json({ error: "Date incomplete." });
    }

    try {
        const poemResult = await pool.query(
            "select author_id from poems where id = $1",
            [poemId]
        );

        if (poemResult.rowCount === 0) {
            return res.status(404).json({ error: "Poezia nu a fost gasita." });
        }

        const authorId = poemResult.rows[0].author_id;
        if (authorId === readerId) {
            return res.json({ ok: true, ignored: true });
        }

        await pool.query(
            "insert into poem_reads (poem_id, reader_id) values ($1, $2) on conflict do nothing",
            [poemId, readerId]
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la salvare." });
    }
});

router.post("/:id/like", async (req, res) => {
    const poemId = Number(req.params.id);
    const userId = parseNumericId(req.body?.userId);

    if (!Number.isInteger(poemId) || userId === null) {
        return res.status(400).json({ error: "Date incomplete." });
    }

    try {
        const poemResult = await pool.query(
            "select author_id from poems where id = $1",
            [poemId]
        );

        if (poemResult.rowCount === 0) {
            return res.status(404).json({ error: "Poezia nu a fost gasita." });
        }

        const authorId = poemResult.rows[0].author_id;
        if (authorId === userId) {
            return res.json({ ok: true, ignored: true });
        }

        await pool.query(
            "insert into poem_likes (poem_id, user_id) values ($1, $2) on conflict do nothing",
            [poemId, userId]
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la salvare." });
    }
});

router.delete("/:id/like", async (req, res) => {
    const poemId = Number(req.params.id);
    const userId = parseNumericId(req.query.userId);

    if (!Number.isInteger(poemId) || userId === null) {
        return res.status(400).json({ error: "Date incomplete." });
    }

    try {
        await pool.query(
            "delete from poem_likes where poem_id = $1 and user_id = $2",
            [poemId, userId]
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la stergere." });
    }
});

router.post("/:id/save", async (req, res) => {
    const poemId = Number(req.params.id);
    const userId = parseNumericId(req.body?.userId);

    if (!Number.isInteger(poemId) || userId === null) {
        return res.status(400).json({ error: "Date incomplete." });
    }

    try {
        const poemResult = await pool.query(
            "select author_id from poems where id = $1",
            [poemId]
        );

        if (poemResult.rowCount === 0) {
            return res.status(404).json({ error: "Poezia nu a fost gasita." });
        }

        const authorId = poemResult.rows[0].author_id;
        if (authorId === userId) {
            return res.json({ ok: true, ignored: true });
        }

        await pool.query(
            "insert into poem_saves (poem_id, user_id) values ($1, $2) on conflict do nothing",
            [poemId, userId]
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la salvare." });
    }
});

router.delete("/:id/save", async (req, res) => {
    const poemId = Number(req.params.id);
    const userId = parseNumericId(req.query.userId);

    if (!Number.isInteger(poemId) || userId === null) {
        return res.status(400).json({ error: "Date incomplete." });
    }

    try {
        await pool.query(
            "delete from poem_saves where poem_id = $1 and user_id = $2",
            [poemId, userId]
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la stergere." });
    }
});

export default router;
