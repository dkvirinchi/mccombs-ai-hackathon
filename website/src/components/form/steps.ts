import { content } from "@/lib/content";
import type { FieldKey, FormValues } from "@/lib/schema";
import { formatDate } from "@/lib/window";

export type StepKind = "text" | "email" | "select" | "emails" | "longtext" | "rank" | "checkbox" | "resume" | "consent";

export type Step = {
  key: FieldKey;
  kind: StepKind;
  when?: (v: FormValues) => boolean;
};

const isTeam = (v: FormValues) => v.applyingAs === "team";

/**
 * Order of questions. To add, remove or reorder a question, edit this list, then add its copy
 * under form.fields in content/site.json and its rule in lib/schema.ts and apps-script/validate.js.
 */
export const ALL_STEPS: Step[] = [
  { key: "firstName", kind: "text" },
  { key: "lastName", kind: "text" },
  { key: "eid", kind: "text" },
  { key: "email", kind: "email" },
  { key: "program", kind: "select" },
  { key: "applyingAs", kind: "select" },
  { key: "teamName", kind: "text", when: isTeam },
  { key: "teammateEmails", kind: "emails", when: isTeam },
  { key: "captain", kind: "select", when: isTeam },
  { key: "captainCommit", kind: "checkbox", when: (v) => isTeam(v) && v.captain === "yes" },
  { key: "bootCamp", kind: "select" },
  { key: "buildWindow", kind: "select" },
  { key: "finalPresentation", kind: "select" },
  { key: "useCases", kind: "rank" },
  { key: "aiSubscription", kind: "select" },
  { key: "buildExperience", kind: "select" },
  { key: "aiComfort", kind: "select" },
  { key: "why", kind: "longtext" },
  ...(content.features.resumeUpload ? [{ key: "resume", kind: "resume" } as Step] : []),
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
    case "bootCamp":
    case "buildWindow":
    case "finalPresentation":
      return opts.availability;
    case "applyingAs":
      return opts.applyingAs;
    case "captain":
      return opts.captain;
    case "useCases":
      return opts.businessAreas;
    case "aiSubscription":
      return opts.aiSubscription;
    case "buildExperience":
      return opts.buildExperience;
    case "aiComfort":
      return opts.aiComfort;
    default:
      return [];
  }
}

export function labelFor(key: FieldKey, value: string): string {
  const o = optionsFor(key).find((x) => x.value === value);
  return o ? o.label : value;
}

/** Fill {bootCamp}, {buildStart} and similar placeholders in question text with dates from content/site.json. */
export function fillDates(text: string): string {
  const d = content.dates;
  const vars: Record<string, string> = {
    bootCamp: formatDate(d.bootCamp, { year: undefined }),
    bootCampTime: d.bootCampTime,
    buildStart: formatDate(d.buildWindow.start, { weekday: undefined, year: undefined }),
    buildEnd: formatDate(d.buildWindow.end, { weekday: undefined, year: undefined }),
    finalPresentation: formatDate(d.demoDay.date, { year: undefined }),
  };
  return text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}
