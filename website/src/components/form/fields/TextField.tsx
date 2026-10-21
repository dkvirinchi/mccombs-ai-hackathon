"use client";

import { useId } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  error?: string | null;
  type?: "text" | "email";
  autoComplete?: string;
  multiline?: boolean;
  maxLength?: number;
  label: string;
  autoFocus?: boolean;
  inputMode?: "text" | "email";
};

export function TextField({
  value,
  onChange,
  onEnter,
  placeholder,
  error,
  type = "text",
  autoComplete,
  multiline = false,
  maxLength,
  label,
  autoFocus,
  inputMode,
}: Props) {
  const id = useId();
  const errId = `${id}-err`;
  const base =
    "w-full rounded-xl border-2 bg-white px-4 py-3 text-lg text-charcoal placeholder:text-muted/60 focus:outline-none focus-visible:outline-none focus:border-charcoal";
  const border = error ? "border-error" : "border-limestone";

  return (
    <div>
      {multiline ? (
        <textarea
          id={id}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className={`${base} ${border} min-h-[8rem] resize-y`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
        />
      ) : (
        <input
          id={id}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className={`${base} ${border}`}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          autoFocus={autoFocus}
          spellCheck={false}
        />
      )}
      <div className="mt-2 flex items-start justify-between gap-4 text-sm">
        <p id={errId} role="alert" className="min-h-[1.25rem] font-medium text-error">
          {error ?? ""}
        </p>
        {maxLength && (
          <p className={`shrink-0 tabular-nums ${value.length > maxLength ? "text-error" : "text-muted"}`} aria-live="polite">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
