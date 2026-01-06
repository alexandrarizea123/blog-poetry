import { Link } from "react-router-dom";

const poems = [
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

export function Galerie() {
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
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-zinc-800 px-6 py-2 text-xs uppercase tracking-[0.25em] text-zinc-800 transition hover:bg-zinc-900 hover:text-white"
            >
              Inapoi la home
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          {poems.map((poem) => (
            <article
              key={poem.title}
              className="rounded-2xl border border-zinc-300/60 bg-white/70 p-6 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {poem.meta}
              </p>
              <h2 className="mt-3 text-xl font-semibold">{poem.title}</h2>
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
