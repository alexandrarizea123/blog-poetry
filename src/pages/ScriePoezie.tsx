import { Link } from "react-router-dom";

export function ScriePoezie() {
  return (
    <main className="min-h-screen text-zinc-900">
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
        <header className="border-b border-zinc-300/70 pb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">
            poet
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Scrie o poezie
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-700">
            Aceasta pagina va primi editorul de poezii. Pentru moment este doar
            un placeholder.
          </p>
          <div className="mt-6">
            <Link
              to="/home"
              className="inline-flex items-center justify-center rounded-full border border-zinc-800 px-6 py-2 text-xs uppercase tracking-[0.25em] text-zinc-800 transition hover:bg-zinc-900 hover:text-white"
            >
              Inapoi la home
            </Link>
          </div>
        </header>
      </div>
    </main>
  );
}
