import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  buildExcerpt,
  buildMeta,
  deletePoem,
  fetchPoems,
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
  canDelete: boolean;
  id?: number;
};

export function Galerie() {
  const { user } = useAuth();
  const [storedPoems, setStoredPoems] = useState<Poem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Eroare la stergere."
      );
    }
  }

  const poems: DisplayPoem[] = [
    ...storedPoems.map((poem) => ({
      key: `user-${poem.id}`,
      id: poem.id,
      title: poem.title,
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
    <main className="min-h-screen text-zinc-900">
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
        <header className="border-b border-zinc-300/70 pb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">
            galerie
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Toate poeziile
          </h1>
          <div className="mt-6">
            <Link
              to="/home"
              className="inline-flex items-center justify-center rounded-full border border-zinc-800 px-6 py-2 text-xs uppercase tracking-[0.25em] text-zinc-800 transition hover:bg-zinc-900 hover:text-white"
            >
              Inapoi la home
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          {error ? (
            <p className="text-sm text-rose-600 sm:col-span-2">{error}</p>
          ) : null}
          {isLoading ? (
            <p className="text-sm text-zinc-600 sm:col-span-2">
              Se incarca poeziile...
            </p>
          ) : null}
          {poems.map((poem) => (
            <article
              key={poem.key}
              className="rounded-2xl border border-zinc-300/60 bg-white/70 p-6 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {poem.meta}
              </p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">{poem.title}</h2>
                {poem.canDelete && poem.id !== undefined ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(poem.id)}
                    className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 transition hover:text-rose-600"
                  >
                    Sterge
                  </button>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                {poem.excerpt}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
