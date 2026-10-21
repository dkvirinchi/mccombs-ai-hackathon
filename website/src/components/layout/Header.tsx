import Link from "next/link";
import { content } from "@/lib/content";
import { ButtonLink } from "./Button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-limestone/60 bg-canvas/90 backdrop-blur supports-[backdrop-filter]:bg-canvas/75">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-charcoal">
          <span aria-hidden className="inline-block h-3 w-3 rounded-sm bg-orange" />
          {content.event.name}
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
