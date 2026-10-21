import { emptyValues, type FormValues } from "./schema";

const KEY = "mccombs-ai-hackathon:application-draft:v1";

export type Draft = { values: FormValues; step: number; savedAt: string };

/** Read the in-browser draft. Wrapped in try/catch: private windows and blocked storage must not break the form. */
export function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (!parsed || typeof parsed !== "object" || !parsed.values) return null;
    return {
      values: { ...emptyValues, ...parsed.values, consent: false },
      step: typeof parsed.step === "number" ? parsed.step : 0,
      savedAt: parsed.savedAt ?? "",
    };
  } catch {
    return null;
  }
}

export function saveDraft(values: FormValues, step: number): void {
  try {
    const draft: Draft = { values, step, savedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable; the form still works */
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
