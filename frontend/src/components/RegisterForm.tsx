import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../auth/AuthContext";
import { API_URL } from "../lib/api";
import { RoleSelect } from "./RoleSelect";

type RegisterFormProps = {
  showLoginLink?: boolean;
};

export function RegisterForm({ showLoginLink = false }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("cititor");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = [
    { label: "Minim 8 caractere", valid: password.length >= 8 },
    { label: "O litera mica", valid: /[a-z]/.test(password) },
    { label: "O litera mare", valid: /[A-Z]/.test(password) },
    { label: "Un numar", valid: /\d/.test(password) }
  ];

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const passwordOk = passwordChecks.every((check) => check.valid);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Completeaza toate campurile.");
      return;
    }

    if (!passwordOk || !passwordsMatch) {
      setError("Parola nu respecta cerintele.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Inregistrare esuata.");
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
        Nume
        <input
          type="text"
          name="name"
          autoComplete="name"
          className="form-control"
          placeholder="Nume complet"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className="mt-6 block form-label">
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

      <RoleSelect value={role} onChange={setRole} />

      <label className="mt-6 block form-label">
        Parola
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          className="form-control"
          placeholder="Minim 8 caractere"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <div className="mt-3 rounded-xl border border-black/20 bg-white px-4 py-3 text-xs text-black/70">
        <p className="uppercase tracking-[0.25em] text-black/60">
          Conditii parola
        </p>
        <ul className="mt-2 space-y-1">
          {passwordChecks.map((check) => (
            <li
              key={check.label}
              className={check.valid ? "text-black" : "text-black/60"}
            >
              {check.valid ? "ok" : "-"} {check.label}
            </li>
          ))}
          <li className={passwordsMatch ? "text-black" : "text-black/60"}>
            {passwordsMatch ? "ok" : "-"} Parolele se potrivesc
          </li>
        </ul>
      </div>

      <label className="mt-6 block form-label">
        Confirma parola
        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          className="form-control"
          placeholder="Repeta parola"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </label>

      <button
        type="submit"
        className="mt-8 inline-flex items-center justify-center rounded-full border border-black px-6 py-2 text-xs uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Se creeaza..." : "Creeaza cont"}
      </button>

      {error ? (
        <p className="mt-4 text-sm text-black" role="alert">
          {error}
        </p>
      ) : null}

      {showLoginLink ? (
        <p className="mt-6 text-sm text-black/70">
          Ai deja cont?{" "}
          <Link to="/" className="text-black underline">
            Autentifica-te
          </Link>
          .
        </p>
      ) : null}
    </form>
  );
}
