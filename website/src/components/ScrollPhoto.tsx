"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type Props = { src: string; alt: string; caption?: string; credit?: string };

/**
 * Full-width photo band with a slow parallax drift as it scrolls through the viewport.
 * The image is taller than its frame and moves at a fraction of scroll speed.
 * With reduced motion the image sits still.
 */
export function ScrollPhoto({ src, alt, caption, credit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const showCredit = credit && !credit.toUpperCase().startsWith("TODO");

  return (
    <figure ref={ref} className="relative h-[60vh] max-h-[40rem] min-h-[22rem] w-full overflow-hidden bg-charcoal sm:h-[72vh]">
      <motion.div style={{ y: reduce ? 0 : y }} className="absolute inset-x-0 -top-[15%] h-[130%]">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, plain img */}
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      </motion.div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-charcoal/70 to-transparent" />
      {(caption || showCredit) && (
        <figcaption className="absolute bottom-5 left-4 right-4 flex flex-wrap items-end justify-between gap-2 text-white sm:left-6 sm:right-6">
          {caption && <span className="text-sm font-semibold tracking-wide">{caption}</span>}
          {showCredit && <span className="text-xs text-limestone">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
