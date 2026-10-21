import { content } from "@/lib/content";
import { formatDate } from "@/lib/window";
import { ButtonLink } from "@/components/layout/Button";

export function ApplyCta() {
  const a = content.applyCta;
  return (
    <section id="apply" className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 rounded-3xl bg-limestone-soft p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <h2 className="display text-4xl text-orange sm:text-5xl md:text-6xl">{a.heading}</h2>
            <p className="mt-5 max-w-2xl text-lg text-ink">{a.body}</p>
            <p className="mt-3 text-base font-semibold text-charcoal">{a.closeNote}</p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <ButtonLink href="/apply" size="lg">
              {a.cta}
            </ButtonLink>
            <p className="text-sm text-muted">Boot camp {formatDate(content.dates.bootCamp)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
