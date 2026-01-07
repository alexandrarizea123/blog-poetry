import { API_URL } from "./api";

export type PoetStats = {
  poemCount: number;
  reads: number;
  readers: number;
  likes: number;
  saves: number;
  lastPublishedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseNumber(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
}

function parseStats(payload: unknown): PoetStats | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    poemCount: parseNumber(payload.poemCount),
    reads: parseNumber(payload.reads),
    readers: parseNumber(payload.readers),
    likes: parseNumber(payload.likes),
    saves: parseNumber(payload.saves),
    lastPublishedAt:
      typeof payload.lastPublishedAt === "string" || payload.lastPublishedAt === null
        ? payload.lastPublishedAt
        : null
  };
}

export async function fetchPoetStats(poetId: number): Promise<PoetStats> {
  const response = await fetch(`${API_URL}/api/poets/${poetId}/stats`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la incarcare.");
  }

  const stats = parseStats(payload?.stats);
  if (!stats) {
    throw new Error("Raspuns invalid.");
  }

  return stats;
}
