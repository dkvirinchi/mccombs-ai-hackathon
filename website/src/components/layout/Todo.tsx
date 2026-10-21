import { isTodo, stripTodo } from "@/lib/content";

/**
 * Renders a content string. If it starts with "TODO", the marker is stripped and
 * the text is outlined in dev so placeholders are easy to spot. In production the
 * outline is dropped but the text still shows, so nothing silently disappears.
 */
export function T({ children, className = "" }: { children: string; className?: string }) {
  if (!isTodo(children)) return <span className={className}>{children}</span>;
  const dev = process.env.NODE_ENV !== "production";
  return (
    <span className={`${className} ${dev ? "todo" : ""}`} title={dev ? "TODO in content/site.json" : undefined}>
      {stripTodo(children)}
    </span>
  );
}
