"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { content, stripTodo } from "@/lib/content";
import { emptyValues, validateAll, validateField, type FieldKey, type FormValues } from "@/lib/schema";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import { buildPayload, submitApplication, type SubmitResponse } from "@/lib/submit";
import { applicationWindow, type WindowState } from "@/lib/window";
import { Button } from "@/components/layout/Button";
import { activeSteps, optionsFor } from "./steps";
import { Question } from "./Question";
import { Review } from "./Review";
import { Confirmation } from "./Confirmation";
import { Closed } from "./Closed";
import { ProgressBar } from "./ProgressBar";
import { TextField } from "./fields/TextField";
import { SelectCards } from "./fields/SelectCards";
import { EmailList } from "./fields/EmailList";
import { Checkbox } from "./fields/Checkbox";

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
 * - Draft saved to localStorage on every change and restored on return.
 * - Open/close window from content/site.json; outside it the form shows a closed message.
 * - Posts to the Apps Script; shows confirmation, or keeps the answers on screen with a retry.
 */
export function ApplicationForm() {
  const [mounted, setMounted] = useState(false);
  const [windowState, setWindowState] = useState<WindowState>("open");
  const [values, setValues] = useState<FormValues>(emptyValues);
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

  const update = useCallback(<K extends FieldKey>(key: K, v: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const scrollTop = () => topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });

  const goNext = () => {
    if (!step) return;
    const err = validateField(values, step.key);
    if (err) {
      setErrors((prev) => ({ ...prev, [step.key]: err }));
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
    const i = steps.findIndex((s) => s.key === key);
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
    const res: SubmitResponse = await submitApplication(buildPayload(result.data, honeypot));
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

  if (stepIndex < 0 || !mounted) {
    return (
      <div ref={topRef}>
        <h1 className="display text-5xl text-orange sm:text-6xl">{f.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-ink">{f.intro}</p>
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
            errors={errors}
            onEdit={edit}
            onBack={goBack}
            onSubmit={submit}
            submitting={status.kind === "submitting"}
            canSubmit={validation.ok}
          />
        ) : step ? (
          <StepView key={step.key} stepKey={step.key} kind={step.kind} values={values} error={errors[step.key] ?? null} update={update} onNext={goNext} onBack={goBack} isLast={stepIndex + 1 >= total} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type StepViewProps = {
  stepKey: FieldKey;
  kind: ReturnType<typeof activeSteps>[number]["kind"];
  values: FormValues;
  error: string | null;
  update: <K extends FieldKey>(key: K, v: FormValues[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
};

function StepView({ stepKey, kind, values, error, update, onNext, onBack, isLast }: StepViewProps) {
  const meta = fields[stepKey as keyof typeof fields] as { label: string; help?: string; placeholder?: string; noNote?: string; text?: string; checkboxLabel?: string };
  const nextLabel = isLast ? "Review answers" : undefined;

  switch (kind) {
    case "text":
    case "email":
      return (
        <Question label={meta.label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel}>
          <TextField
            label={meta.label}
            value={values[stepKey] as string}
            onChange={(v) => update(stepKey, v as never)}
            onEnter={onNext}
            placeholder={meta.placeholder}
            error={error}
            type={kind === "email" ? "email" : "text"}
            inputMode={kind === "email" ? "email" : "text"}
            autoComplete={stepKey === "name" ? "name" : stepKey === "email" ? "email" : "off"}
            autoFocus
          />
        </Question>
      );
    case "longtext":
      return (
        <Question label={meta.label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel}>
          <TextField label={meta.label} value={values.why} onChange={(v) => update("why", v)} placeholder={meta.placeholder} error={error} multiline maxLength={300} autoFocus />
        </Question>
      );
    case "select": {
      const value = values[stepKey] as string;
      const note = stepKey === "feb5" && value === "no" ? (meta.noNote ?? null) : null;
      return (
        <Question label={meta.label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel} note={note} nextDisabled={!value}>
          <SelectCards label={meta.label} options={optionsFor(stepKey)} value={value} onChange={(v) => update(stepKey, v as never)} error={error} columns={optionsFor(stepKey).length > 3 ? 2 : 1} />
        </Question>
      );
    }
    case "emails":
      return (
        <Question label={meta.label} help={meta.help} onNext={onNext} onBack={onBack} nextLabel={nextLabel}>
          <EmailList values={values.teammateEmails} onChange={(v) => update("teammateEmails", v)} onEnter={onNext} error={error} max={3} />
        </Question>
      );
    case "consent":
      return (
        <Question label={meta.label} help={meta.text} onNext={onNext} onBack={onBack} nextLabel={nextLabel} nextDisabled={!values.consent}>
          <Checkbox checked={values.consent} onChange={(v) => update("consent", v)} label={meta.checkboxLabel ?? "I agree"} error={error} />
        </Question>
      );
  }
}
