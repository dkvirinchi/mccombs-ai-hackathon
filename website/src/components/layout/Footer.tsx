import Link from "next/link";
import { content } from "@/lib/content";
import { T } from "./Todo";

export function Footer() {
  return (
    <footer className="border-t border-limestone bg-limestone-soft text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-md space-y-2 text-sm">
          <p className="font-semibold text-charcoal">
            {content.event.name} {content.event.year}
          </p>
          <p className="text-muted">
            <T>{content.footer.line}</T>
          </p>
          <p className="text-xs text-muted">{content.footer.disclaimer}</p>
        </div>
        <ul className="flex gap-5 text-sm font-medium">
          {content.footer.links.map((l) => (
            <li key={l.label}>
              <Link href={l.href.replace(/^mailto:TODO\s*/i, "mailto:")} className="hover:text-orange-deep">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
