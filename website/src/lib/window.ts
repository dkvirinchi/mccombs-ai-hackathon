import { content } from "./content";

export type WindowState = "before" | "open" | "after";

/** Application window from content/site.json. The Apps Script enforces the same dates server-side. */
export function applicationWindow(now: Date = new Date()): WindowState {
  const open = new Date(content.dates.applicationsOpen);
  const close = new Date(content.dates.applicationsClose);
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
