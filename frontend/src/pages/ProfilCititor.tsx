import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  buildExcerpt,
  buildMeta,
  fetchLikedPoems,
  fetchSavedPoems,
  type Poem
} from "../lib/poems";
import {
  likePoem,
  savePoem,
  unlikePoem,
  unsavePoem
} from "../lib/poemInteractions";

const readerTheme = {
  "--reader-ink": "#1b1f1d",
  "--reader-muted": "rgba(27, 31, 29, 0.6)",
  "--reader-line": "rgba(27, 31, 29, 0.16)",
  "--reader-accent": "#4b7d6f",
  "--reader-accent-soft": "rgba(75, 125, 111, 0.18)",
  "--reader-surface": "#f4f7f4"
} as CSSProperties;

type ViewTab = "liked" | "saved";

function buildInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const initials = `${first}${second}`.toUpperCase();

  return initials || "C";
}

function formatCount(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

export function ProfilCititor() {
  const { user } = useAuth();
  const [likedPoems, setLikedPoems] = useState<Poem[]>([]);
  const [savedPoems, setSavedPoems] = useState<Poem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewTab>("liked");

  useEffect(() => {
    let isActive = true;

    async function loadLists() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [liked, saved] = await Promise.all([
          fetchLikedPoems(user.id),
          fetchSavedPoems(user.id)
        ]);
        if (isActive) {
          setLikedPoems(liked);
          setSavedPoems(saved);
          setError(null);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Nu am putut incarca profilul."
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadLists();

    return () => {
      isActive = false;
    };
  }, [user]);

  const likedIds = useMemo(
    () => new Set(likedPoems.map((poem) => poem.id)),
    [likedPoems]
  );
  const savedIds = useMemo(
    () => new Set(savedPoems.map((poem) => poem.id)),
    [savedPoems]
  );

  const displayedPoems = activeTab === "liked" ? likedPoems : savedPoems;
  const likedCount = likedPoems.length;
  const savedCount = savedPoems.length;
  const initials = buildInitials(user?.name ?? "Cititor");

  async function handleToggleLike(poem: Poem) {
    if (!user) {
      setError("Trebuie sa fii autentificat.");
      return;
    }

    const isLiked = likedIds.has(poem.id);

    try {
      if (isLiked) {
        await unlikePoem(poem.id, user.id);
        setLikedPoems((items) => items.filter((item) => item.id !== poem.id));
      } else {
        await likePoem(poem.id, user.id);
        setLikedPoems((items) => [poem, ...items]);
      }
      setError(null);
    } catch (likeError) {
      setError(
        likeError instanceof Error ? likeError.message : "Eroare la salvare."
      );
    }
  }

  async function handleToggleSave(poem: Poem) {
    if (!user) {
      setError("Trebuie sa fii autentificat.");
      return;
    }

    const isSaved = savedIds.has(poem.id);

    try {
      if (isSaved) {
        await unsavePoem(poem.id, user.id);
        setSavedPoems((items) => items.filter((item) => item.id !== poem.id));
      } else {
        await savePoem(poem.id, user.id);
        setSavedPoems((items) => [poem, ...items]);
      }
      setError(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Eroare la salvare."
      );
    }
  }

  return (
    <main
      style={readerTheme}
      className="min-h-screen text-[color:var(--reader-ink)]"
    >
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        <header className="border-b border-[color:var(--reader-line)] pb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--reader-muted)]">
            profil cititor
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Profil de cititor
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[color:var(--reader-muted)]">
            Aprecieri si salvari, stranse discret pentru lecturile tale.
          </p>
        </header>

        <section aria-labelledby="reader-overview" className="mt-10">
          <h2 id="reader-overview" className="sr-only">
            Rezumat cititor
          </h2>
          <div className="relative overflow-hidden rounded-[32px] border border-[color:var(--reader-line)] bg-[color:var(--reader-surface)] p-8 shadow-[0_26px_70px_-52px_rgba(0,0,0,0.45)] animate-fade-up">
            <div
              className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[color:var(--reader-accent-soft)] blur-3xl"
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--reader-line)] bg-white text-sm font-semibold tracking-[0.35em] text-[color:var(--reader-ink)]">
                  {initials}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--reader-muted)]">
                    cititor
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {user?.name ?? "Cititor"}
                  </h2>
                  <p className="mt-2 text-sm text-[color:var(--reader-muted)]">
                    {user?.email ?? "profil privat"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/galerie"
                  className="inline-flex items-center justify-center rounded-full border border-black bg-black px-5 py-2 text-[11px] uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-black"
                >
                  Descopera
                </Link>
                <Link
                  to="/home"
                  className="inline-flex items-center justify-center rounded-full border border-black px-5 py-2 text-[11px] uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white"
                >
                  Inapoi acasa
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--reader-line)] bg-white/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--reader-muted)]">
                  aprecieri
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {isLoading ? "..." : formatCount(likedCount)}
                </p>
                <p className="mt-2 text-xs text-[color:var(--reader-muted)]">
                  {likedCount > 0 ? "preferinte salvate" : "inca nu ai apreciat"}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--reader-line)] bg-white/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--reader-muted)]">
                  salvari
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {isLoading ? "..." : formatCount(savedCount)}
                </p>
                <p className="mt-2 text-xs text-[color:var(--reader-muted)]">
                  {savedCount > 0 ? "lecturi pentru mai tarziu" : "lista este goala"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="reader-library" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="reader-library" className="text-2xl font-semibold">
                Biblioteca ta
              </h2>
              <p className="mt-2 text-sm text-[color:var(--reader-muted)]">
                Alege intre poeziile apreciate si cele salvate.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("liked")}
                className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.3em] transition ${
                  activeTab === "liked"
                    ? "border-black bg-black text-white"
                    : "border-black/20 text-[color:var(--reader-muted)] hover:border-black"
                }`}
              >
                Aprecieri
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.3em] transition ${
                  activeTab === "saved"
                    ? "border-black bg-black text-white"
                    : "border-black/20 text-[color:var(--reader-muted)] hover:border-black"
                }`}
              >
                Salvari
              </button>
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-[color:var(--reader-muted)]">
              {error}
            </p>
          ) : null}
          {isLoading ? (
            <p className="mt-4 text-sm text-[color:var(--reader-muted)]">
              Se incarca biblioteca...
            </p>
          ) : null}
          {!isLoading && displayedPoems.length === 0 ? (
            <p className="mt-4 text-sm text-[color:var(--reader-muted)]">
              {activeTab === "liked"
                ? "Nu ai inca poezii apreciate."
                : "Nu ai inca poezii salvate."}
            </p>
          ) : null}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {displayedPoems.map((poem, index) => {
              const isLiked = likedIds.has(poem.id);
              const isSaved = savedIds.has(poem.id);

              return (
                <article
                  key={poem.id}
                  className="rounded-2xl border border-[color:var(--reader-line)] bg-white p-6 shadow-[0_16px_40px_-34px_rgba(0,0,0,0.35)] animate-fade-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--reader-muted)]">
                    {buildMeta(poem.createdAt, poem.content)}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold">{poem.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--reader-muted)]">
                    {buildExcerpt(poem.content)}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--reader-muted)]">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(poem)}
                      className="transition hover:text-black"
                    >
                      {isLiked ? "Apreciata" : "Apreciaza"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSave(poem)}
                      className="transition hover:text-black"
                    >
                      {isSaved ? "Salvata" : "Salveaza"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
