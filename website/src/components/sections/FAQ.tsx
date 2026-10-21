import { content } from "@/lib/content";
import { Section, SectionHeading } from "@/components/layout/Section";
import { T } from "@/components/layout/Todo";

/** Native <details> keeps the FAQ keyboard-accessible with zero JavaScript. */
export function FAQ() {
  const f = content.faq;
  return (
    <Section id="faq" tone="limestone">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading heading={f.heading} />
        <div className="divide-y divide-limestone rounded-2xl border border-limestone bg-white">
          {f.items.map((item) => (
            <details key={item.q} className="group px-5 py-4 open:bg-limestone-soft/50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-charcoal [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden className="text-orange transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-base text-ink">
                <T>{item.a}</T>
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
