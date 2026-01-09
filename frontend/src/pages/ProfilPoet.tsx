import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { fetchPoetStats, type PoetStats } from "../lib/poetStats";

const profileTheme = {
  "--profile-ink": "#1f1a15",
  "--profile-muted": "rgba(31, 26, 21, 0.6)",
  "--profile-line": "rgba(31, 26, 21, 0.16)",
  "--profile-accent": "#b07a3a",
  "--profile-accent-soft": "rgba(176, 122, 58, 0.18)",
  "--profile-surface": "#fff7ec"
} as CSSProperties;

function buildInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const initials = `${first}${second}`.toUpperCase();

  return initials || "P";
}

function formatCount(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Data necunoscuta";
  }

  return date.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function ProfilPoet() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PoetStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadStats() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const statsResult = await fetchPoetStats(user.id);
        if (isActive) {
          setStats(statsResult);
          setError(null);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Nu am putut incarca statisticile."
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isActive = false;
    };
  }, [user]);

  const poemCount = stats?.poemCount ?? 0;
  const activityStats = useMemo(
    () => ({
      reads: stats?.reads ?? 0,
      likes: stats?.likes ?? 0,
      saves: stats?.saves ?? 0
    }),
    [stats]
  );
  const latestPublished = stats?.lastPublishedAt ?? null;
  const readerCount = stats?.readers ?? 0;

  const badges = useMemo(
    () => [
      {
        id: "debut",
        title: "Debut",
        description: "Prima poezie publicata.",
        isUnlocked: poemCount >= 1
      },
      {
        id: "cititori-100",
        title: "100 cititori",
        description: "Ai trecut pragul de 100 de cititori.",
        isUnlocked: readerCount >= 100
      },
      {
        id: "cititori-1000",
        title: "1000 cititori",
        description: "Ai trecut pragul de 1000 de cititori.",
        isUnlocked: readerCount >= 1000
      },
      {
        id: "ritm",
        title: "Ritm Constant",
        description: "Minim 5 poezii publicate.",
        isUnlocked: poemCount >= 5
      }
    ],
    [poemCount, readerCount]
  );

  const initials = buildInitials(user?.name ?? "Poet");
  const badgeCount = badges.filter((badge) => badge.isUnlocked).length;

  return (
    <main
      style={profileTheme}
      className="min-h-screen text-[color:var(--profile-ink)]"
    >
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        <header className="border-b border-[color:var(--profile-line)] pb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--profile-muted)]">
            profil poet
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Profil de creator
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[color:var(--profile-muted)]">
            Spatiul tau minimal pentru statistici, insigne si ritmul propriu de
            publicare.
          </p>
        </header>

        <section aria-labelledby="profile-overview" className="mt-10">
          <h2 id="profile-overview" className="sr-only">
            Rezumat profil
          </h2>
          <div className="relative overflow-hidden rounded-[32px] border border-[color:var(--profile-line)] bg-[color:var(--profile-surface)] p-8 shadow-[0_26px_70px_-52px_rgba(0,0,0,0.45)] animate-fade-up">
            <div
              className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[color:var(--profile-accent-soft)] blur-3xl"
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--profile-line)] bg-white text-sm font-semibold tracking-[0.35em] text-[color:var(--profile-ink)]">
                  {initials}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--profile-muted)]">
                    poet
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {user?.name ?? "Poet"}
                  </h2>
                  <p className="mt-2 text-sm text-[color:var(--profile-muted)]">
                    {user?.email ?? "profil privat"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/scrie"
                  className="inline-flex items-center justify-center rounded-full border border-black bg-black px-5 py-2 text-[11px] uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-black"
                >
                  Scrie
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
              <div className="rounded-2xl border border-[color:var(--profile-line)] bg-white/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--profile-muted)]">
                  poezii publicate
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {isLoading ? "..." : formatCount(poemCount)}
                </p>
                <p className="mt-2 text-xs text-[color:var(--profile-muted)]">
                  {poemCount > 0
                    ? "arhiva personala este activa"
                    : "inca nu ai publicat"}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--profile-line)] bg-white/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--profile-muted)]">
                  ultima publicare
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {isLoading
                    ? "..."
                    : latestPublished
                      ? formatDate(latestPublished)
                      : "Fara publicari"}
                </p>
                <p className="mt-2 text-xs text-[color:var(--profile-muted)]">
                  {latestPublished
                    ? "ritmul este inregistrat"
                    : "cand publici, apare aici"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="stats-title" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="stats-title" className="text-2xl font-semibold">
              Statistici
            </h2>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--profile-muted)]">
              citiri, aprecieri, salvari
            </p>
          </div>
          {error ? (
            <p className="mt-4 text-sm text-[color:var(--profile-muted)]">
              {error}
            </p>
          ) : null}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                label: "citiri",
                value: isLoading ? "..." : formatCount(activityStats.reads),
                note: "expunere acumulata"
              },
              {
                label: "aprecieri",
                value: isLoading ? "..." : formatCount(activityStats.likes),
                note: "feedback de la cititori"
              },
              {
                label: "salvari",
                value: isLoading ? "..." : formatCount(activityStats.saves),
                note: "poezii pastrate"
              }
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[color:var(--profile-line)] bg-white p-6 shadow-[0_18px_45px_-34px_rgba(0,0,0,0.45)] animate-fade-up"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--profile-muted)]">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                <p className="mt-2 text-xs text-[color:var(--profile-muted)]">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="badges-title" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="badges-title" className="text-2xl font-semibold">
              Badge-uri
            </h2>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--profile-muted)]">
              {badgeCount} active
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge, index) => (
              <div
                key={badge.id}
                className={`rounded-2xl border border-[color:var(--profile-line)] p-5 shadow-[0_16px_40px_-34px_rgba(0,0,0,0.35)] animate-fade-up ${
                  badge.isUnlocked
                    ? "bg-white"
                    : "bg-white/60 text-[color:var(--profile-muted)]"
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--profile-line)] text-[11px] font-semibold uppercase tracking-[0.2em] ${
                      badge.isUnlocked
                        ? "bg-[color:var(--profile-accent)] text-white"
                        : "bg-white text-[color:var(--profile-muted)]"
                    }`}
                    aria-hidden="true"
                  >
                    {badge.isUnlocked ? "ON" : "OFF"}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em]">
                      {badge.isUnlocked ? "activ" : "in curs"}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      {badge.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
