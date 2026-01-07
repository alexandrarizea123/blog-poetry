import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { API_URL } from "../lib/api";

const poems = [
  {
    title: "Liniste in mansarda",
    meta: "dimineata, 2 min",
    excerpt:
      "Printre grinzi, lumina cade in felii. Praful se aseaza ca o zapada blanda peste paginile vechi."
  },
  {
    title: "Caietul din buzunar",
    meta: "seara, 3 min",
    excerpt:
      "Cuvintele mici sunt cele care raman. Le port aproape, ca pe o moneda care face semn."
  },
  {
    title: "Fereastra fara zgomot",
    meta: "noapte, 2 min",
    excerpt:
      "Orasul respira pe o singura linie. Eu raman in spatele geamului, cu o liniste care nu cere nimic."
  },
  {
    title: "Scrisoare fara timbru",
    meta: "amiaz, 3 min",
    excerpt:
      "Pe hartie ramane urma mainii. Cuvintele se leaga incet, ca un fir de ata."
  }
];

export function Home() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/api/logout`, { method: "POST" });
    } finally {
      logout();
      navigate("/");
    }
  }

  return (
    <main className="min-h-screen text-black">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        <header className="border-b border-black/20 pb-10">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-black/60">
            <span>{user ? `rol ${user.role}` : "rol necunoscut"}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-black/20 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-black/70 transition hover:border-black hover:text-black"
            >
              Deconectare
            </button>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Jurnal de poezie
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/galerie"
              className="inline-flex items-center justify-center rounded-full border border-black px-6 py-2 text-xs uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white"
            >
              Galerie
            </Link>
            {role === "poet" ? (
              <Link
                to="/scrie"
                className="inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-2 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-black"
              >
                Scrie o poezie
              </Link>
            ) : null}
          </div>
        </header>

        <section aria-labelledby="welcome-title" className="mt-12">
          <div className="rounded-2xl border border-black/20 bg-white p-8 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)]">
            <h2 id="welcome-title" className="text-2xl font-semibold">
              Bun venit
            </h2>
            <p className="mt-4 text-base leading-relaxed text-black/80">
              Aici vei gasi poezii de dimineata si de seara, fragmente care
              surprind linistea, timpul si curiozitatea cotidiana.
            </p>
            <p className="mt-4 text-base leading-relaxed text-black/80">
              Galeria va strange treptat textele, iar fiecare vizita poate fi o
              oprire scurta pentru respiratie.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-black/60">
              <span className="h-px w-10 bg-black/20" aria-hidden="true" />
              <span>scrise incet, citite cu rabdare</span>
            </div>
          </div>
        </section>

        <section aria-labelledby="preview-title" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="preview-title" className="text-2xl font-semibold">
              Previzualizare galerie
            </h2>
            <p className="text-xs uppercase tracking-[0.3em] text-black/60">
              4 fragmente
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {poems.map((poem) => (
              <article
                key={poem.title}
                className="rounded-2xl border border-black/20 bg-white p-6 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)]"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                  {poem.meta}
                </p>
                <h3 className="mt-3 text-xl font-semibold">{poem.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/80">
                  {poem.excerpt}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
