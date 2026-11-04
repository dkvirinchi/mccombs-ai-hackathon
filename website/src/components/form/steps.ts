import { content } from "@/lib/content";
import type { FieldKey, FormValues } from "@/lib/schema";
import { formatDate } from "@/lib/window";

export type StepKind = "pair" | "text" | "select" | "emails" | "rank" | "checkbox" | "resume";

/** Text inputs shown together on one screen (kind "pair"). */
export type PairField = { key: "firstName" | "lastName" | "eid" | "email"; type: "text" | "email"; autoComplete: string };

export type Step = {
  /** The field this screen edits. For a "pair" screen, the first of its fields. */
  key: FieldKey;
  kind: StepKind;
  /** For "pair" screens: the key under form.fields in site.json that holds the screen heading. */
  heading?: string;
  /** For "pair" screens: the inputs on the screen, in order. */
  pair?: PairField[];
  when?: (v: FormValues) => boolean;
};

const isTeam = (v: FormValues) => v.applyingAs === "team";

/**
 * Order of questions. To add, remove or reorder a question, edit this list, then add its copy
 * under form.fields in content/site.json and its rule in lib/schema.ts and apps-script/validate.js.
 */
export const ALL_STEPS: Step[] = [
  {
    key: "firstName",
    kind: "pair",
    heading: "name",
    pair: [
      { key: "firstName", type: "text", autoComplete: "given-name" },
      { key: "lastName", type: "text", autoComplete: "family-name" },
    ],
  },
  {
    key: "eid",
    kind: "pair",
    heading: "contact",
    pair: [
      { key: "eid", type: "text", autoComplete: "off" },
      { key: "email", type: "email", autoComplete: "email" },
    ],
  },
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
  ...(content.features.resumeUpload ? [{ key: "resume", kind: "resume" } as Step] : []),
];

/** The form fields a step edits: both inputs on a "pair" screen, otherwise just its key. */
export function stepFields(step: Step): FieldKey[] {
  return step.pair ? step.pair.map((p) => p.key) : [step.key];
}

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
