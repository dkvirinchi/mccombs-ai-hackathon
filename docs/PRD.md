# McCombs AI Hackathon Website — PRD

Oct 20, 2026 · @Virinchi

## Overview

We will build one public website that is the living hub for the spring 2027 McCombs AI Hackathon: it explains the event, collects applications for the 100-seat Feb 5 boot camp, and later publishes partner companies, schedule and demo day details. Virinchi owns the build; it replaces a Google Form (decided at the Oct 20 AI Catchup).

**Problem.** Students don't yet know what the hackathon is, and many assume "hackathon" means security hacking or requires coding experience. We also need a fast, low-effort way to collect and rank applications against a hard room cap of about 100 people, without McCombs IT hosting.

### Goals

1. Explain the event clearly enough that a student with no build experience applies with confidence (team optional, boot camp gives everyone a baseline).
2. Collect complete, clean applications straight into a Google Sheet the organizing team can sort and filter.
3. Give organizers enough signal (team status, availability, AI tool usage, background) to fill \~100 seats and balance teams.
4. Stay the single link we share in WhatsApp, LinkedIn and newsletters from November through demo day, updated as decisions land.
5. Let the whole organizing team contribute through a shared Git repo, with no paid infrastructure.

### Non-goals (v1)

- Hosting on McCombs or Azure infrastructure (blocked by permissions).
- User accounts, logins or an applicant portal.
- Automated acceptance decisions; selection stays a manual review in the Sheet.
- Ongoing Tech Club structure and exec roles (paused until the new exec team is in place).
- Final demo day judging mechanics (still an open decision).

### Success metrics

| Metric | Target |
| --- | --- |
| Applications received by close | 100+ individuals (enough to fill all seats) |
| Share applying as a team | Majority of applicants |
| Form completion rate (started → submitted) | 80%+ |
| Submissions with missing or invalid required fields | 0 (validated client-side) |
| Time to publish a content update | Under 15 minutes from merged PR |
| Organizer effort to export a shortlist | One filtered Sheet view, no manual re-keying |

## Users and user stories

The site serves four audiences; applicants matter most for v1, the public matters most at demo day.

| Audience | Who | What they need from the site |
| --- | --- | --- |
| Full-time MBA applicant | Priority applicants, from experienced builders to veterans and career switchers with no hands-on AI experience | What the event is, whether they qualify, how to apply with or without a team |
| Part-time and TEMBA applicant | Eligible, lower priority; working professionals with constrained availability (Feb 5 is a Friday) | Same as above, plus a clear read on the time commitment |
| Organizing team | Hannah, Matt, Karan, Kristin, Henry, Virinchi | Clean data in one Sheet; an easy way to update site content |
| Public and partners | McCombs leadership (Tina), PressW, alumni, Austin tech community | Event story, partner companies, demo day details and RSVP |

### User stories

- As a student with no build experience, I want to understand that a hackathon isn't hacking and that the boot camp gets me up to speed, so I apply instead of self-selecting out.
- As a student without a team, I want to apply solo and be placed on a balanced team.
- As a team of two to four, I want to apply together and get the team preference.
- As an applicant, I want an on-screen and email confirmation that my application arrived.
- As an organizer, I want every submission in one Sheet with team grouping and availability, so I can filter to 100 seats in minutes.
- As an organizer, I want to update event details by editing content in the repo, without touching form code.
- As an alum or Austin founder, I want to see what McCombs is doing in AI and RSVP to demo day.

## Site map and release plan

V1 goes live around Nov 9 with the info pages and the application; partners, logistics and demo day are added in place, so the link never changes.

### Site map

| Section | Contents | Ships in |
| --- | --- | --- |
| Home | Promise, key dates, Apply button, announcement banner | v1 |
| What is it | Hackathon defined, format, boot camp, who it is for | v1 |
| Apply | Application form, selection approach | v1 |
| FAQ | Commitment, tools and tokens, teams, contact | v1 |
| Partners and use cases | PressW and sourced companies, problem statements | v1.1 (after PressW confirms) |
| Schedule | Boot camp agenda, build window, rooms | v2 (January) |
| Demo day | Format, judges, public RSVP, finalists and winners | v2 (January to after event) |

&#91;embedded content: release plan · 4 phases, 4 gates\]

The PressW call (target: week of Oct 27) gates the partners page, not the launch. If the deal slips, v1 still ships and the partners section stays hidden until Plan B or C companies confirm.

## Functional requirements

V1 ships the info pages and the application; everything else is added as decisions land. Priority: P0 = launch blocker, P1 = before applications close, P2 = spring.

### Information pages

| ID | Requirement | Priority |
| --- | --- | --- |
| F-1 | Home: event name, one-line promise, key dates (Feb 5 boot camp, build window, demo day), primary Apply button above the fold | P0 |
| F-2 | "What is a hackathon": not security hacking; a short build sprint where teams solve real company problems with AI tools | P0 |
| F-3 | Who can apply: full-time MBA (priority), part-time and TEMBA (eligible); no build experience required; team optional | P0 |
| F-4 | Format: boot camp, team formation, build period, demo day, drawn from the project plan deck | P0 |
| F-5 | How selection works: \~100 seats; teams preferred; full Feb 5 availability required; criteria published if applications exceed seats | P0 |
| F-6 | FAQ: time commitment, AI tool access and tokens, team size (2–4), what to bring, contact | P0 |
| F-7 | Partners and use cases: PressW and the sourced companies with one-line problem statements | P1, after PressW confirms |
| F-8 | Schedule and logistics: rooms, times, agenda for boot camp and demo day | P2 |
| F-9 | Demo day: format, judges, public RSVP link, later the finalists and winners showcase | P2 |
| F-10 | Announcement banner, editable in one content file, for updates ("Partner companies announced") | P1 |

### Application form

One form, filled out per person. Applicants on a team each submit and enter the same team name plus teammates' emails; organizers match teams in the Sheet. This keeps one row per seat, which is what the 100 cap counts.

| Field | Type | Required | Validation and notes |
| --- | --- | --- | --- |
| Full name | Text | Yes | 2–80 characters |
| UT EID | Text | Yes | Format check (letters then digits); used for dedupe |
| Email | Email | Yes | Must end in utexas.edu |
| Program | Select: Full-time MBA, TEMBA, Part-time / other | Yes | Drives priority |
| Feb 5 boot camp availability | Select: Yes, Maybe, No | Yes | "No" shows an inline note that full attendance is required |
| Availability for the rest of hackathon week | Select: Yes, Maybe, No | Yes | Dates shown once the build window is set |
| Applying as | Select: With a team, Solo | Yes | Reveals team fields |
| Team name | Text | If team | Case-insensitive match key |
| Teammate emails | 1–3 emails | If team | utexas.edu; used to cross-check team rows |
| AI subscription level | Select: None, Free tiers only, School enterprise plan, Paid individual plan (e.g. Pro/Plus), Power-user plan (e.g. Max) | Yes | Signals tool usage and support need |
| Prior build experience | Select: None, Some (no-code or tutorials), Have shipped something | Yes | Used to balance solo placements |
| Why do you want to do this? | Long text | Yes | 300 characters max |
| Resume | PDF upload | Pending decision | Max 5 MB, PDF only |
| Consent | Checkbox | Yes | Data used only for hackathon selection and team placement |

Form behavior:

- F-11 (P0) Client-side validation with inline errors; submit disabled until valid.
- F-12 (P0) Confirmation screen on success, plus a confirmation email from the organizer account.
- F-13 (P0) Duplicate EID handling: a resubmission overwrites the earlier row and flags it, rather than creating a second seat.
- F-14 (P0) Open and close dates set in config; outside the window the form shows a closed message.
- F-15 (P1) Live team check: after a team name is entered, show how many teammates have already applied (count only, no names).
- F-16 (P1) Graceful failure: if the backend call fails, keep the entries on screen and show a retry plus a contact email.

### Organizer workflow (in the Sheet)

1. Each submission lands as a row with a timestamp, all fields and computed columns.
2. Computed columns: team size found, priority tier, duplicate flag.
3. Priority tier follows the agreed rules, in order:
   1. Exclude anyone who answered No to Feb 5.
   2. Full-time team applicants available Yes.
   3. Other team applicants available Yes.
   4. Solo applicants available Yes.
   5. Anyone answering Maybe, last.
4. If applications stay under 100, everyone not excluded gets in. If over, organizers agree the cut rule (e.g. timestamp within tier) before sending decisions.
5. Solo applicants are placed on teams using experience and subscription level, mixing experienced and new builders.
6. Decisions go out by email from the organizer account (mail merge from the Sheet), not from the site.

## Technical architecture

A static site on Vercel, built from a shared GitHub repo, posts applications to a Google Apps Script web app that writes to a Google Sheet. No server, no database, no cost.

&#91;embedded content: system architecture · build path and data path\]

The top row is how content ships; the lower rows are what happens when someone hits Submit.

### Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Frontend | Next.js static export with Tailwind and Motion (still fully static on Vercel) | All copy, dates and links in one `content/site.json` |
| Hosting | Vercel free tier, auto-deploy from `main`, preview URL per pull request | GitHub Pages as fallback; McCombs and Azure hosting ruled out |
| Backend | Apps Script web app, run as the organizer account, accessible to anyone | Script source versioned in the repo under `/apps-script` (push with clasp) |
| Storage | Google Sheet in a Tech Club shared drive; resumes in a restricted Drive folder | Separate test Sheet for preview deploys |
| Email | MailApp from the organizer account | Quotas are low on personal Gmail (about 100 recipients a day), so use a Workspace account or queue sends |

### Hosting cost, limits and domain

- **Cost:** Vercel Hobby is free, capped at 100 GB of bandwidth a month and limited to non-commercial use; a free student event site qualifies.
- **Traffic:** at 1–2 MB per visit, 100 GB covers 50,000+ visits a month against an expected few thousand. Form submissions go to Apps Script, not Vercel, so function limits don't apply.
- **Collaboration:** Hobby is a single-developer plan. The Vercel project lives on Virinchi's account; teammates contribute through the GitHub repo. Confirm early that teammates' commits deploy; if not, Virinchi merges pull requests.
- **Domain:** the default `<name>.vercel.app` is free. A custom domain connects free but costs roughly $10–20 a year to register. A utexas.edu subdomain would need UT IT, and "McCombs" or "Texas" in a domain may need McCombs marketing's okay.

### Integration rules

- The form posts JSON with `Content-Type: text/plain` to avoid a CORS preflight, which Apps Script can't answer; the script returns `{ ok, id }` or `{ ok: false, error }`.
- The script re-validates every field server-side, uses LockService to serialize writes, and dedupes on EID.
- Resumes (if kept) are read in the browser as base64, saved to Drive by the script, and stored in the Sheet as a link.
- The script URL lives in config, not hardcoded; a hidden honeypot field drops bot submissions.
- The only data the site ever reads back is the teammate count for a team name (F-15), never names or emails.

### Sheet columns

Timestamp, Submission ID, Name, EID, Email, Program, Feb 5 availability, Week availability, Applying as, Team name, Teammate emails, AI subscription, Build experience, Why, Resume link, Consent, then computed: Team rows found, Priority tier, Duplicate flag, Decision, Team assignment.

### Privacy and security

- Sheet and Drive folder shared only with named organizers; no link sharing.
- EIDs and resumes deleted 30 days after demo day; aggregate counts kept for the Tech Club handoff.
- Consent text on the form states exactly how data is used.

### Repo layout

`/content/site.json` (all editable copy), `/src` (pages, styles, form script), `/apps-script` (backend), `README.md` (local setup, deploy, how to update content). Changes go through pull requests with one reviewer.

## Content, design and accessibility

The copy has one job: make a nervous non-builder click Apply. Lead with what they get, not what they need to know already.

### Content principles

- Say early and plainly: "No coding experience needed. No team needed. The boot camp gets everyone to the same starting line."
- Define "hackathon" in one sentence on the home page; never assume the term is understood.
- Every date, seat count and rule comes from one content file, so the site never contradicts the project plan.
- Show partner logos and use cases only after written confirmation from each company.

### Content owners

| Content | Owner | Source |
| --- | --- | --- |
| Event description, format, dates | Virinchi (draft), team review | Project plan deck |
| Partner companies and use cases | Matt / Karan | PressW, or Plan B and C sourcing |
| Branding: name, logo, colors, flyer | Branding owner (not yet named) | Tech Club |
| Announcements for WhatsApp, LinkedIn, newsletters | Hannah, with Tina's input | Site copy |

### Visual and interaction design (proposed)

Look like UT, feel like a product launch: official colors on a warm off-white canvas, with motion that explains the event instead of decorating it.

| Role | Color | Hex | Source |
| --- | --- | --- | --- |
| Primary accent: buttons, key headlines | Burnt orange | #BF5700 | UT primary |
| Page background | Warm off-white | #FAF7F2 | Ours (not a UT color) |
| Cards, section bands | Limestone | #D6D2C4 | UT secondary |
| Body text, dark sections | Charcoal | #333F48 | UT secondary |

Brand and contrast rules:

- UT's guide says never use tints of burnt orange and avoid red or purple beside it, so variety comes from charcoal and limestone, not lighter oranges.
- No UT Tower imagery or university marks; the Tower needs written approval from UT's brand office.
- Burnt orange on off-white is about 4.3:1, below AA for body text. Use it for large headlines and as a button fill with white text (about 4.6:1), never for small copy.
- Type: a clean grotesk (Inter or Geist) for UI, with large, tight display headlines.

Signature interactions:

| Idea | What it does | Why | Priority |
| --- | --- | --- | --- |
| Prompt-to-product hero | A typed business problem ("Cut invoice review from 3 days to 3 hours") turns into a sketch of a working app | Shows in five seconds that hackathon means building with AI, not hacking | P0 |
| "Can I do this?" check | Three taps: no code, no team, Feb 5 free; each answer resolves to a reassuring yes and ends on Apply | Converts the biggest objection into the main call to action | P0 |
| Scroll-driven journey | Boot camp, team up, build, demo day, with a progress line that fills as you scroll | Replaces a wall of format text | P0 |
| One-question-at-a-time form | Typeform-style steps, progress bar, team field showing how many teammates have applied, draft saved in the browser | Higher completion on phones | P0 |
| Countdown and seat meter | Days to Feb 5, plus "X of 100 seats requested" from the Sheet | Urgency; show the meter only past about 40 so it never looks empty | P1 |
| Shareable "I applied" card | After submit, generates an image card for WhatsApp and LinkedIn | Applicants do our marketing | P1 |
| Use-case gallery | Partner problems as a bento grid, filter by industry, tap to expand | Makes the partners page worth revisiting | P1 |
| Demo day wall | Finalist video tiles, then winners | Showcase for alumni and the Austin tech community | P2 |

Guardrails: honor reduced-motion settings; no animation blocks content; mobile Lighthouse 90+; most visits arrive from WhatsApp on phones, so design and test mobile first.

### Accessibility

- WCAG 2.1 AA: color contrast 4.5:1, labeled form fields, keyboard-only completion, visible focus states.
- Errors announced to screen readers and described in text, not by color alone.
- Page loads in under 2 seconds on 4G; no heavy frameworks needed for v1.

## Owners, risks and open questions

The build itself is low-risk; the real dependencies are the PressW decision and a handful of open policy calls that the site copy has to state.

### Next actions

- [ ] Virinchi: create the shared Git repo and add the organizing team
- [ ] Virinchi: ship the v1 site skeleton and application form against a test Sheet
- [ ] Virinchi: follow up with Tina on Thursday, Oct 22, offering to put the PressW call on her calendar
- [ ] Hannah: add open decisions (demo day format, attendance) to the project plan
- [ ] Everyone: review the project plan and this PRD
- [ ] Ask Tina what marketing content she wants and how McCombs will distribute it
- [ ] Name a branding owner for logo, colors and flyer

### Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| PressW does not commit to training plus use cases | Partner page empty; weaker pitch | Launch v1 without partners; Plan B (alumni newsletter call, Antler, Capital Factory) and Plan C (UT accelerator, Brumley, classmates, ETA founders) after one week; source \~50 problems for 25–30 teams |
| More than 100 applicants with no agreed cut rule | Perceived unfairness | Publish the selection approach up front; agree the cut rule before applications close |
| Student data exposure (EIDs, resumes) | Privacy complaint, loss of trust | Restricted Sheet and Drive folder, no public read, delete data after the event |
| Part-time and TEMBA students can't make a Friday boot camp | Uneven access | State the requirement clearly; consider a small reserved allocation |
| Spam or junk submissions | Dirty data | Honeypot field, utexas.edu email check, EID dedupe |
| Branding not ready at launch | Plain-looking site | Ship with a clean default theme; swap in branding later via config |
| Single maintainer | Bottleneck | Content in one file anyone can edit; README with deploy steps |

### Open questions

- Do we collect resumes? (Virinchi skeptical; Hannah included them. Upload is built but hidden behind a flag.)
- Application open, close and decision dates.
- Confirm the one-form-per-person team model versus one form per team.
- Cut rule if applications exceed 100: timestamp within tier, or something else.
- Do we reserve seats for part-time and TEMBA teams?
- Build window dates and demo day date.
- Demo day format: video plus link judged by a panel, top 10 present live? Open to the public?
- Domain: a free vercel.app address or a custom domain?
- Token or tool access we will provide, so the FAQ can promise it.
- Does McCombs marketing need to approve the site before it is shared?
