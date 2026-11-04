# Application form

What the form asks, why, and where each answer lands in the Sheet. This supersedes the field table in [PRD.md](PRD.md) (decisions from Hannah, Nov 4, 2026).

## Model: one application per person

Every participant submits their own application, including each member of a team. Teams are matched by **team name** (case-insensitive), with **teammate emails** as a cross-check.

Why per person rather than one per team:

- One row = one seat, so the headcount is the row count.
- Commitment, resume, experience and the AI-comfort baseline are individual answers.
- Each person confirms their own availability.

To keep team names consistent, the confirmation screen and email give a **teammate link** (`/apply/?team=<name>`) that opens the form with "With a team" and the team name already filled in.

## Questions

Copy lives in `website/content/site.json` under `form.fields` and `form.options`. Order lives in `website/src/components/form/steps.ts`. Rules live in `website/src/lib/schema.ts` and are mirrored in `apps-script/validate.js`.

| # | Key | Question | Answer | Shown when |
| --- | --- | --- | --- | --- |
| 1 | `firstName` | First name | Text, 1 to 40 chars | Always |
| 2 | `lastName` | Last name | Text, 1 to 40 chars | Always |
| 3 | `eid` | UT EID | Letters then digits; dedupe key | Always |
| 4 | `email` | UT email | Ends in utexas.edu or a subdomain (my.utexas.edu) | Always |
| 5 | `program` | Program | Full-time MBA / TEMBA / Part-time or other | Always |
| 6 | `applyingAs` | Team or on your own | Team / Solo. Solo copy says placement is best effort, not guaranteed | Always |
| 7 | `teamName` | Team name | 2 to 40 chars; pre-filled from the teammate link | Team |
| 8 | `teammateEmails` | Teammates' UT emails | 1 to 3 (teams are 2 to 4 people) | Team |
| 9 | `captain` | Will you be your team's captain? | Yes / No, with a blurb on the role | Team |
| 10 | `captainCommit` | Captain commitment | Checkbox, required | Team and captain = Yes |
| 11 | `bootCamp` | "The boot camp runs {date}, {time}..." | Yes / Not sure yet / No | Always |
| 12 | `buildWindow` | "The hackathon build runs {start} to {end}..." | Yes / Not sure yet / No | Always |
| 13 | `finalPresentation` | "The final presentation is {date}..." | Yes / Not sure yet / No | Always |
| 14 | `useCases` | Business areas, ranked | Pick 1 to 3 in order from 6 areas (from the use-case sourcing deck). Copy says matching is best effort | Always |
| 15 | `aiSubscription` | Paid AI tools today | 5 levels, None to Power-user | Always |
| 16 | `buildExperience` | How much built with AI tools | 4 levels, Never to Run apps others use | Always |
| 17 | `aiComfort` | Comfort with AI tools | 1 to 5. Baseline for the post-hackathon survey, which should ask the same question | Always |
| 18 | `why` | Why do you want to do this? | Up to 300 chars | Always |
| 19 | `resume` + `resumeShare` | Resume upload | Optional PDF up to 5 MB, plus a separate opt-in to share with partners | `features.resumeUpload` is on |
| 20 | `consent` | Consent | Checkbox, required | Always |

Dates in questions 11 to 13 come from `dates.bootCamp`, `dates.bootCampTime`, `dates.buildWindow` and `dates.demoDay.date` in `site.json`, so changing a date there updates the questions.

Answers that no longer apply are cleared before sending (team fields for solo applicants, captain commitment for non-captains, share opt-in without a resume). See `buildPayload` in `website/src/lib/submit.ts`.

## Sheet columns

Timestamp, Submission ID, First name, Last name, EID, Email, Program, Applying as, Team name, Teammate emails, Captain, Captain commitment, Boot camp, Build window, Final presentation, Business area 1st, Business area 2nd, Business area 3rd, AI subscription, Build experience, AI comfort (1-5), Why, Resume link, OK to share resume, Consent, then computed and organizer columns:

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
