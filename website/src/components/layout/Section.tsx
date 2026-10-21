import type { ReactNode } from "react";

type Tone = "canvas" | "limestone" | "charcoal";

const tones: Record<Tone, string> = {
  canvas: "bg-canvas text-ink",
  limestone: "bg-limestone-soft text-ink",
  charcoal: "bg-charcoal text-white",
};

export function Section({
  id,
  tone = "canvas",
  className = "",
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${tones[tone]} py-20 sm:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function SectionHeading({
  lead,
  heading,
  sub,
  light = false,
  orange = false,
}: {
  lead?: string;
  heading: string;
  sub?: string;
  light?: boolean;
  orange?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {lead && (
        <p className={`mb-3 text-sm font-semibold uppercase tracking-wider ${light ? "text-limestone" : "text-muted"}`}>
          {lead}
        </p>
      )}
      <h2
        className={`display text-4xl sm:text-5xl md:text-6xl ${
          orange ? "text-orange" : light ? "text-white" : "text-charcoal"
        }`}
      >
        {heading}
      </h2>
      {sub && <p className={`mt-5 text-lg sm:text-xl ${light ? "text-limestone" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}
