import { content } from "@/lib/content";
import { formatDate } from "@/lib/window";
import { ButtonLink } from "@/components/layout/Button";
import { T } from "@/components/layout/Todo";
import { PromptToProduct } from "./PromptToProduct";

export function Hero() {
  const d = content.dates;
  const keyDates = [
    { label: "Applications close", value: formatDate(d.applicationsClose) },
    { label: "Boot camp", value: formatDate(d.bootCamp) },
    { label: "Build week", value: d.buildWindow.label },
    { label: "Demo day", value: d.demoDay.label },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-28 lg:pt-20">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">{content.hero.eyebrow}</p>
          <h1 className="display text-5xl text-orange sm:text-6xl lg:text-7xl">{content.hero.headline}</h1>
          <p className="mt-6 max-w-xl text-lg text-ink sm:text-xl">{content.hero.subhead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/apply" size="lg">
              {content.hero.primaryCta}
            </ButtonLink>
            <ButtonLink href="/#what-is-it" size="lg" variant="ghost">
              {content.hero.secondaryCta}
            </ButtonLink>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-limestone pt-8 sm:grid-cols-4">
            {keyDates.map((k) => (
              <div key={k.label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k.label}</dt>
                <dd className="mt-1 text-sm font-semibold text-charcoal sm:text-base">
                  <T>{k.value}</T>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:pl-6">
          <PromptToProduct />
        </div>
      </div>
    </section>
  );
}
