import Link from "next/link";
import { content } from "@/lib/content";
import { ButtonLink } from "./Button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-limestone/60 bg-canvas/90 backdrop-blur supports-[backdrop-filter]:bg-canvas/75">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight text-charcoal sm:text-xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimization needed */}
          <img src={content.meta.logo} alt="" aria-hidden className="h-7 w-auto sm:h-8" />
          <span>{content.event.name}</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-charcoal md:flex">
          {content.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-orange-deep">
              {item.label}
            </Link>
          ))}
        </nav>
        <ButtonLink href="/apply" size="md">
          {content.hero.primaryCta}
        </ButtonLink>
      </div>
    </header>
  );
}
