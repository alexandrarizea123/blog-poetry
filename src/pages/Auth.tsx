import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";

export function Auth() {
  return (
    <main className="min-h-screen text-zinc-900">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        <header className="border-b border-zinc-300/70 pb-10">
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">
            cont
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Logare sau inregistrare
          </h1>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold">Logare</h2>
            <div className="mt-6">
              <LoginForm showRegisterLink={false} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Register</h2>
            <div className="mt-6">
              <RegisterForm showLoginLink={false} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
