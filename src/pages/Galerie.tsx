import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  buildExcerpt,
  buildMeta,
  deletePoem,
  fetchPoems,
  updatePoem,
  type Poem
} from "../lib/poems";

const curatedPoems = [
  {
    title: "Ploaie pe strada goala",
    meta: "dimineata, 3 min",
    excerpt:
      "Cand orasul inca doarme, trotuarul tine minte pasii. Picaturile fac ordine in lumina."
  },
  {
    title: "Focul mic",
    meta: "seara, 2 min",
    excerpt:
      "In palma, o scanteie. In camera, o liniste care se apropie. Totul incape intr-un foc mic."
  },
  {
    title: "Zidul cu ivy",
    meta: "amiaz, 4 min",
    excerpt:
      "Peretele isi tine umbra aproape. Frunzele se leaga una de alta, ca o scrisoare fara nume."
  },
  {
    title: "Statie fara ora",
    meta: "noapte, 3 min",
    excerpt:
      "Nu mai sunt trenuri, doar vant. Bancile asculta cum trece timpul, fara sa-l intrebe nimeni."
  },
  {
    title: "Ceainicul",
    meta: "dimineata, 2 min",
    excerpt:
      "Aburul urca incet. Pe geam, o linie care nu se grabeste, ca o promisiune."
  },
  {
    title: "Carti pe podea",
    meta: "seara, 4 min",
    excerpt:
      "Cuvintele cad dintre pagini, se rostogolesc. Le adun si le pun la loc, una cate una."
  }
];

type DisplayPoem = {
  key: string;
  title: string;
  meta: string;
  excerpt: string;
  content?: string;
  canDelete: boolean;
  id?: number;
};

export function Galerie() {
  const { user } = useAuth();
  const [storedPoems, setStoredPoems] = useState<Poem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editPoemId, setEditPoemId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPoems() {
      try {
        setIsLoading(true);
        const poems = await fetchPoems();
        if (isActive) {
          setStoredPoems(poems);
          setError(null);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Eroare la incarcare."
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPoems();

    return () => {
      isActive = false;
    };
  }, []);

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

  async function handleSave(poemId: number) {
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
        authorId: user.id
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

  const poems: DisplayPoem[] = [
    ...storedPoems.map((poem) => ({
      key: `user-${poem.id}`,
      id: poem.id,
      title: poem.title,
      content: poem.content,
      meta: buildMeta(poem.createdAt, poem.content),
      excerpt: buildExcerpt(poem.content),
      canDelete: poem.authorId === user?.id
    })),
    ...curatedPoems.map((poem, index) => ({
      key: `curated-${index}`,
      title: poem.title,
      meta: poem.meta,
      excerpt: poem.excerpt,
      canDelete: false
    }))
  ];

  return (
    <main className="min-h-screen text-black">
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
        <header className="border-b border-black/20 pb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-black/60">
            galerie
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Toate poeziile
          </h1>
          <div className="mt-6">
            <Link
              to="/home"
              className="inline-flex items-center justify-center rounded-full border border-black px-6 py-2 text-xs uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white"
            >
              Inapoi la home
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          {error ? (
            <p className="text-sm text-black sm:col-span-2">{error}</p>
          ) : null}
          {isLoading ? (
            <p className="text-sm text-black/70 sm:col-span-2">
              Se incarca poeziile...
            </p>
          ) : null}
          {poems.map((poem) => (
            <article
              key={poem.key}
              className="rounded-2xl border border-black/20 bg-white p-6 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                {poem.meta}
              </p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">
                  {editPoemId === poem.id ? editTitle || poem.title : poem.title}
                </h2>
                {poem.canDelete && poem.id !== undefined ? (
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-black/60">
                    {editPoemId === poem.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (poem.id === undefined) {
                              return;
                            }
                            handleSave(poem.id);
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
                              (item) => item.id === poem.id
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
                            if (poem.id === undefined) {
                              return;
                            }
                            handleDelete(poem.id);
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
              {editPoemId === poem.id ? (
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
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-black/80">
                  {poem.excerpt}
                </p>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
