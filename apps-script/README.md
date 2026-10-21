# Application backend (Google Apps Script)

A tiny web app that takes the form's JSON, validates it, writes one row per applicant to a Google Sheet, and sends a confirmation email. Source is versioned here and pushed with [clasp](https://github.com/google/clasp).

## One-time setup (organizer account)

1. **Create two Google Sheets** in the Tech Club shared drive: `AI Hackathon Applications` (production) and `AI Hackathon Applications (TEST)`. Share them with named organizers only. Copy each spreadsheet ID from its URL (`/spreadsheets/d/<ID>/edit`).
2. **Create the Apps Script project.** Go to script.google.com, New project, name it `mccombs-ai-hackathon-backend`. Copy the Script ID from Project Settings.
3. **Push the code from this folder.**
   ```bash
   npm install -g @google/clasp
   clasp login                       # with the organizer Google account
   cd apps-script
   cp .clasp.json.example .clasp.json   # paste the Script ID; this file is gitignored
   clasp push
   ```
4. **Set Script Properties** (Project Settings > Script Properties):

   | Key | Value |
   | --- | --- |
   | `PROD_SHEET_ID` | production spreadsheet ID |
   | `TEST_SHEET_ID` | test spreadsheet ID |
   | `APPLICATIONS_OPEN` | `2026-11-09T09:00:00-06:00` |
   | `APPLICATIONS_CLOSE` | `2026-12-04T23:59:00-06:00` |
   | `SEND_EMAIL` | `false` until launch, then `true` |
   | `FROM_NAME` | `McCombs AI Hackathon` |
   | `REPLY_TO` | organizer inbox |
   | `DECISIONS_BY` | `Dec 11, 2026` |

   The open and close dates must match `website/content/site.json`. The site hides the form outside the window; the script rejects anything that still arrives.
5. **Run `setup`** from the editor (pick `setup` in the function dropdown, Run). Approve the permissions. Both sheets get a frozen header row.
6. **Run `testSubmit`** to write one fake row to the TEST sheet and check the computed columns.
7. **Deploy:** Deploy > New deployment > Web app. Execute as **Me**, who has access **Anyone**. Copy the URL ending in `/exec`.
8. **Give the URL to the site:** in Vercel, set `NEXT_PUBLIC_APPS_SCRIPT_URL` to that URL for every environment, and `NEXT_PUBLIC_ENV=prod` on Production only. Preview deploys then write to the TEST sheet.

## Updating the script

Edit the files here, open a PR, merge, then from the organizer account:

```bash
cd apps-script && clasp push
```

Then Deploy > Manage deployments > edit the existing deployment > New version. The `/exec` URL does not change.

## How it works

- `Code.js` handles `doPost`: honeypot check, open window, `validate()`, LockService lock, `upsertApplication()`, `sendConfirmation()`.
- `validate.js` mirrors the rules in `website/src/lib/schema.ts`. Change both together.
- `sheet.js` finds an existing row by EID. A resubmission overwrites the row, keeps the first timestamp and ID, and sets the Duplicate flag. Decision and Team assignment are never touched.
- `Team rows found` and `Priority tier` are formulas so they stay live and organizers can change the rule in the Sheet.
- Email quota: a consumer Gmail account sends about 100 emails a day, a Workspace account about 1,500. Deploy from a Workspace account if possible.

## Data handling

Sheets and the Drive folder are shared only with named organizers. EIDs and resumes are deleted 30 days after demo day. The script never returns applicant data to the site.
