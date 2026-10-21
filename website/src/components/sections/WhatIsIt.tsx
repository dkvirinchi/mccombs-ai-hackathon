import { content } from "@/lib/content";
import { Section, SectionHeading } from "@/components/layout/Section";

export function WhatIsIt() {
  const w = content.whatIsIt;
  const photo = content.photos.classroom;
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
        <div className="lg:mt-10">
          <figure className="overflow-hidden rounded-3xl bg-limestone-soft">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, plain img */}
            <img src={photo.src} alt={photo.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />
            {photo.caption && <figcaption className="px-5 py-3 text-sm text-muted">{photo.caption}</figcaption>}
          </figure>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {w.stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-limestone-soft px-4 py-4">
                <dd className="display text-3xl text-charcoal">{s.value}</dd>
                <dt className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
