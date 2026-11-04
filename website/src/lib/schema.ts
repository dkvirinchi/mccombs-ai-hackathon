import { z } from "zod";
import { content } from "./content";

/**
 * Client-side validation rules for the application form.
 * The Apps Script in /apps-script/validate.js mirrors these rules exactly.
 * If you change a rule here, change it there too.
 */

const err = content.form.errors;
const opts = content.form.options;

const values = (list: { value: string }[]) => list.map((o) => o.value) as [string, ...string[]];

export const EID_RE = /^[a-z]{2,8}[0-9]{1,6}$/i;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Minimum number of business areas to rank. Applicants may rank more, up to all of them. */
export const MIN_USE_CASES = 3;
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export const email = z.string().trim().toLowerCase().min(1, err.required).regex(EMAIL_RE, err.emailFormat);

const personName = z.string().trim().min(1, err.nameLength).max(40, err.nameLength);
const availability = z.enum(values(opts.availability), { message: err.required });

export const baseSchema = z.object({
  firstName: personName,
  lastName: personName,
  eid: z.string().trim().toLowerCase().min(1, err.required).regex(EID_RE, err.eidFormat),
  email,
  program: z.enum(values(opts.program), { message: err.required }),
  applyingAs: z.enum(values(opts.applyingAs), { message: err.required }),
  teamName: z.string().trim().max(40, err.teamNameLength).default(""),
  teammateEmails: z.array(z.string().trim().toLowerCase()).default([]),
  captain: z.string().default(""),
  captainCommit: z.boolean().default(false),
  bootCamp: availability,
  buildWindow: availability,
  finalPresentation: availability,
  useCases: z
    .array(z.enum(values(opts.businessAreas)))
    .min(MIN_USE_CASES, err.useCases)
    .refine((a) => new Set(a).size === a.length, err.useCases),
  aiSubscription: z.enum(values(opts.aiSubscription), { message: err.required }),
  buildExperience: z.enum(values(opts.buildExperience), { message: err.required }),
  aiComfort: z.enum(values(opts.aiComfort), { message: err.required }),
  resumeShare: z.boolean().default(false),
  consent: z.literal(true, { message: err.consent }),
});

type TeamFields = {
  applyingAs: string;
  teamName: string;
  teammateEmails: string[];
  email: string;
  captain: string;
  captainCommit: boolean;
};

/** Team-only rules. Returns the first error for each team field, or null. */
export function teamErrors(values: TeamFields): {
  teamName: string | null;
  teammateEmails: string | null;
  captain: string | null;
  captainCommit: string | null;
} {
  const none = { teamName: null, teammateEmails: null, captain: null, captainCommit: null };
  if (values.applyingAs !== "team") return none;
  const teamName = values.teamName.trim();
  const emails = values.teammateEmails.map((e) => e.trim().toLowerCase()).filter((e) => e.length > 0);
  const self = values.email.trim().toLowerCase();

  let teamNameError: string | null = null;
  if (teamName.length < 2 || teamName.length > 40) teamNameError = err.teamNameLength;

  let emailsError: string | null = null;
  if (emails.length < 1 || emails.length > 3) emailsError = err.teammateCount;
  else if (emails.some((e) => !EMAIL_RE.test(e))) emailsError = err.emailFormat;
  else if (emails.includes(self)) emailsError = err.teammateSelf;
  else if (new Set(emails).size !== emails.length) emailsError = err.teammateDuplicate;

  const captainValues = opts.captain.map((o) => o.value);
  const captainError = captainValues.includes(values.captain) ? null : err.required;
  const commitError = values.captain === "yes" && !values.captainCommit ? err.captainCommit : null;

  return { teamName: teamNameError, teammateEmails: emailsError, captain: captainError, captainCommit: commitError };
}

export const applicationSchema = baseSchema.superRefine((data, ctx) => {
  const t = teamErrors(data);
  for (const key of ["teamName", "teammateEmails", "captain", "captainCommit"] as const) {
    if (t[key]) ctx.addIssue({ code: "custom", path: [key], message: t[key] });
  }
});

export type Application = z.infer<typeof applicationSchema>;
export type ApplicationInput = z.input<typeof applicationSchema>;

/** The shape stored in the browser draft and edited by the form steps. The resume file is kept separately (see ApplicationForm). */
export type FormValues = {
  firstName: string;
  lastName: string;
  eid: string;
  email: string;
  program: string;
  applyingAs: string;
  teamName: string;
  teammateEmails: string[];
  captain: string;
  captainCommit: boolean;
  bootCamp: string;
  buildWindow: string;
  finalPresentation: string;
  useCases: string[];
  aiSubscription: string;
  buildExperience: string;
  aiComfort: string;
  resumeShare: boolean;
  consent: boolean;
};

export const emptyValues: FormValues = {
  firstName: "",
  lastName: "",
  eid: "",
  email: "",
  program: "",
  applyingAs: "",
  teamName: "",
  teammateEmails: [""],
  captain: "",
  captainCommit: false,
  bootCamp: "",
  buildWindow: "",
  finalPresentation: "",
  useCases: [],
  aiSubscription: "",
  buildExperience: "",
  aiComfort: "",
  resumeShare: false,
  consent: false,
};

/** Each form step edits one field, except the resume step, which edits the file plus resumeShare. */
export type FieldKey = keyof FormValues | "resume";

const TEAM_KEYS = ["teamName", "teammateEmails", "captain", "captainCommit"] as const;

/** Validate one field on its own, for inline errors as the applicant moves through the steps. */
export function validateField(values: FormValues, field: FieldKey): string | null {
  if (field === "resume") return null; // checked when the file is chosen
  if ((TEAM_KEYS as readonly string[]).includes(field)) return teamErrors(values)[field as (typeof TEAM_KEYS)[number]];
  const result = baseSchema.shape[field].safeParse(values[field]);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? err.required;
}

/** Whole-form validation. Returns the parsed, normalized application or a map of field errors. */
export function validateAll(
  values: FormValues,
): { ok: true; data: Application } | { ok: false; errors: Partial<Record<FieldKey, string>> } {
  const result = applicationSchema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  const errors: Partial<Record<FieldKey, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as FieldKey;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
