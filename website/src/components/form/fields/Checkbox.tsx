"use client";

import { useId } from "react";

type Props = { checked: boolean; onChange: (v: boolean) => void; label: string; error?: string | null };

export function Checkbox({ checked, onChange, label, error }: Props) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-white px-4 py-3.5 ${
          checked ? "border-charcoal" : error ? "border-error" : "border-limestone"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          className="h-5 w-5 accent-[#bf5700]"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
        />
        <span className="text-base font-semibold text-charcoal">{label}</span>
      </label>
      <p id={errId} role="alert" className="mt-2 min-h-[1.25rem] text-sm font-medium text-error">
        {error ?? ""}
      </p>
    </div>
  );
}
