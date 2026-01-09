import { API_URL } from "./api";

export type PoemInteractions = {
  liked: number[];
  saved: number[];
  read: number[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseIdList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "number" ? item : Number(item)))
    .filter((item) => Number.isInteger(item));
}

function parseInteractions(payload: unknown): PoemInteractions | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    liked: parseIdList(payload.liked),
    saved: parseIdList(payload.saved),
    read: parseIdList(payload.read)
  };
}

export async function fetchPoemInteractions(
  userId: number,
  poemIds: number[]
): Promise<PoemInteractions> {
  if (!poemIds.length) {
    return { liked: [], saved: [], read: [] };
  }

  const params = new URLSearchParams({
    poemIds: poemIds.join(",")
  });
  const response = await fetch(
    `${API_URL}/api/users/${userId}/poem-interactions?${params.toString()}`
  );
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la incarcare.");
  }

  const interactions = parseInteractions(payload);
  if (!interactions) {
    throw new Error("Raspuns invalid.");
  }

  return interactions;
}

export async function markPoemRead(poemId: number, readerId: number) {
  const response = await fetch(`${API_URL}/api/poems/${poemId}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ readerId })
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la salvare.");
  }
}

export async function likePoem(poemId: number, userId: number) {
  const response = await fetch(`${API_URL}/api/poems/${poemId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la salvare.");
  }
}

export async function unlikePoem(poemId: number, userId: number) {
  const response = await fetch(
    `${API_URL}/api/poems/${poemId}/like?userId=${userId}`,
    { method: "DELETE" }
  );
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la stergere.");
  }
}

export async function savePoem(poemId: number, userId: number) {
  const response = await fetch(`${API_URL}/api/poems/${poemId}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la salvare.");
  }
}

export async function unsavePoem(poemId: number, userId: number) {
  const response = await fetch(
    `${API_URL}/api/poems/${poemId}/save?userId=${userId}`,
    { method: "DELETE" }
  );
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la stergere.");
  }
}
