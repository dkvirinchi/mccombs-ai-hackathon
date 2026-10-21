"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { content } from "@/lib/content";

type Prompt = (typeof content.hero.prompts)[number];

const TYPE_MS = 38;
const HOLD_MS = 3600;
const RESET_MS = 500;

/**
 * Prompt-to-product hero. Types a business problem, then "builds" a sketch of
 * the app it becomes. Cycles through the prompts in content/site.json.
 * With reduced motion the final state is shown with no typing or build animation.
 */
export function PromptToProduct() {
  const prompts = content.hero.prompts;
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [built, setBuilt] = useState(false);

  const prompt: Prompt = prompts[index];
  // With reduced motion, show the finished state and never run the timers.
  const shownTyped = reduce ? prompt.problem : typed;
  const shownBuilt = reduce ? true : built;

  useEffect(() => {
    if (reduce) return;
    let i = 0;
    let cancelled = false;
    let timer = 0;
    const text = prompt.problem;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setTyped(text.slice(0, i));
      if (i < text.length) {
        timer = window.setTimeout(tick, TYPE_MS);
        return;
      }
      timer = window.setTimeout(() => {
        if (cancelled) return;
        setBuilt(true);
        timer = window.setTimeout(() => {
          if (cancelled) return;
          setBuilt(false);
          timer = window.setTimeout(() => {
            if (!cancelled) setIndex((n) => (n + 1) % prompts.length);
          }, RESET_MS);
        }, HOLD_MS);
      }, 350);
    };
    timer = window.setTimeout(() => {
      if (cancelled) return;
      setTyped("");
      setBuilt(false);
      tick();
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [prompt.problem, prompts.length, reduce]);

  return (
    <div className="relative w-full" aria-label="Animated example: a business problem becoming an app">
      {/* Prompt box */}
      <div className="rounded-2xl border border-limestone bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{content.hero.typedLabel}</p>
        <div className="flex min-h-[3.5rem] items-start gap-3 rounded-xl bg-limestone-soft px-4 py-3 font-mono text-sm text-charcoal sm:text-base">
          <span aria-hidden className="mt-0.5 text-orange">
            ›
          </span>
          <p aria-live="off">
            {shownTyped}
            {!shownBuilt && <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse bg-charcoal" />}
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center py-2" aria-hidden>
        <motion.span
          className="text-2xl text-orange"
          animate={shownBuilt ? { y: [0, 4, 0] } : { y: 0 }}
          transition={{ repeat: shownBuilt && !reduce ? Infinity : 0, duration: 1.4 }}
        >
          ↓
        </motion.span>
      </div>

      {/* App sketch */}
      <div className="min-h-[15rem]">
        <AnimatePresence mode="wait">
          {shownBuilt && (
            <motion.div
              key={prompt.app.name}
              initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="overflow-hidden rounded-2xl border border-charcoal/10 bg-charcoal text-white shadow-xl"
            >
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                <span className="ml-2 text-xs font-semibold tracking-wide text-limestone">{prompt.app.name}</span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-[1fr_1.3fr]">
                <motion.div
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-xl bg-white/5 p-3"
                >
                  <p className="text-[11px] uppercase tracking-wider text-limestone/80">{prompt.app.kpi.label}</p>
                  <p className="display mt-1 text-3xl text-white">{prompt.app.kpi.value}</p>
                  <p className="mt-1 text-xs font-medium text-limestone">{prompt.app.kpi.delta}</p>
                </motion.div>
                <ul className="space-y-2">
                  {prompt.app.rows.map((row, i) => (
                    <motion.li
                      key={row}
                      initial={reduce ? false : { opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.12 }}
                      className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm"
                    >
                      <span className="inline-block h-4 w-4 rounded border border-limestone/60 text-center text-[10px] leading-4 text-limestone">
                        ✓
                      </span>
                      {row}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="px-4 pb-4">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="inline-flex rounded-full bg-orange px-4 py-1.5 text-sm font-semibold text-white"
                >
                  {prompt.app.action}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-2 text-center text-xs text-muted">{content.hero.demoCaption}</p>
    </div>
  );
}
