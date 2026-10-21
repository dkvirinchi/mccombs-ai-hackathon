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
export const UT_DOMAIN_RE = /utexas\.edu$/i;

export const utEmail = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, err.required)
  .regex(EMAIL_RE, err.emailFormat)
  .regex(UT_DOMAIN_RE, err.emailDomain);

export const baseSchema = z.object({
    name: z.string().trim().min(2, err.nameLength).max(80, err.nameLength),
    eid: z.string().trim().toLowerCase().min(1, err.required).regex(EID_RE, err.eidFormat),
    email: utEmail,
    program: z.enum(values(opts.program), { message: err.required }),
    feb5: z.enum(values(opts.availability), { message: err.required }),
    week: z.enum(values(opts.availability), { message: err.required }),
    applyingAs: z.enum(values(opts.applyingAs), { message: err.required }),
    teamName: z.string().trim().max(40, err.teamNameLength).default(""),
    teammateEmails: z.array(z.string().trim().toLowerCase()).default([]),
    aiSubscription: z.enum(values(opts.aiSubscription), { message: err.required }),
    buildExperience: z.enum(values(opts.buildExperience), { message: err.required }),
    why: z.string().trim().min(1, err.required).max(300, err.whyLength),
    consent: z.literal(true, { message: err.consent }),
});

/** Team-only rules. Returns the first error for teamName and teammateEmails, or null. */
export function teamErrors(values: {
  applyingAs: string;
  teamName: string;
  teammateEmails: string[];
  email: string;
}): { teamName: string | null; teammateEmails: string | null } {
  if (values.applyingAs !== "team") return { teamName: null, teammateEmails: null };
  const teamName = values.teamName.trim();
  const emails = values.teammateEmails.map((e) => e.trim().toLowerCase()).filter((e) => e.length > 0);
  const self = values.email.trim().toLowerCase();

  let teamNameError: string | null = null;
  if (teamName.length < 2 || teamName.length > 40) teamNameError = err.teamNameLength;

  let emailsError: string | null = null;
  if (emails.length < 1 || emails.length > 3) emailsError = err.teammateCount;
  else if (emails.some((e) => !EMAIL_RE.test(e))) emailsError = err.emailFormat;
  else if (emails.some((e) => !UT_DOMAIN_RE.test(e))) emailsError = err.emailDomain;
  else if (emails.includes(self)) emailsError = err.teammateSelf;
  else if (new Set(emails).size !== emails.length) emailsError = err.teammateDuplicate;

  return { teamName: teamNameError, teammateEmails: emailsError };
}

export const applicationSchema = baseSchema.superRefine((data, ctx) => {
  const t = teamErrors(data);
  if (t.teamName) ctx.addIssue({ code: "custom", path: ["teamName"], message: t.teamName });
  if (t.teammateEmails) ctx.addIssue({ code: "custom", path: ["teammateEmails"], message: t.teammateEmails });
});

export type Application = z.infer<typeof applicationSchema>;
export type ApplicationInput = z.input<typeof applicationSchema>;

/** The shape stored in the browser draft and edited by the form steps. */
export type FormValues = {
  name: string;
  eid: string;
  email: string;
  program: string;
  feb5: string;
  week: string;
  applyingAs: string;
  teamName: string;
  teammateEmails: string[];
  aiSubscription: string;
  buildExperience: string;
  why: string;
  consent: boolean;
};

export const emptyValues: FormValues = {
  name: "",
  eid: "",
  email: "",
  program: "",
  feb5: "",
  week: "",
  applyingAs: "",
  teamName: "",
  teammateEmails: [""],
  aiSubscription: "",
  buildExperience: "",
  why: "",
  consent: false,
};

export type FieldKey = keyof FormValues;

/** Validate one field on its own, for inline errors as the applicant moves through the steps. */
export function validateField(values: FormValues, field: FieldKey): string | null {
  if (field === "teamName" || field === "teammateEmails") return teamErrors(values)[field];
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
