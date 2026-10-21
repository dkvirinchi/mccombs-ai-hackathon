"use client";

import { useId } from "react";
import type { Option } from "@/lib/content";

type Props = {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  label: string;
  error?: string | null;
  columns?: 1 | 2;
};

/** Radio group rendered as tappable cards. Arrow keys move between options, Space or Enter selects. */
export function SelectCards({ options, value, onChange, label, error, columns = 1 }: Props) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={`grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}
      >
        {options.map((opt, i) => {
          const selected = value === opt.value;
          const tabbable = selected || (!value && i === 0);
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={tabbable ? 0 : -1}
              onClick={() => onChange(opt.value)}
              onKeyDown={(e) => {
                const next =
                  e.key === "ArrowDown" || e.key === "ArrowRight"
                    ? (i + 1) % options.length
                    : e.key === "ArrowUp" || e.key === "ArrowLeft"
                      ? (i - 1 + options.length) % options.length
                      : null;
                if (next !== null) {
                  e.preventDefault();
                  onChange(options[next].value);
                  const parent = e.currentTarget.parentElement;
                  (parent?.children[next] as HTMLElement | undefined)?.focus();
                }
              }}
              className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors ${
                selected ? "border-charcoal bg-charcoal text-white" : "border-limestone bg-white text-charcoal hover:border-charcoal/60"
              }`}
            >
              <span
                aria-hidden
                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? "border-white" : "border-charcoal/40"
                }`}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-orange" />}
              </span>
              <span>
                <span className="block text-base font-semibold">{opt.label}</span>
                {opt.description && (
                  <span className={`mt-0.5 block text-sm ${selected ? "text-limestone" : "text-muted"}`}>{opt.description}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p id={errId} role="alert" className="mt-2 min-h-[1.25rem] text-sm font-medium text-error">
        {error ?? ""}
      </p>
    </div>
  );
}
