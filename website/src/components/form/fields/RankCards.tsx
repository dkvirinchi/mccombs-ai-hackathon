"use client";

import { useId } from "react";
import type { Option } from "@/lib/content";

type Props = {
  options: Option[];
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
  /** Optional cap on how many can be ranked. Omit to allow ranking every option. */
  max?: number;
  error?: string | null;
};

/**
 * Ranked multi-select as tappable cards. Tapping adds an option at the next rank (1, 2, 3...);
 * tapping a ranked option removes it and moves the ones after it up. If `max` is set, the rest
 * are disabled once that many are picked.
 */
export function RankCards({ options, value, onChange, label, max, error }: Props) {
  const id = useId();
  const errId = `${id}-err`;
  const full = max !== undefined && value.length >= max;

  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else if (!full) onChange([...value, v]);
  };

  return (
    <div>
      <div role="group" aria-label={label} aria-describedby={error ? errId : undefined} className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const rank = value.indexOf(opt.value) + 1;
          const selected = rank > 0;
          const disabled = !selected && full;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              aria-label={selected ? `${opt.label}, choice ${rank}` : opt.label}
              disabled={disabled}
              onClick={() => toggle(opt.value)}
              className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors ${
                selected
                  ? "border-charcoal bg-charcoal text-white"
                  : disabled
                    ? "cursor-not-allowed border-limestone bg-white text-charcoal opacity-50"
                    : "border-limestone bg-white text-charcoal hover:border-charcoal/60"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  selected ? "border-orange bg-orange text-white" : "border-charcoal/40"
                }`}
              >
                {selected ? rank : ""}
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
