import pg from "pg";
import { curatedPoems } from "./curatedPoems.js";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
const DB_CONNECT_RETRIES = Number(process.env.DB_CONNECT_RETRIES ?? 10);
const DB_CONNECT_DELAY_MS = Number(process.env.DB_CONNECT_DELAY_MS ?? 1000);

if (!DATABASE_URL) {
    console.error("Missing DATABASE_URL environment variable.");
    process.exit(1);
}

export const pool = new Pool({ connectionString: DATABASE_URL });

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
    await pool.query(`create table if not exists poem_reads (
    id serial primary key,
    poem_id integer not null references poems(id) on delete cascade,
    reader_id integer not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (poem_id, reader_id)
  )`);
    await pool.query(`create table if not exists poem_likes (
    id serial primary key,
    poem_id integer not null references poems(id) on delete cascade,
    user_id integer not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (poem_id, user_id)
  )`);
    await pool.query(`create table if not exists poem_saves (
    id serial primary key,
    poem_id integer not null references poems(id) on delete cascade,
    user_id integer not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (poem_id, user_id)
  )`);
    await pool.query(
        "alter table poems add column if not exists gallery_id integer references galleries(id) on delete set null"
    );
}

async function seedCuratedPoems() {
    if (!curatedPoems.length) {
        return;
    }

    const result = await pool.query(
        "select count(*)::int as count from poems where author_id is null"
    );
    const existingCount = Number(result.rows[0]?.count ?? 0);

    if (existingCount > 0) {
        return;
    }

    for (const poem of curatedPoems) {
        await pool.query("insert into poems (title, content) values ($1, $2)", [
            poem.title,
            poem.content
        ]);
    }
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectWithRetry() {
    for (let attempt = 1; attempt <= DB_CONNECT_RETRIES; attempt += 1) {
        try {
            await ensureSchema();
            await seedCuratedPoems();
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
