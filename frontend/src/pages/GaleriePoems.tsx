import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  fetchGalleries,
  isHiddenGalleryName,
  type Gallery
} from "../lib/galleries";
import {
  buildExcerpt,
  buildMeta,
  deletePoem,
  fetchPoems,
  updatePoem,
  type Poem
} from "../lib/poems";
import {
  fetchPoemInteractions,
  likePoem,
  markPoemRead,
  savePoem,
  unlikePoem,
  unsavePoem
} from "../lib/poemInteractions";

type DisplayPoem = {
  key: string;
  title: string;
  meta: string;
  excerpt: string;
  content?: string;
  canDelete: boolean;
  id: number | null;
  galleryId?: number | null;
  galleryName?: string | null;
  authorId?: number | null;
};

type GalleryFilter = "all" | "none" | number | "invalid";

export function GaleriePoems() {
  const { galleryId } = useParams();
  const { user } = useAuth();
  const [storedPoems, setStoredPoems] = useState<Poem[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editPoemId, setEditPoemId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [likedPoems, setLikedPoems] = useState<number[]>([]);
  const [savedPoems, setSavedPoems] = useState<number[]>([]);
  const [readPoems, setReadPoems] = useState<number[]>([]);

  const selectedFilter: GalleryFilter = useMemo(() => {
    if (!galleryId || galleryId === "toate") {
      return "all";
    }
    if (galleryId === "fara") {
      return "none";
    }
    const parsedId = Number(galleryId);
    return Number.isInteger(parsedId) ? parsedId : "invalid";
  }, [galleryId]);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setIsLoading(true);

      const [poemsResult, galleriesResult] = await Promise.allSettled([
        fetchPoems(),
        fetchGalleries()
      ]);

      if (!isActive) {
        return;
      }

      if (poemsResult.status === "fulfilled") {
        setStoredPoems(poemsResult.value);
        setError(null);
      } else {
        setError(
          poemsResult.reason instanceof Error
            ? poemsResult.reason.message
            : "Eroare la incarcare."
        );
      }

      if (galleriesResult.status === "fulfilled") {
        setGalleries(galleriesResult.value);
        setGalleryError(null);
      } else {
        setGalleryError(
          galleriesResult.reason instanceof Error
            ? galleriesResult.reason.message
            : "Nu am putut incarca galeriile."
        );
      }

      setIsLoading(false);
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInteractions() {
      if (!user) {
        setLikedPoems([]);
        setSavedPoems([]);
        setReadPoems([]);
        setInteractionError(null);
        return;
      }

      const poemIds = storedPoems.map((poem) => poem.id);
      if (poemIds.length === 0) {
        setLikedPoems([]);
        setSavedPoems([]);
        setReadPoems([]);
        setInteractionError(null);
        return;
      }

      try {
        const interactions = await fetchPoemInteractions(user.id, poemIds);
        if (isActive) {
          setLikedPoems(interactions.liked);
          setSavedPoems(interactions.saved);
          setReadPoems(interactions.read);
          setInteractionError(null);
        }
      } catch (loadError) {
        if (isActive) {
          setInteractionError(
            loadError instanceof Error
              ? loadError.message
              : "Nu am putut incarca interactiunile."
          );
        }
      }
    }

    loadInteractions();

    return () => {
      isActive = false;
    };
  }, [storedPoems, user]);

  async function handleDelete(poemId: number) {
    if (!user) {
      setError("Trebuie sa fii autentificat.");
      return;
    }

    try {
      await deletePoem(poemId, user.id);
      setStoredPoems((items) => items.filter((poem) => poem.id !== poemId));
      if (editPoemId === poemId) {
        setEditPoemId(null);
        setEditTitle("");
        setEditContent("");
        setEditError(null);
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Eroare la stergere."
      );
    }
  }

  function startEdit(poem: Poem) {
    setEditPoemId(poem.id);
    setEditTitle(poem.title);
    setEditContent(poem.content);
    setEditError(null);
  }

  function cancelEdit() {
    setEditPoemId(null);
    setEditTitle("");
    setEditContent("");
    setEditError(null);
  }

  async function handleSave(poemId: number, galleryIdValue: number | null) {
    if (!user) {
      setEditError("Trebuie sa fii autentificat.");
      return;
    }

    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      setEditError("Completeaza titlul si textul poeziei.");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updatePoem(poemId, {
        title: trimmedTitle,
        content: trimmedContent,
        authorId: user.id,
        galleryId: galleryIdValue
      });
      setStoredPoems((items) =>
        items.map((poem) => (poem.id === poemId ? updated : poem))
      );
      cancelEdit();
    } catch (saveError) {
      setEditError(
        saveError instanceof Error
          ? saveError.message
          : "Eroare la editare."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRead(poemId: number) {
    if (!user) {
      setInteractionError("Trebuie sa fii autentificat.");
      return;
    }

    try {
      await markPoemRead(poemId, user.id);
      setReadPoems((items) =>
        items.includes(poemId) ? items : [...items, poemId]
      );
      setInteractionError(null);
    } catch (readError) {
      setInteractionError(
        readError instanceof Error ? readError.message : "Eroare la salvare."
      );
    }
  }

  async function handleToggleLike(poemId: number, isLiked: boolean) {
    if (!user) {
      setInteractionError("Trebuie sa fii autentificat.");
      return;
    }

    try {
      if (isLiked) {
        await unlikePoem(poemId, user.id);
        setLikedPoems((items) => items.filter((id) => id !== poemId));
      } else {
        await likePoem(poemId, user.id);
        setLikedPoems((items) =>
          items.includes(poemId) ? items : [...items, poemId]
        );
      }
      setInteractionError(null);
    } catch (likeError) {
      setInteractionError(
        likeError instanceof Error ? likeError.message : "Eroare la salvare."
      );
    }
  }

  async function handleToggleSave(poemId: number, isSaved: boolean) {
    if (!user) {
      setInteractionError("Trebuie sa fii autentificat.");
      return;
    }

    try {
      if (isSaved) {
        await unsavePoem(poemId, user.id);
        setSavedPoems((items) => items.filter((id) => id !== poemId));
      } else {
        await savePoem(poemId, user.id);
        setSavedPoems((items) =>
          items.includes(poemId) ? items : [...items, poemId]
        );
      }
      setInteractionError(null);
    } catch (saveError) {
      setInteractionError(
        saveError instanceof Error ? saveError.message : "Eroare la salvare."
      );
    }
  }

  const hiddenGalleryIds = useMemo(() => {
    return new Set(
      galleries
        .filter((gallery) => isHiddenGalleryName(gallery.name))
        .map((gallery) => gallery.id)
    );
  }, [galleries]);

  const visibleGalleries = useMemo(() => {
    return galleries.filter((gallery) => !isHiddenGalleryName(gallery.name));
  }, [galleries]);

  const galleryNameById = useMemo(() => {
    return new Map(
      visibleGalleries.map((gallery) => [gallery.id, gallery.name])
    );
  }, [visibleGalleries]);

  const isInvalidGallery = selectedFilter === "invalid";
  const galleryExists =
    typeof selectedFilter === "number"
      ? galleryNameById.has(selectedFilter)
      : true;

  const filteredStoredPoems = useMemo(() => {
    if (selectedFilter === "all") {
      return storedPoems;
    }
    if (selectedFilter === "none") {
      return storedPoems.filter(
        (poem) => !poem.galleryId || hiddenGalleryIds.has(poem.galleryId)
      );
    }
    if (typeof selectedFilter === "number") {
      if (hiddenGalleryIds.has(selectedFilter)) {
        return [];
      }
      return storedPoems.filter((poem) => poem.galleryId === selectedFilter);
    }
    return [];
  }, [hiddenGalleryIds, selectedFilter, storedPoems]);

  const displayPoems: DisplayPoem[] = filteredStoredPoems.map((poem) => ({
    key: `user-${poem.id}`,
    id: poem.id,
    title: poem.title,
    content: poem.content,
    meta: buildMeta(poem.createdAt, poem.content),
    excerpt: buildExcerpt(poem.content),
    galleryId: poem.galleryId,
    galleryName: poem.galleryId
      ? galleryNameById.get(poem.galleryId) ?? null
      : null,
    canDelete: poem.authorId === user?.id,
    authorId: poem.authorId ?? null
  }));

  const selectedGalleryLabel =
    selectedFilter === "all"
      ? "Toate poeziile"
      : selectedFilter === "none"
        ? "Fara galerie"
        : typeof selectedFilter === "number"
          ? galleryNameById.get(selectedFilter) ?? "Galerie"
          : "Galerie";

  const likedSet = useMemo(() => new Set(likedPoems), [likedPoems]);
  const savedSet = useMemo(() => new Set(savedPoems), [savedPoems]);
  const readSet = useMemo(() => new Set(readPoems), [readPoems]);

  return (
    <main className="min-h-screen text-black">
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
        <header className="border-b border-black/20 pb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-black/60">
            galerie
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {selectedGalleryLabel}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/galerie"
              className="inline-flex items-center justify-center rounded-full border border-black px-6 py-2 text-xs uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white"
            >
              Inapoi la galerii
            </Link>
            <Link
              to="/galerie/toate"
              className="inline-flex items-center justify-center rounded-full border border-black/20 px-6 py-2 text-xs uppercase tracking-[0.25em] text-black/70 transition hover:border-black hover:text-black"
            >
              Toate poeziile
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          {error ? (
            <p className="text-sm text-black sm:col-span-2">{error}</p>
          ) : null}
          {galleryError ? (
            <p className="text-sm text-black/70 sm:col-span-2">
              {galleryError}
            </p>
          ) : null}
          {interactionError ? (
            <p className="text-sm text-black/70 sm:col-span-2">
              {interactionError}
            </p>
          ) : null}
          {isInvalidGallery ? (
            <p className="text-sm text-black/70 sm:col-span-2">
              Galeria solicitata este invalida.
            </p>
          ) : null}
          {!isInvalidGallery && !galleryExists && !isLoading ? (
            <p className="text-sm text-black/70 sm:col-span-2">
              Galeria solicitata nu exista.
            </p>
          ) : null}
          {isLoading ? (
            <p className="text-sm text-black/70 sm:col-span-2">
              Se incarca poeziile...
            </p>
          ) : null}
          {!isLoading &&
          !isInvalidGallery &&
          galleryExists &&
          displayPoems.length === 0 ? (
            <p className="text-sm text-black/70 sm:col-span-2">
              Nu exista poezii in aceasta galerie.
            </p>
          ) : null}
          {displayPoems.map((poem) => {
            const poemId = poem.id;
            const resolvedPoemId = poemId ?? -1;
            const isStoredPoem = poemId !== null;
            const isEditing = editPoemId !== null && editPoemId === poemId;
            const isOwner =
              isStoredPoem && user ? poem.authorId === user.id : false;
            const canInteract = Boolean(user && isStoredPoem && !isOwner);
            const isLiked = isStoredPoem ? likedSet.has(resolvedPoemId) : false;
            const isSaved = isStoredPoem ? savedSet.has(resolvedPoemId) : false;
            const isRead = isStoredPoem ? readSet.has(resolvedPoemId) : false;

            return (
              <article
                key={poem.key}
                className="rounded-2xl border border-black/20 bg-white p-6 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)]"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                  {poem.meta}
                </p>
                {selectedFilter === "all" && poem.galleryName ? (
                  <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-black/50">
                    galerie: {poem.galleryName}
                  </p>
                ) : null}
                <div className="mt-3 flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">
                    {isEditing ? editTitle || poem.title : poem.title}
                  </h2>
                  {poem.canDelete && isStoredPoem ? (
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-black/60">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              handleSave(resolvedPoemId, poem.galleryId ?? null);
                            }}
                            disabled={isSaving}
                            className="transition hover:text-black disabled:cursor-not-allowed disabled:text-black/40"
                          >
                            {isSaving ? "Salveaza..." : "Salveaza"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="transition hover:text-black"
                          >
                            Renunta
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const current = storedPoems.find(
                                (item) => item.id === resolvedPoemId
                              );
                              if (current) {
                                startEdit(current);
                              }
                            }}
                            className="transition hover:text-black"
                          >
                            Editeaza
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleDelete(resolvedPoemId);
                            }}
                            className="transition hover:text-black"
                          >
                            Sterge
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
                {isEditing ? (
                  <div className="mt-4 grid gap-4">
                    <label className="block">
                      <span className="form-label">Titlu</span>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        className="form-control"
                      />
                    </label>
                    <label className="block">
                      <span className="form-label">Textul poeziei</span>
                      <textarea
                        rows={8}
                        value={editContent}
                        onChange={(event) => setEditContent(event.target.value)}
                        className="form-control min-h-[200px] resize-y"
                      />
                    </label>
                    {editError ? (
                      <p className="text-sm text-black">{editError}</p>
                    ) : null}
                  </div>
                ) : poem.content ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-black/80">
                    {poem.content}
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-black/80">
                    {poem.excerpt}
                  </p>
                )}
                {!isEditing && canInteract && poemId !== null ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-black/60">
                    <button
                      type="button"
                      onClick={() => handleRead(resolvedPoemId)}
                      disabled={isRead}
                      className="transition hover:text-black disabled:cursor-not-allowed disabled:text-black/40"
                    >
                      {isRead ? "Citit" : "Marcheaza ca citit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleLike(resolvedPoemId, isLiked)}
                      className="transition hover:text-black"
                    >
                      {isLiked ? "Apreciat" : "Apreciaza"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSave(resolvedPoemId, isSaved)}
                      className="transition hover:text-black"
                    >
                      {isSaved ? "Salvat" : "Salveaza"}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
