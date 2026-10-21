import site from "../../content/site.json";

/** Typed access to content/site.json. Every page and component reads from here. */
export type SiteContent = typeof site;
export const content: SiteContent = site;

export type Option = { value: string; label: string; description?: string };

/** True when a content value is still a placeholder. Used to style TODOs in dev. */
export function isTodo(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().toUpperCase().startsWith("TODO");
}

/** Strip a leading "TODO " marker for display; keep the rest of the text. */
export function stripTodo(value: string): string {
  return value.replace(/^\s*TODO\s*/i, "");
}
