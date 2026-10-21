import { content } from "@/lib/content";
import { Section, SectionHeading } from "@/components/layout/Section";

export function WhatIsIt() {
  const w = content.whatIsIt;
  return (
    <Section id="what-is-it">
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <SectionHeading lead={w.lead} heading={w.heading} orange />
          <div className="mt-8 space-y-5 text-lg text-ink">
            {w.body.map((p, i) => (
              <p key={i} className={i === w.body.length - 1 ? "font-semibold text-charcoal" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 lg:mt-10">
          {w.stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-limestone-soft p-6">
              <dd className="display text-4xl text-charcoal sm:text-5xl">{s.value}</dd>
              <dt className="mt-2 text-sm font-medium text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
