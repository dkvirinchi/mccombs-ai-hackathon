# Application form

What the form asks, why, and where each answer lands in the Sheet. This supersedes the field table in [PRD.md](PRD.md) (decisions from Hannah, Nov 4, 2026).

## Model: one application per person

Every participant submits their own application, including each member of a team. Teams are matched by **team name** (case-insensitive), with **teammate emails** as a cross-check. The team name question asks each member to apply with the same name.

Why per person rather than one per team:

- One row = one seat, so the headcount is the row count.
- Commitment, resume, experience and the AI-comfort baseline are individual answers.
- Each person confirms their own availability.

## Screens

Copy lives in `website/content/site.json` under `form.fields` and `form.options`. Order lives in `website/src/components/form/steps.ts`. Rules live in `website/src/lib/schema.ts` and are mirrored in `apps-script/validate.js`.

The apply page opens with four bullets (`form.introBullets`); `{closeDate}` and `{email}` are filled from `dates.applicationsClose` and `contact.email`.

| # | Keys | Screen | Answer | Shown when |
| --- | --- | --- | --- | --- |
| 1 | `firstName`, `lastName` | What's your name? (two boxes, heading copy in `fields.name`) | Text, 1 to 40 chars each | Always |
| 2 | `eid`, `email` | Your UT EID and email (heading copy in `fields.contact`) | EID: letters then digits, dedupe key. Email: any valid address | Always |
| 3 | `program` | Program | Full-time MBA / TEMBA / Part-time or other | Always |
| 4 | `applyingAs` | Team or on your own | Team / Solo. Solo copy says placement is best effort, not guaranteed | Always |
| 5 | `teamName` | Team name | 2 to 40 chars | Team |
| 6 | `teammateEmails` | Teammates' emails | 1 to 3 valid emails (teams are 2 to 4 people) | Team |
| 7 | `captain` | Will you be your team's captain? | Yes / No, with bullets on the role | Team |
| 8 | `captainCommit` | Captain commitment | Checkbox, required | Team and captain = Yes |
| 9 | `bootCamp` | "The boot camp runs {date}, {time}..." | Yes / Not sure yet / No | Always |
| 10 | `buildWindow` | "The hackathon build runs {start} to {end}..." | Yes / Not sure yet / No | Always |
| 11 | `finalPresentation` | "The final presentation is {date}..." | Yes / Not sure yet / No | Always |
| 12 | `useCases` | Business areas, ranked | Rank at least 3 of 6 (from the use-case sourcing deck). Copy says matching is best effort | Always |
| 13 | `aiSubscription` | Paid AI tools today | 5 levels, None to Power-user | Always |
| 14 | `buildExperience` | How much built with AI tools | 4 levels, Never to Built and run apps | Always |
| 15 | `aiComfort` | Comfort with AI tools | 1 to 5. Baseline for the post-hackathon survey, which should ask the same question | Always |
| 16 | `resume` + `resumeShare` | Resume upload | Optional PDF up to 5 MB, plus a separate opt-in to share with partners | `features.resumeUpload` is on |

A "pair" screen (1 and 2) shows two inputs; both are validated before moving on. Dates in screens 9 to 11 come from `dates.bootCamp`, `dates.bootCampTime`, `dates.buildWindow` and `dates.demoDay.date`, so changing a date there updates the questions.

Answers that no longer apply are cleared before sending (team fields for solo applicants, captain commitment for non-captains, share opt-in without a resume). See `buildPayload` in `website/src/lib/submit.ts`.

## Sheet columns

Timestamp, Submission ID, First name, Last name, EID, Email, Program, Applying as, Team name, Teammate emails, Captain, Captain commitment, Boot camp, Build window, Final presentation, Business area 1st, Business area 2nd, Business area 3rd, Other business areas (4th onward, in order), AI subscription, Build experience, AI comfort (1-5), Resume link, OK to share resume, then computed and organizer columns:

| Column | What it is |
| --- | --- |
| Team rows found | How many rows share this team name. Compare with the team's expected size. |
| Captains on team | How many rows on this team said Yes to captain. Should be exactly 1. |
| Priority tier | Same rules as the PRD, keyed on Boot camp availability. Editable formula. |
| Duplicate flag | Set when the same EID resubmits; the row is overwritten, not duplicated. |
| Decision, Team assignment | Organizer-owned; the script never writes them. |

Build experience labels start with a number (1 to 4) so the column sorts by level.

## Resumes

Uploaded PDFs are saved to the Drive folder in the `RESUME_FOLDER_ID` script property, named `Last, First (eid).pdf`. Test-link uploads are prefixed `[TEST]`. The Sheet stores the file link. Only share resumes with partners for rows where **OK to share resume** is Yes.

The file is not kept in the browser draft, so an applicant who leaves and comes back has to attach it again (the form says so).
