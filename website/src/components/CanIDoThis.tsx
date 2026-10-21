"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { content } from "@/lib/content";
import { ButtonLink } from "@/components/layout/Button";
import { Section, SectionHeading } from "@/components/layout/Section";

/**
 * "Can I do this?" check. Three taps; every answer resolves to a reassuring
 * message and the sequence ends on the Apply button.
 */
export function CanIDoThis() {
  const c = content.canIDoThis;
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  const done = step >= c.questions.length;
  const q = c.questions[Math.min(step, c.questions.length - 1)];

  const choose = (option: string) => {
    setPicked((p) => [...p.slice(0, step), option]);
  };

  const answered = picked[step];
  const answerText = q.options.find((o) => o.label === answered)?.answer ?? "";

  return (
    <Section id="can-i-do-this" tone="limestone">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <SectionHeading heading={c.heading} sub={c.subhead} />
        <div className="rounded-3xl border border-limestone bg-white p-6 shadow-sm sm:p-8" aria-live="polite">
          <ol className="mb-6 flex gap-2" aria-label="Progress">
            {c.questions.map((_, i) => (
              <li
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < step || done ? "bg-orange" : i === step ? "bg-charcoal" : "bg-limestone"}`}
              />
            ))}
          </ol>

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-sm font-semibold text-muted">
                  {step + 1} / {c.questions.length}
                </p>
                <p className="display mt-2 text-3xl text-charcoal sm:text-4xl">{q.question}</p>
                <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label={q.question}>
                  {q.options.map(({ label: opt }) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => choose(opt)}
                      aria-pressed={answered === opt}
                      className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                        answered === opt
                          ? "border-charcoal bg-charcoal text-white"
                          : "border-charcoal/30 bg-white text-charcoal hover:border-charcoal"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {answered && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduce ? undefined : { opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-6 rounded-2xl bg-limestone-soft p-4 text-base text-ink">{answerText}</p>
                      <button
                        type="button"
                        onClick={() => setStep((s) => s + 1)}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white hover:bg-charcoal-deep"
                      >
                        {step + 1 < c.questions.length ? "Next question" : "Finish"} <span aria-hidden>→</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="display text-4xl text-orange sm:text-5xl">{c.result.heading}</p>
                <p className="mt-4 text-lg text-ink">{c.result.body}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <ButtonLink href="/apply" size="lg">
                    {c.result.cta}
                  </ButtonLink>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(0);
                      setPicked([]);
                    }}
                    className="text-sm font-medium text-muted underline-offset-4 hover:underline"
                  >
                    Start over
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
