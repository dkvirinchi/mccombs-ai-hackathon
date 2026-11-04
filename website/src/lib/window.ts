import { content } from "./content";

export type WindowState = "before" | "open" | "after";

/**
 * Review mode: the form is always open so organizers can try it before launch.
 * True on Vercel preview deploys (the per-PR test links) and on `npm run dev`.
 * Production is never in review mode, even if environment variables are missing,
 * so the live site fails closed.
 */
export const REVIEW_MODE =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";

/**
 * Whether the live form is open. Two switches in content/site.json, both must allow it:
 *   1. features.applicationsLive: the on/off switch. While false, the form shows "opening soon".
 *   2. dates.applicationsOpen / applicationsClose: the window once the switch is on.
 * The Apps Script enforces the dates again server-side.
 */
export function applicationWindow(now: Date = new Date()): WindowState {
  if (REVIEW_MODE) return "open";
  if (!content.features.applicationsLive) return "before";
  const open = new Date(content.dates.applicationsOpen);
  const close = new Date(content.dates.applicationsClose);
  // A placeholder or malformed date keeps the form closed rather than open.
  if (Number.isNaN(open.getTime()) || Number.isNaN(close.getTime())) return "before";
  if (now < open) return "before";
  if (now > close) return "after";
  return "open";
}

const CT = "America/Chicago";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!iso || iso.toUpperCase().startsWith("TODO")) return iso;
  // Date-only strings are parsed as UTC midnight; pin them to noon CT to avoid off-by-one.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00-06:00`) : new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CT,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00-06:00`) : new Date(iso);
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86_400_000));
}
