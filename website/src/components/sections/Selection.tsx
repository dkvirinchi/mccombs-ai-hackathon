import { content } from "@/lib/content";
import { ButtonLink } from "@/components/layout/Button";
import { Section, SectionHeading } from "@/components/layout/Section";
import { T } from "@/components/layout/Todo";

export function Selection() {
  const s = content.selection;
  return (
    <Section id="selection">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading lead={s.lead} heading={s.heading} />
          <p className="mt-6 text-base font-semibold text-charcoal">{s.closeNote}</p>
          <div className="mt-6">
            <ButtonLink href="/apply" size="lg">
              {content.hero.primaryCta}
            </ButtonLink>
          </div>
        </div>
        <ol className="space-y-4">
          {s.points.map((p, i) => (
            <li key={i} className="flex gap-4 rounded-2xl bg-limestone-soft p-5">
              <span className="display shrink-0 text-2xl text-orange">{i + 1}</span>
              <p className="text-base text-ink">
                <T>{p}</T>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
