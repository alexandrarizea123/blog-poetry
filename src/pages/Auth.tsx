import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";

export function Auth() {
  return (
    <main className="min-h-screen text-black">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        <header className="border-b border-black/20 pb-10">
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Autentificare sau inregistrare
          </h1>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold">Autentificare</h2>
            <div className="mt-6">
              <LoginForm showRegisterLink={false} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Inregistrare</h2>
            <div className="mt-6">
              <RegisterForm showLoginLink={false} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
