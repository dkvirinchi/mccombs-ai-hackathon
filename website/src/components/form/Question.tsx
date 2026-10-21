"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { content } from "@/lib/content";
import { Button } from "@/components/layout/Button";

type Props = {
  label: string;
  help?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  note?: string | null;
};

export function Question({ label, help, children, onBack, onNext, nextLabel, nextDisabled, note }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: -24 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <h2 className="display text-3xl text-charcoal sm:text-4xl">{label}</h2>
      {help && <p className="mt-3 text-base text-muted">{help}</p>}
      <div className="mt-6">{children}</div>
      {note && (
        <p role="status" className="mt-2 rounded-xl border border-orange/40 bg-orange/10 px-4 py-3 text-sm font-medium text-charcoal">
          {note}
        </p>
      )}
      <div className="mt-6 flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            {content.form.backCta}
          </Button>
        )}
        <Button onClick={onNext} disabled={nextDisabled}>
          {nextLabel ?? content.form.nextCta}
        </Button>
      </div>
    </motion.div>
  );
}
