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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePoem(payload: unknown): Poem | null {
  if (!isRecord(payload)) {
    return null;
  }

  const { id, title, content, createdAt, authorId } = payload;

  if (
    (typeof id !== "number" && typeof id !== "string") ||
    typeof title !== "string" ||
    typeof content !== "string" ||
    typeof createdAt !== "string"
  ) {
    return null;
  }

  const normalizedId = Number(id);
  if (!Number.isFinite(normalizedId)) {
    return null;
  }

  const normalizedAuthorId =
    typeof authorId === "number" && Number.isFinite(authorId)
      ? authorId
      : null;

  return {
    id: normalizedId,
    title,
    content,
    createdAt,
    authorId: normalizedAuthorId
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
    .filter((poem: Poem | null): poem is Poem => Boolean(poem));
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

export async function updatePoem(
  id: number,
  { title, content, authorId }: NewPoem
) {
  const response = await fetch(`${API_URL}/api/poems/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, authorId })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la editare.");
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
