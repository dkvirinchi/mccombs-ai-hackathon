"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { content } from "@/lib/content";
import { Section, SectionHeading } from "@/components/layout/Section";
import { T } from "@/components/layout/Todo";

/**
 * Scroll-driven journey (F-4). A vertical progress line fills as the reader
 * scrolls through the four stages. With reduced motion the line is simply full.
 */
export function Journey() {
  const j = content.journey;
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.6"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const scaleY = useTransform(smooth, [0, 1], [0, 1]);

  return (
    <Section id="format" tone="charcoal">
      <SectionHeading heading={j.heading} sub={j.subhead} light />
      <ol ref={ref} className="relative mt-16 space-y-14 pl-12 sm:pl-16">
        {/* Track and fill line */}
        <div aria-hidden className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-white/15 sm:left-[23px]" />
        <motion.div
          aria-hidden
          className="absolute left-[15px] top-2 bottom-2 w-[2px] origin-top bg-orange sm:left-[23px]"
          style={{ scaleY: reduce ? 1 : scaleY }}
        />
        {j.steps.map((step, i) => (
          <motion.li
            key={step.title}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative"
          >
            <span
              aria-hidden
              className="absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-charcoal bg-orange text-sm font-bold text-white sm:-left-16 sm:h-12 sm:w-12 sm:text-lg"
            >
              {i + 1}
            </span>
            <p className="text-sm font-semibold uppercase tracking-wider text-limestone">
              <T>{step.when}</T>
            </p>
            <h3 className="display mt-2 text-3xl text-white sm:text-4xl">{step.title}</h3>
            <p className="mt-3 max-w-2xl text-base text-limestone sm:text-lg">{step.body}</p>
          </motion.li>
        ))}
      </ol>
    </Section>
  );
}
