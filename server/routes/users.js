import express from "express";
import { pool } from "../db.js";
import { sanitizePoem } from "../utils.js";

const router = express.Router();

router.get("/poets/:id/stats", async (req, res) => {
    const poetId = Number(req.params.id);

    if (!Number.isInteger(poetId)) {
        return res.status(400).json({ error: "Id invalid." });
    }

    try {
        const result = await pool.query(
            `select
        (select count(*) from poems where author_id = $1) as poem_count,
        (select count(*) from poem_reads pr join poems p on p.id = pr.poem_id where p.author_id = $1) as reads,
        (select count(distinct pr.reader_id) from poem_reads pr join poems p on p.id = pr.poem_id where p.author_id = $1) as readers,
        (select count(*) from poem_likes pl join poems p on p.id = pl.poem_id where p.author_id = $1) as likes,
        (select count(*) from poem_saves ps join poems p on p.id = ps.poem_id where p.author_id = $1) as saves,
        (select max(created_at) from poems where author_id = $1) as last_published_at
      `,
            [poetId]
        );

        const row = result.rows[0] ?? {};
        const lastPublished = row.last_published_at;
        return res.json({
            stats: {
                poemCount: Number(row.poem_count ?? 0),
                reads: Number(row.reads ?? 0),
                readers: Number(row.readers ?? 0),
                likes: Number(row.likes ?? 0),
                saves: Number(row.saves ?? 0),
                lastPublishedAt:
                    lastPublished instanceof Date
                        ? lastPublished.toISOString()
                        : lastPublished ?? null
            }
        });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la incarcare." });
    }
});

router.get("/users/:id/liked-poems", async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
        return res.status(400).json({ error: "Id invalid." });
    }

    try {
        const result = await pool.query(
            `select p.id, p.title, p.content, p.created_at, p.author_id, p.gallery_id
       from poem_likes pl
       join poems p on p.id = pl.poem_id
       where pl.user_id = $1
       order by pl.created_at desc`,
            [userId]
        );

        return res.json({ poems: result.rows.map(sanitizePoem) });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la incarcare." });
    }
});

router.get("/users/:id/saved-poems", async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
        return res.status(400).json({ error: "Id invalid." });
    }

    try {
        const result = await pool.query(
            `select p.id, p.title, p.content, p.created_at, p.author_id, p.gallery_id
       from poem_saves ps
       join poems p on p.id = ps.poem_id
       where ps.user_id = $1
       order by ps.created_at desc`,
            [userId]
        );

        return res.json({ poems: result.rows.map(sanitizePoem) });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la incarcare." });
    }
});

router.get("/users/:id/poem-interactions", async (req, res) => {
    const userId = Number(req.params.id);
    const rawPoemIds =
        typeof req.query.poemIds === "string" ? req.query.poemIds : "";
    const poemIds = rawPoemIds
        .split(",")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value));

    if (!Number.isInteger(userId)) {
        return res.status(400).json({ error: "Id invalid." });
    }

    if (poemIds.length === 0) {
        return res.json({ liked: [], saved: [], read: [] });
    }

    try {
        const [likedResult, savedResult, readResult] = await Promise.all([
            pool.query(
                "select poem_id from poem_likes where user_id = $1 and poem_id = any($2)",
                [userId, poemIds]
            ),
            pool.query(
                "select poem_id from poem_saves where user_id = $1 and poem_id = any($2)",
                [userId, poemIds]
            ),
            pool.query(
                "select poem_id from poem_reads where reader_id = $1 and poem_id = any($2)",
                [userId, poemIds]
            )
        ]);

        return res.json({
            liked: likedResult.rows.map((row) => row.poem_id),
            saved: savedResult.rows.map((row) => row.poem_id),
            read: readResult.rows.map((row) => row.poem_id)
        });
    } catch (error) {
        return res.status(500).json({ error: "Eroare la incarcare." });
    }
});

export default router;
