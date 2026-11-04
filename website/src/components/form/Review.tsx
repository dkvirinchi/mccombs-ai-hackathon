"use client";

import { motion, useReducedMotion } from "motion/react";
import { content } from "@/lib/content";
import type { FieldKey, FormValues } from "@/lib/schema";
import { Button } from "@/components/layout/Button";
import { activeSteps, fillDates, labelFor, stepFields } from "./steps";
import { Checkbox } from "./fields/Checkbox";

type Props = {
  values: FormValues;
  resumeName: string;
  onConsent: (v: boolean) => void;
  errors: Partial<Record<FieldKey, string>>;
  onEdit: (key: FieldKey) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  canSubmit: boolean;
};

function display(key: FieldKey, values: FormValues, resumeName: string): string {
  if (key === "resume") return resumeName ? `${resumeName}${values.resumeShare ? " (OK to share with partners)" : ""}` : "None";
  const v = values[key];
  if (key === "captainCommit") return v ? "Committed" : "Not yet";
  if (key === "teammateEmails") return (v as string[]).filter(Boolean).join(", ");
  if (key === "useCases") return (v as string[]).map((x, i) => `${i + 1}. ${labelFor(key, x)}`).join("  ");
  if (typeof v === "string") return labelFor(key, v);
  return String(v);
}

/** Every answer with an Edit link, then the consent checkbox and Submit. */
export function Review({ values, resumeName, onConsent, errors, onEdit, onBack, onSubmit, submitting, canSubmit }: Props) {
  const r = content.form.review;
  const consent = content.form.fields.consent;
  const reduce = useReducedMotion();
  const fields = content.form.fields as Record<string, { label: string }>;
  const rows = activeSteps(values).flatMap(stepFields);
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
        {rows.map((key) => {
          const err = errors[key];
          return (
            <div key={key} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{fillDates(fields[key].label)}</dt>
                <dd className={`mt-0.5 break-words text-base ${err ? "text-error" : "text-charcoal"}`}>
                  {display(key, values, resumeName) || "—"}
                  {err && <span className="block text-sm font-medium text-error">{err}</span>}
                </dd>
              </div>
              <button type="button" onClick={() => onEdit(key)} className="shrink-0 text-sm font-semibold text-charcoal underline-offset-4 hover:underline">
                {r.editLabel}
              </button>
            </div>
          );
        })}
      </dl>
      <h3 className="mt-8 text-lg font-semibold text-charcoal">{r.consentHeading}</h3>
      <p className="mt-1 text-base text-muted">{consent.text}</p>
      <div className="mt-3">
        <Checkbox checked={values.consent} onChange={onConsent} label={consent.checkboxLabel} error={errors.consent ?? null} />
      </div>
      <div className="mt-2 flex items-center gap-3">
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
