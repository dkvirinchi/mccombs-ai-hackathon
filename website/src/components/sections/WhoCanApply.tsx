import { content } from "@/lib/content";
import { Section, SectionHeading } from "@/components/layout/Section";

export function WhoCanApply() {
  const w = content.whoCanApply;
  return (
    <Section id="who-can-apply" tone="limestone">
      <SectionHeading lead={w.lead} heading={w.heading} />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {w.groups.map((g) => (
          <div key={g.title} className="rounded-2xl border border-limestone bg-white p-6">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                g.tag === "Priority" ? "bg-orange text-white" : "bg-limestone-soft text-charcoal"
              }`}
            >
              {g.tag}
            </span>
            <h3 className="mt-4 text-2xl font-bold text-charcoal">{g.title}</h3>
            <p className="mt-2 text-base text-ink">{g.body}</p>
          </div>
        ))}
      </div>
      <ul className="mt-8 grid gap-3 text-base text-ink sm:grid-cols-3">
        {w.notes.map((n) => (
          <li key={n} className="flex gap-3">
            <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange" />
            {n}
          </li>
        ))}
      </ul>
    </Section>
  );
}
