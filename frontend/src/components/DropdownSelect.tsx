import { useEffect, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type DropdownSelectProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export function DropdownSelect({
  label,
  value,
  options,
  onChange
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? "Selecteaza";

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
          <span>{selectedLabel}</span>
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
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                  option.value === value
                    ? "bg-black text-white"
                    : "text-black hover:bg-black/10"
                }`}
              >
                {option.label}
                {option.value === value ? <span aria-hidden="true">x</span> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
