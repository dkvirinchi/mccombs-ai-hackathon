import { content } from "@/lib/content";
import type { FieldKey, FormValues } from "@/lib/schema";

export type StepKind = "text" | "email" | "select" | "emails" | "longtext" | "consent";

export type Step = {
  key: FieldKey;
  kind: StepKind;
  when?: (v: FormValues) => boolean;
};

/** Order of questions. Team steps appear only when applying as a team. */
export const ALL_STEPS: Step[] = [
  { key: "name", kind: "text" },
  { key: "eid", kind: "text" },
  { key: "email", kind: "email" },
  { key: "program", kind: "select" },
  { key: "feb5", kind: "select" },
  { key: "week", kind: "select" },
  { key: "applyingAs", kind: "select" },
  { key: "teamName", kind: "text", when: (v) => v.applyingAs === "team" },
  { key: "teammateEmails", kind: "emails", when: (v) => v.applyingAs === "team" },
  { key: "aiSubscription", kind: "select" },
  { key: "buildExperience", kind: "select" },
  { key: "why", kind: "longtext" },
  { key: "consent", kind: "consent" },
];

export function activeSteps(values: FormValues): Step[] {
  return ALL_STEPS.filter((s) => !s.when || s.when(values));
}

const opts = content.form.options;

export function optionsFor(key: FieldKey) {
  switch (key) {
    case "program":
      return opts.program;
    case "feb5":
    case "week":
      return opts.availability;
    case "applyingAs":
      return opts.applyingAs;
    case "aiSubscription":
      return opts.aiSubscription;
    case "buildExperience":
      return opts.buildExperience;
    default:
      return [];
  }
}

export function labelFor(key: FieldKey, value: string): string {
  const o = optionsFor(key).find((x) => x.value === value);
  return o ? o.label : value;
}
