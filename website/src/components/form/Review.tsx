"use client";

import { motion, useReducedMotion } from "motion/react";
import { content } from "@/lib/content";
import type { FieldKey, FormValues } from "@/lib/schema";
import { Button } from "@/components/layout/Button";
import { activeSteps, labelFor } from "./steps";

type Props = {
  values: FormValues;
  errors: Partial<Record<FieldKey, string>>;
  onEdit: (key: FieldKey) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  canSubmit: boolean;
};

function display(key: FieldKey, values: FormValues): string {
  const v = values[key];
  if (key === "consent") return v ? "Agreed" : "Not yet";
  if (key === "teammateEmails") return (v as string[]).filter(Boolean).join(", ");
  if (typeof v === "string") return labelFor(key, v);
  return String(v);
}

export function Review({ values, errors, onEdit, onBack, onSubmit, submitting, canSubmit }: Props) {
  const r = content.form.review;
  const reduce = useReducedMotion();
  const fields = content.form.fields as Record<string, { label: string }>;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: -24 }}
      transition={{ duration: 0.22 }}
    >
      <h2 className="display text-3xl text-charcoal sm:text-4xl">{r.heading}</h2>
      <p className="mt-3 text-base text-muted">{r.body}</p>
      <dl className="mt-6 divide-y divide-limestone rounded-2xl border border-limestone bg-white">
        {activeSteps(values).map((s) => {
          const err = errors[s.key];
          return (
            <div key={s.key} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{fields[s.key].label}</dt>
                <dd className={`mt-0.5 break-words text-base ${err ? "text-error" : "text-charcoal"}`}>
                  {display(s.key, values) || "—"}
                  {err && <span className="block text-sm font-medium text-error">{err}</span>}
                </dd>
              </div>
              <button type="button" onClick={() => onEdit(s.key)} className="shrink-0 text-sm font-semibold text-charcoal underline-offset-4 hover:underline">
                {r.editLabel}
              </button>
            </div>
          );
        })}
      </dl>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          {content.form.backCta}
        </Button>
        <Button size="lg" onClick={onSubmit} disabled={!canSubmit || submitting} aria-busy={submitting}>
          {submitting ? content.form.submittingCta : content.form.submitCta}
        </Button>
      </div>
    </motion.div>
  );
}
