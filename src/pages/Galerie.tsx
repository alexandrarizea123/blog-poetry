import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  deleteGallery,
  fetchGalleries,
  isHiddenGalleryName,
  updateGallery,
  type Gallery
} from "../lib/galleries";
import { fetchPoems, type Poem } from "../lib/poems";

export function Galerie() {
  const { user } = useAuth();
  const [storedPoems, setStoredPoems] = useState<Poem[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editGalleryId, setEditGalleryId] = useState<number | null>(null);
  const [editGalleryName, setEditGalleryName] = useState("");
  const [editGalleryError, setEditGalleryError] = useState<string | null>(null);
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [deletingGalleryId, setDeletingGalleryId] = useState<number | null>(
    null
  );

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

  const poemCountByGalleryId = useMemo(() => {
    const counts = new Map<number, number>();
    storedPoems.forEach((poem) => {
      if (poem.galleryId) {
        counts.set(poem.galleryId, (counts.get(poem.galleryId) ?? 0) + 1);
      }
    });
    return counts;
  }, [storedPoems]);

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

  const unassignedCount = useMemo(() => {
    return storedPoems.filter(
      (poem) => !poem.galleryId || hiddenGalleryIds.has(poem.galleryId)
    ).length;
  }, [storedPoems, hiddenGalleryIds]);

  const canManageGalleries = user?.role === "poet";

  function startGalleryEdit(gallery: Gallery) {
    setEditGalleryId(gallery.id);
    setEditGalleryName(gallery.name);
    setEditGalleryError(null);
  }

  function cancelGalleryEdit() {
    setEditGalleryId(null);
    setEditGalleryName("");
    setEditGalleryError(null);
  }

  async function handleSaveGallery(galleryId: number) {
    if (!user) {
      setEditGalleryError("Trebuie sa fii autentificat.");
      return;
    }

    const normalizedName = editGalleryName.trim();
    if (!normalizedName) {
      setEditGalleryError("Completeaza numele galeriei.");
      return;
    }
    if (isHiddenGalleryName(normalizedName)) {
      setEditGalleryError("Numele galeriei este rezervat.");
      return;
    }

    try {
      setIsSavingGallery(true);
      const updated = await updateGallery(galleryId, normalizedName, user.id);
      setGalleries((items) =>
        items.map((gallery) => (gallery.id === galleryId ? updated : gallery))
      );
      cancelGalleryEdit();
    } catch (saveError) {
      setEditGalleryError(
        saveError instanceof Error
          ? saveError.message
          : "Eroare la editare."
      );
    } finally {
      setIsSavingGallery(false);
    }
  }

  async function handleDeleteGallery(galleryId: number) {
    if (!user) {
      setGalleryError("Trebuie sa fii autentificat.");
      return;
    }

    if (!window.confirm("Sigur vrei sa stergi aceasta galerie?")) {
      return;
    }

    try {
      setDeletingGalleryId(galleryId);
      await deleteGallery(galleryId, user.id);
      setGalleries((items) => items.filter((gallery) => gallery.id !== galleryId));
      setStoredPoems((items) =>
        items.map((poem) =>
          poem.galleryId === galleryId ? { ...poem, galleryId: null } : poem
        )
      );
      if (editGalleryId === galleryId) {
        cancelGalleryEdit();
      }
    } catch (deleteError) {
      setGalleryError(
        deleteError instanceof Error
          ? deleteError.message
          : "Eroare la stergere."
      );
    } finally {
      setDeletingGalleryId(null);
    }
  }

  return (
    <main className="min-h-screen text-black">
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
        <header className="border-b border-black/20 pb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-black/60">
            galerie
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Galerii de poezie
          </h1>
          <div className="mt-6">
            <Link
              to="/home"
              className="inline-flex items-center justify-center rounded-full border border-black px-6 py-2 text-xs uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white"
            >
              Inapoi acasa
            </Link>
          </div>
        </header>

        <section aria-labelledby="galleries-title" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="galleries-title" className="text-2xl font-semibold">
              Galerii
            </h2>
            <p className="text-xs uppercase tracking-[0.3em] text-black/60">
              {visibleGalleries.length} galerii
            </p>
          </div>

          {galleryError ? (
            <p className="mt-4 text-sm text-black/70">{galleryError}</p>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-black/70">{error}</p>
          ) : null}
          {isLoading ? (
            <p className="mt-4 text-sm text-black/70">Se incarca galeriile...</p>
          ) : null}
          {!isLoading && visibleGalleries.length === 0 ? (
            <p className="mt-4 text-sm text-black/70">
              Nu exista galerii salvate.
            </p>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              to="/galerie/toate"
              className="rounded-2xl border border-black/20 bg-white p-5 text-left shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)] transition hover:border-black/60"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/60">
                selectie
              </p>
              <h3 className="mt-2 text-lg font-semibold">Toate poeziile</h3>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-black/50">
                {storedPoems.length} poezii
              </p>
            </Link>

            {unassignedCount ? (
              <Link
                to="/galerie/fara"
                className="rounded-2xl border border-black/20 bg-white p-5 text-left shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)] transition hover:border-black/60"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/60">
                  selectie
                </p>
                <h3 className="mt-2 text-lg font-semibold">Fara galerie</h3>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-black/50">
                  {unassignedCount} poezii
                </p>
              </Link>
            ) : null}

            {visibleGalleries.map((gallery) => (
              <div
                key={gallery.id}
                className="rounded-2xl border border-black/20 bg-white p-5 text-left shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)]"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/60">
                  galerie
                </p>
                {editGalleryId === gallery.id ? (
                  <div className="mt-3 grid gap-3">
                    <input
                      type="text"
                      value={editGalleryName}
                      onChange={(event) => setEditGalleryName(event.target.value)}
                      className="form-control"
                    />
                    {editGalleryError ? (
                      <p className="text-sm text-black">{editGalleryError}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-black/60">
                      <button
                        type="button"
                        onClick={() => handleSaveGallery(gallery.id)}
                        disabled={isSavingGallery}
                        className="transition hover:text-black disabled:cursor-not-allowed disabled:text-black/40"
                      >
                        {isSavingGallery ? "Salveaza..." : "Salveaza"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelGalleryEdit}
                        className="transition hover:text-black"
                      >
                        Renunta
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link
                      to={`/galerie/${gallery.id}`}
                      className="mt-2 inline-flex text-lg font-semibold transition hover:text-black/70"
                    >
                      {gallery.name}
                    </Link>
                    <p className="mt-3 text-xs uppercase tracking-[0.3em] text-black/50">
                      {poemCountByGalleryId.get(gallery.id) ?? 0} poezii
                    </p>
                    {canManageGalleries ? (
                      <div className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-black/60">
                        <button
                          type="button"
                          onClick={() => {
                            startGalleryEdit(gallery);
                          }}
                          className="transition hover:text-black"
                        >
                          Editeaza
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteGallery(gallery.id);
                          }}
                          disabled={deletingGalleryId === gallery.id}
                          className="transition hover:text-black disabled:cursor-not-allowed disabled:text-black/40"
                        >
                          {deletingGalleryId === gallery.id
                            ? "Sterge..."
                            : "Sterge"}
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
