import { Link } from "react-router-dom";

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
  }
];

export function Home() {
  return (
    <main className="min-h-screen text-zinc-900">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        <header className="border-b border-zinc-300/70 pb-10">
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Jurnal de poezie
          </h1>
          <div className="mt-6">
            <Link
              to="/galerie"
              className="inline-flex items-center justify-center rounded-full border border-zinc-800 px-6 py-2 text-xs uppercase tracking-[0.25em] text-zinc-800 transition hover:bg-zinc-900 hover:text-white"
            >
              Galerie
            </Link>
          </div>
        </header>

        <section aria-labelledby="welcome-title" className="mt-12">
          <div className="rounded-2xl border border-zinc-300/60 bg-white/70 p-8 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)] backdrop-blur">
            <h2 id="welcome-title" className="text-2xl font-semibold">
              Bun venit
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              Aici vei gasi poezii de dimineata si de seara, fragmente care
              surprind linistea, timpul si curiozitatea cotidiana.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              Galeria va strange treptat textele, iar fiecare vizita poate fi o
              oprire scurta pentru respiratie.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-zinc-500">
              <span className="h-px w-10 bg-zinc-300" aria-hidden="true" />
              <span>scrise incet, citite cu rabdare</span>
            </div>
          </div>
        </section>

        <section aria-labelledby="preview-title" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="preview-title" className="text-2xl font-semibold">
              Preview galerie
            </h2>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              3 fragmente
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {poems.map((poem) => (
              <article
                key={poem.title}
                className="rounded-2xl border border-zinc-300/60 bg-white/70 p-6 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)] backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {poem.meta}
                </p>
                <h3 className="mt-3 text-xl font-semibold">{poem.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-700">
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
