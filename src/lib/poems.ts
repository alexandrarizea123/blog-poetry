import { API_URL } from "./api";

export type Poem = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: number | null;
};

type NewPoem = {
  title: string;
  content: string;
  authorId?: number | null;
};

const WORDS_PER_MINUTE = 120;

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parsePoem(payload: any): Poem | null {
  if (
    !payload ||
    (typeof payload.id !== "number" && typeof payload.id !== "string") ||
    typeof payload.title !== "string" ||
    typeof payload.content !== "string" ||
    typeof payload.createdAt !== "string"
  ) {
    return null;
  }

  const id = Number(payload.id);
  if (!Number.isFinite(id)) {
    return null;
  }

  const authorId =
    typeof payload.authorId === "number" && Number.isFinite(payload.authorId)
      ? payload.authorId
      : null;

  return {
    id,
    title: payload.title,
    content: payload.content,
    createdAt: payload.createdAt,
    authorId
  };
}

export async function fetchPoems(): Promise<Poem[]> {
  const response = await fetch(`${API_URL}/api/poems`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la incarcare.");
  }

  if (!Array.isArray(payload?.poems)) {
    return [];
  }

  return payload.poems
    .map(parsePoem)
    .filter((poem): poem is Poem => Boolean(poem));
}

export async function createPoem({ title, content, authorId }: NewPoem) {
  const response = await fetch(`${API_URL}/api/poems`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, authorId })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la salvare.");
  }

  const poem = parsePoem(payload?.poem);
  if (!poem) {
    throw new Error("Raspuns invalid.");
  }

  return poem;
}

export async function deletePoem(id: number, authorId?: number | null) {
  const query =
    typeof authorId === "number" && Number.isFinite(authorId)
      ? `?authorId=${authorId}`
      : "";
  const response = await fetch(`${API_URL}/api/poems/${id}${query}`, {
    method: "DELETE"
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la stergere.");
  }
}

export function buildExcerpt(content: string, maxLength = 160) {
  const normalized = normalizeText(content);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const safeCut = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return `${safeCut}...`;
}

function getDayPart(date: Date) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "dimineata";
  }

  if (hour >= 12 && hour < 18) {
    return "amiaz";
  }

  if (hour >= 18 && hour < 22) {
    return "seara";
  }

  return "noapte";
}

export function buildMeta(createdAt: string, content: string) {
  const date = new Date(createdAt);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const dayPart = getDayPart(safeDate);
  const words = normalizeText(content)
    .split(" ")
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return `${dayPart}, ${minutes} min`;
}
