import type { Application } from "./schema";
import { REVIEW_MODE } from "./window";

/**
 * Form-to-Sheet contract. Keep in sync with /apps-script/Code.js.
 *
 * Request: POST <NEXT_PUBLIC_APPS_SCRIPT_URL> with Content-Type text/plain (no CORS preflight)
 * and a JSON body of type SubmitPayload.
 * Response: always HTTP 200 with a JSON body of type SubmitResponse.
 */

export type SubmitPayload = Application & {
  v: 1;
  env: "prod" | "preview";
  resume: null | { name: string; mime: string; base64: string };
  hp: string;
};

export type SubmitResponse =
  | { ok: true; id: string; resubmission: boolean }
  | { ok: false; error: "validation"; fields: Record<string, string> }
  | { ok: false; error: "closed" }
  | { ok: false; error: "server" | "config"; message?: string };

export const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? "";
// Test links and local dev always write to the TEST sheet, whatever NEXT_PUBLIC_ENV says.
export const SUBMIT_ENV: "prod" | "preview" =
  !REVIEW_MODE && process.env.NEXT_PUBLIC_ENV === "prod" ? "prod" : "preview";

export function buildPayload(app: Application, honeypot: string): SubmitPayload {
  return {
    ...app,
    teammateEmails: app.applyingAs === "team" ? app.teammateEmails.filter(Boolean) : [],
    teamName: app.applyingAs === "team" ? app.teamName : "",
    v: 1,
    env: SUBMIT_ENV,
    resume: null,
    hp: honeypot,
  };
}

export async function submitApplication(payload: SubmitPayload): Promise<SubmitResponse> {
  if (!SCRIPT_URL) {
    // Review mode with no backend configured (usually local dev): pretend it worked so the
    // whole flow, including the confirmation screen, can be clicked through. Nothing is saved.
    if (REVIEW_MODE) return { ok: true, id: "HK-TEST0000", resubmission: false };
    return { ok: false, error: "config", message: "NEXT_PUBLIC_APPS_SCRIPT_URL is not set." };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await res.text();
    try {
      return JSON.parse(text) as SubmitResponse;
    } catch {
      return { ok: false, error: "server", message: `Unexpected response (${res.status}).` };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: "server", message };
  } finally {
    clearTimeout(timer);
  }
}
