import { API_URL } from "./api";

export type Gallery = {
  id: number;
  name: string;
  authorId: number;
  createdAt: string;
};

const HIDDEN_GALLERY_NAMES = new Set(["general"]);

function normalizeGalleryName(name: string) {
  return name.trim().toLowerCase();
}

export function isHiddenGalleryName(name: string) {
  return HIDDEN_GALLERY_NAMES.has(normalizeGalleryName(name));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseGallery(payload: unknown): Gallery | null {
  if (!isRecord(payload)) {
    return null;
  }

  const { id, name, authorId, createdAt } = payload;

  if (
    (typeof id !== "number" && typeof id !== "string") ||
    typeof name !== "string" ||
    typeof createdAt !== "string"
  ) {
    return null;
  }

  const normalizedId = Number(id);
  if (!Number.isFinite(normalizedId)) {
    return null;
  }

  const normalizedAuthorId = Number(authorId);
  if (!Number.isFinite(normalizedAuthorId)) {
    return null;
  }

  return {
    id: normalizedId,
    name,
    authorId: normalizedAuthorId,
    createdAt
  };
}

export async function fetchGalleries(
  authorId?: number | null
): Promise<Gallery[]> {
  const query =
    typeof authorId === "number" && Number.isFinite(authorId)
      ? `?authorId=${authorId}`
      : "";
  const response = await fetch(`${API_URL}/api/galleries${query}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la incarcare.");
  }

  if (!Array.isArray(payload?.galleries)) {
    return [];
  }

  return payload.galleries
    .map(parseGallery)
    .filter((gallery: Gallery | null): gallery is Gallery => Boolean(gallery));
}

export async function createGallery(name: string, authorId: number) {
  const response = await fetch(`${API_URL}/api/galleries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, authorId })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la salvare.");
  }

  const gallery = parseGallery(payload?.gallery);
  if (!gallery) {
    throw new Error("Raspuns invalid.");
  }

  return gallery;
}

export async function updateGallery(
  id: number,
  name: string,
  authorId: number
) {
  const response = await fetch(`${API_URL}/api/galleries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, authorId })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la editare.");
  }

  const gallery = parseGallery(payload?.gallery);
  if (!gallery) {
    throw new Error("Raspuns invalid.");
  }

  return gallery;
}

export async function deleteGallery(id: number, authorId: number) {
  const response = await fetch(
    `${API_URL}/api/galleries/${id}?authorId=${authorId}`,
    {
      method: "DELETE"
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Eroare la stergere.");
  }
}
