"use client";

import { useId } from "react";
import { content } from "@/lib/content";

type Props = {
  values: string[];
  onChange: (v: string[]) => void;
  onEnter?: () => void;
  error?: string | null;
  max: number;
};

export function EmailList({ values, onChange, onEnter, error, max }: Props) {
  const id = useId();
  const errId = `${id}-err`;
  const f = content.form.fields.teammateEmails;
  const list = values.length ? values : [""];

  const set = (i: number, v: string) => onChange(list.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(list.filter((_, j) => j !== i));
  const add = () => list.length < max && onChange([...list, ""]);

  return (
    <div>
      <ul className="space-y-3" aria-describedby={error ? errId : undefined}>
        {list.map((v, i) => (
          <li key={i} className="flex gap-2">
            <input
              aria-label={`Teammate ${i + 1} email`}
              aria-invalid={!!error}
              type="email"
              inputMode="email"
              autoComplete="off"
              spellCheck={false}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-lg text-charcoal placeholder:text-muted/60 focus:border-charcoal focus:outline-none ${
                error ? "border-error" : "border-limestone"
              }`}
              placeholder={f.placeholder}
              value={v}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (i === list.length - 1 && list.length < max && v.trim()) add();
                  else onEnter?.();
                }
              }}
              autoFocus={i === 0}
            />
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 rounded-xl border-2 border-limestone px-3 text-sm font-medium text-muted hover:border-charcoal hover:text-charcoal"
                aria-label={`${f.removeLabel} teammate ${i + 1}`}
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
      {list.length < max && (
        <button type="button" onClick={add} className="mt-3 text-sm font-semibold text-charcoal underline-offset-4 hover:underline">
          + {f.addLabel}
        </button>
      )}
      <p id={errId} role="alert" className="mt-2 min-h-[1.25rem] text-sm font-medium text-error">
        {error ?? ""}
      </p>
    </div>
  );
}
