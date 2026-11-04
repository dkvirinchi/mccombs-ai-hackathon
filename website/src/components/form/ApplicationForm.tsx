"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { content, stripTodo } from "@/lib/content";
import { emptyValues, MIN_USE_CASES, validateAll, validateField, type FieldKey, type FormValues } from "@/lib/schema";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import { buildPayload, submitApplication, type SubmitResponse } from "@/lib/submit";
import { applicationWindow, formatDate, REVIEW_MODE, type WindowState } from "@/lib/window";
import { Button } from "@/components/layout/Button";
import { activeSteps, fillDates, optionsFor, stepFields, type Step } from "./steps";
import { Question } from "./Question";
import { Review } from "./Review";
import { Confirmation } from "./Confirmation";
import { Closed } from "./Closed";
import { ProgressBar } from "./ProgressBar";
import { TextField } from "./fields/TextField";
import { SelectCards } from "./fields/SelectCards";
import { EmailList } from "./fields/EmailList";
import { Checkbox } from "./fields/Checkbox";
import { RankCards } from "./fields/RankCards";
import { ResumeField, type ResumeFile } from "./fields/ResumeField";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; id: string; resubmission: boolean }
  | { kind: "failure"; message?: string };

const f = content.form;
const fields = f.fields;

/**
 * One-question-at-a-time application form (F-11 to F-14).
 * - Client-side validation with inline errors; submit disabled until the whole form is valid.
 * - Draft saved to localStorage on every change and restored on return (the resume file is not saved).
 * - The last question leads straight to the review screen, which has Submit.
 * - Open/close window from content/site.json; outside it the form shows a closed message.
 * - Posts to the Apps Script; shows confirmation, or keeps the answers on screen with a retry.
 */
export function ApplicationForm() {
  const [mounted, setMounted] = useState(false);
  const [windowState, setWindowState] = useState<WindowState>("open");
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [resume, setResume] = useState<ResumeFile | null>(null);
  const [stepIndex, setStepIndex] = useState(-1); // -1 = intro screen
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [reviewing, setReviewing] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  // Hydrate from the browser once. The static HTML always renders the intro, so the server and
  // client markup match; the window state and the saved draft only exist in the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage and the clock
    setWindowState(applicationWindow());
    const draft = loadDraft();
    if (draft) {
      setValues(draft.values);
      setStepIndex(draft.step);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status.kind !== "success") saveDraft(values, Math.max(stepIndex, 0));
  }, [values, stepIndex, mounted, status.kind]);

  const steps = useMemo(() => activeSteps(values), [values]);
  const step = steps[stepIndex];
  const total = steps.length;

  const update = useCallback(<K extends keyof FormValues>(key: K, v: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const scrollTop = () => topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });

  const goNext = () => {
    if (!step) return;
    const stepErrors: Partial<Record<FieldKey, string>> = {};
    for (const key of stepFields(step)) {
      const err = validateField(values, key);
      if (err) stepErrors[key] = err;
    }
    if (Object.keys(stepErrors).length) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      return;
    }
    if (stepIndex + 1 >= total) setReviewing(true);
    else setStepIndex(stepIndex + 1);
    scrollTop();
  };

  const goBack = () => {
    if (reviewing) setReviewing(false);
    else if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else setStepIndex(-1);
    scrollTop();
  };

  const edit = (key: FieldKey) => {
    const i = steps.findIndex((s) => stepFields(s).includes(key));
    if (i >= 0) {
      setReviewing(false);
      setStepIndex(i);
      scrollTop();
    }
  };

  const validation = useMemo(() => validateAll(values), [values]);

  const submit = async () => {
    const result = validateAll(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setStatus({ kind: "submitting" });
    const res: SubmitResponse = await submitApplication(buildPayload(result.data, honeypot, resume));
    if (res.ok) {
      clearDraft();
      setStatus({ kind: "success", id: res.id, resubmission: res.resubmission });
    } else if (res.error === "validation") {
      setErrors(res.fields as Partial<Record<FieldKey, string>>);
      setStatus({ kind: "idle" });
    } else if (res.error === "closed") {
      setWindowState("after");
      setStatus({ kind: "idle" });
    } else {
      setStatus({ kind: "failure", message: res.message });
    }
    scrollTop();
  };

  // ---- Render states ----------------------------------------------------

  if (mounted && windowState !== "open") return <Closed state={windowState === "before" ? "before" : "after"} />;

  if (status.kind === "success") {
    return <Confirmation id={status.id} email={values.email} teamName={values.applyingAs === "team" ? values.teamName : ""} resubmission={status.resubmission} />;
  }

  if (status.kind === "failure") {
    const email = stripTodo(content.contact.email);
    return (
      <div role="alert">
        <h2 className="display text-4xl text-charcoal">{f.failure.heading}</h2>
        <p className="mt-4 text-lg text-ink">{f.failure.body}</p>
        {status.message && <p className="mt-2 font-mono text-sm text-muted">{status.message}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" onClick={submit}>
            {f.failure.retryCta}
          </Button>
          <a href={`mailto:${email}`} className="inline-flex items-center rounded-full border border-charcoal/30 px-7 py-3.5 font-semibold text-charcoal hover:border-charcoal">
            {email}
          </a>
        </div>
      </div>
    );
  }

  const previewNote = REVIEW_MODE && (
    <p className="mb-6 rounded-xl border border-charcoal/20 bg-limestone-soft px-4 py-3 text-sm font-medium text-charcoal">{f.previewNote}</p>
  );

  if (stepIndex < 0 || !mounted) {
    return (
      <div ref={topRef}>
        {mounted && previewNote}
        <h1 className="display text-5xl text-orange sm:text-6xl">{f.title}</h1>
        <IntroBullets />
        <div className="mt-8">
          <Button size="lg" onClick={() => setStepIndex(0)} disabled={!mounted}>
            {f.startCta}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      {previewNote}
      <ProgressBar current={reviewing ? total : stepIndex + 1} total={total} />
      {/* Honeypot: hidden from people, filled by bots. The script drops submissions where it is non-empty. */}
      <div aria-hidden className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label>
          {f.honeypotLabel}
          <input type="text" name="hp" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {reviewing ? (
          <Review
            key="review"
            values={values}
            resumeName={resume?.name ?? ""}
            errors={errors}
            onEdit={edit}
            onBack={goBack}
            onSubmit={submit}
            submitting={status.kind === "submitting"}
            canSubmit={validation.ok}
          />
        ) : step ? (
          <StepView
            key={step.key}
            step={step}
            values={values}
            resume={resume}
            setResume={setResume}
            errors={errors}
            update={update}
            onNext={goNext}
            onBack={goBack}
            isLast={stepIndex + 1 >= total}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Intro bullets from form.introBullets in content/site.json.
 * {closeDate} becomes dates.applicationsClose and {email} becomes a mailto link to contact.email.
 */
function IntroBullets() {
  const email = stripTodo(content.contact.email);
  const closeDate = formatDate(content.dates.applicationsClose, { weekday: undefined, hour: undefined });
  return (
    <ul className="mt-5 max-w-xl list-disc space-y-2 pl-6 text-lg text-ink marker:text-orange">
      {f.introBullets.map((line) => {
        const [before, after] = line.replace("{closeDate}", closeDate).split("{email}");
        return (
          <li key={line}>
            {before}
            {after !== undefined && (
              <>
                <a href={`mailto:${email}`} className="break-words font-semibold text-charcoal underline underline-offset-4">
                  {email}
                </a>
                {after}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type StepViewProps = {
  step: Step;
  values: FormValues;
  resume: ResumeFile | null;
  setResume: (f: ResumeFile | null) => void;
  errors: Partial<Record<FieldKey, string>>;
  update: <K extends keyof FormValues>(key: K, v: FormValues[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
};

type FieldCopy = { label: string; help?: string | string[]; placeholder?: string; noNote?: string; text?: string; checkboxLabel?: string };

const copyFor = (key: string) => fields[key as keyof typeof fields] as FieldCopy;

function StepView({ step, values, resume, setResume, errors, update, onNext, onBack, isLast }: StepViewProps) {
  const { key: stepKey, kind } = step;
  const meta = copyFor(step.heading ?? stepKey);
  const label = fillDates(meta.label);
  const nextLabel = isLast ? "Review answers" : undefined;
  const error = errors[stepKey] ?? null;

  if (kind === "pair" && step.pair) {
    return (
      <Question label={label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel}>
        <div className="space-y-2">
          {step.pair.map((p, i) => {
            const c = copyFor(p.key);
            return (
              <div key={p.key}>
                <p aria-hidden className="mb-1.5 text-sm font-semibold text-charcoal">
                  {c.label}
                </p>
                <TextField
                  label={c.label}
                  value={values[p.key]}
                  onChange={(v) => update(p.key, v)}
                  onEnter={onNext}
                  placeholder={c.placeholder}
                  error={errors[p.key] ?? null}
                  type={p.type}
                  inputMode={p.type === "email" ? "email" : "text"}
                  autoComplete={p.autoComplete}
                  autoFocus={i === 0}
                />
              </div>
            );
          })}
        </div>
      </Question>
    );
  }

  if (kind === "resume") {
    return (
      <Question label={label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel}>
        <ResumeField file={resume} onFile={setResume} share={values.resumeShare} onShare={(v) => update("resumeShare", v)} />
      </Question>
    );
  }

  const key = stepKey as keyof FormValues;
  switch (kind) {
    case "text":
      return (
        <Question label={label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel}>
          <TextField
            label={label}
            value={values[key] as string}
            onChange={(v) => update(key, v as never)}
            onEnter={onNext}
            placeholder={meta.placeholder}
            error={error}
            autoComplete="off"
            autoFocus
          />
        </Question>
      );
    case "select": {
      const value = values[key] as string;
      const note = value === "no" ? (meta.noNote ?? null) : null;
      const options = optionsFor(key);
      return (
        <Question label={label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel} note={note} nextDisabled={!value}>
          <SelectCards label={label} options={options} value={value} onChange={(v) => update(key, v as never)} error={error} columns={step.columns ?? 1} />
        </Question>
      );
    }
    case "rank":
      return (
        <Question label={label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel} nextDisabled={values.useCases.length < MIN_USE_CASES}>
          <RankCards label={label} options={optionsFor("useCases")} value={values.useCases} onChange={(v) => update("useCases", v)} error={error} />
        </Question>
      );
    case "emails":
      return (
        <Question label={label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel}>
          <EmailList values={values.teammateEmails} onChange={(v) => update("teammateEmails", v)} onEnter={onNext} error={error} max={3} />
        </Question>
      );
    case "checkbox":
      return (
        <Question label={label} help={meta.text} onNext={onNext} onBack={onBack} nextLabel={nextLabel} nextDisabled={!values[key]}>
          <Checkbox checked={values[key] as boolean} onChange={(v) => update(key, v as never)} label={meta.checkboxLabel ?? "I agree"} error={error} />
        </Question>
      );
  }
}
