import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../auth/AuthContext";
import { API_URL } from "../lib/api";
import { RoleSelect } from "./RoleSelect";

type LoginFormProps = {
  showRegisterLink?: boolean;
};

export function LoginForm({ showRegisterLink = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("cititor");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Completeaza e-mailul si parola.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Autentificare esuata.");
        return;
      }

      if (!payload?.user) {
        setError("Raspuns invalid.");
        return;
      }

      login(payload.user);
      navigate("/home");
    } catch {
      setError("Server indisponibil. Incearca din nou.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/20 bg-white p-8 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)]"
    >
      <label className="form-label">
        E-mail
        <input
          type="email"
          name="email"
          autoComplete="email"
          className="form-control"
          placeholder="nume@exemplu.ro"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="mt-6 block form-label">
        Parola
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          className="form-control"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <RoleSelect value={role} onChange={setRole} />

      <button
        type="submit"
        className="mt-8 inline-flex items-center justify-center rounded-full border border-black px-6 py-2 text-xs uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Se verifica..." : "Autentifica-te"}
      </button>

      {error ? (
        <p className="mt-4 text-sm text-black" role="alert">
          {error}
        </p>
      ) : null}

      {showRegisterLink ? (
        <p className="mt-6 text-sm text-black/70">
          Nu ai cont?{" "}
          <Link to="/" className="text-black underline">
            Inregistreaza-te
          </Link>
          .
        </p>
      ) : null}
    </form>
  );
}
