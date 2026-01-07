import { useEffect, useRef, useState } from "react";
import type { Role } from "../auth/AuthContext";

const roleLabels: Record<Role, string> = {
  cititor: "Cititor",
  poet: "Poet"
};

type RoleSelectProps = {
  label?: string;
  value: Role;
  onChange: (role: Role) => void;
};

export function RoleSelect({ label = "Rol", value, onChange }: RoleSelectProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        buttonRef.current?.contains(event.target as Node) ||
        menuRef.current?.contains(event.target as Node)
      ) {
        return;
      }

      setOpen(false);
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="mt-6">
      <span className="form-label block">{label}</span>
      <div className="relative">
        <button
          type="button"
          ref={buttonRef}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="form-control flex items-center justify-between gap-3 text-left"
          onClick={() => setOpen((current) => !current)}
        >
          <span>{roleLabels[value]}</span>
          <span
            className={`transition ${open ? "rotate-180 text-black" : "text-black/60"}`}
            aria-hidden="true"
          >
            v
          </span>
        </button>

        {open ? (
          <div
            ref={menuRef}
            role="listbox"
            className="absolute z-10 mt-2 w-full rounded-xl border border-black/20 bg-white p-2 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)]"
          >
            {Object.entries(roleLabels).map(([roleKey, labelText]) => {
              const role = roleKey as Role;

              return (
                <button
                  key={role}
                  type="button"
                  role="option"
                  aria-selected={role === value}
                  onClick={() => {
                    onChange(role);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                    role === value
                      ? "bg-black text-white"
                      : "text-black hover:bg-black/10"
                  }`}
                >
                  {labelText}
                  {role === value ? <span aria-hidden="true">x</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
