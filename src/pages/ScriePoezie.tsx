import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createPoem } from "../lib/poems";

export function ScriePoezie() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();

    if (!user) {
      setError("Trebuie sa fii autentificat.");
      return;
    }

    if (!title || !content) {
      setError("Completeaza titlul si textul poeziei.");
      return;
    }

    setError(null);
    try {
      setIsSubmitting(true);
      await createPoem({ title, content, authorId: user.id });
      navigate("/galerie");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nu am putut incarca poezia."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen text-black">
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
        <header className="border-b border-black/20 pb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-black/60">
            poet
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Scrie o poezie
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/80">
            Spune o poveste scurta, prinde o stare, apoi trimite textul catre
            galerie.
          </p>
          <div className="mt-6">
            <Link
              to="/home"
              className="inline-flex items-center justify-center rounded-full border border-black px-6 py-2 text-xs uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white"
            >
              Inapoi la home
            </Link>
          </div>
        </header>

        <section aria-labelledby="poem-form-title" className="mt-12">
          <div className="rounded-2xl border border-black/20 bg-white p-8 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="poem-form-title" className="text-2xl font-semibold">
                  Editor simplu
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-black/70">
                  Completeaza titlul si textul poeziei.
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                doar rol poet
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
              <label className="block">
                <span className="form-label">Titlu</span>
                <input
                  id="poem-title"
                  name="title"
                  type="text"
                  placeholder="Un titlu scurt si memorabil"
                  className="form-control"
                  autoComplete="off"
                />
              </label>

              <label className="block">
                <span className="form-label">Textul poeziei</span>
                <textarea
                  id="poem-body"
                  name="content"
                  rows={10}
                  placeholder="Scrie aici textul poeziei..."
                  className="form-control min-h-[240px] resize-y"
                />
              </label>

              {error ? (
                <p className="text-sm text-black">{error}</p>
              ) : (
                <p className="text-xs uppercase tracking-[0.25em] text-black/60">
                  campurile sunt obligatorii
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-black"
                >
                  {isSubmitting ? "Se incarca..." : "Incarca in Galerie"}
                </button>
                <Link
                  to="/galerie"
                  className="inline-flex items-center justify-center rounded-full border border-black/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-black/70 transition hover:border-black hover:text-black"
                >
                  Vezi galeria
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
