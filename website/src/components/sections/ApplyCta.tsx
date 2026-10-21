import { content } from "@/lib/content";
import { formatDate } from "@/lib/window";
import { ButtonLink } from "@/components/layout/Button";

export function ApplyCta() {
  const a = content.applyCta;
  const photo = content.photos.rowlingHall;
  return (
    <section id="apply" className="relative overflow-hidden bg-charcoal text-white">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, plain img */}
      <img src={photo.src} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/85 via-charcoal/65 to-charcoal/35" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-36">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <h2 className="display text-4xl text-white sm:text-5xl md:text-6xl">{a.heading}</h2>
            <p className="mt-5 max-w-2xl text-lg text-limestone">{a.body}</p>
            <p className="mt-3 text-base font-semibold text-white">{a.closeNote}</p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <ButtonLink href="/apply" size="lg">
              {a.cta}
            </ButtonLink>
            <p className="text-sm text-limestone">Boot camp {formatDate(content.dates.bootCamp)}</p>
          </div>
        </div>
        <p className="relative mt-16 text-xs text-limestone/80">{photo.caption}</p>
      </div>
    </section>
  );
}
