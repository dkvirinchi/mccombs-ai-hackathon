# McCombs AI Hackathon

The public site and application backend for the spring 2027 McCombs AI Hackathon. One link for everything: what the event is, how to apply, and later the partners, schedule and demo day.

- **Product spec:** [docs/PRD.md](docs/PRD.md)
- **Site:** `website/` (Next.js static export, Tailwind, Motion, deployed on Vercel)
- **Backend:** `apps-script/` (Google Apps Script web app writing to a Google Sheet)

## Editing content (no code)

Every word, date and link on the site lives in **`website/content/site.json`**. To change copy:

1. Edit `website/content/site.json` on a branch (the GitHub web editor is fine).
2. Open a pull request. CI checks the JSON parses and the site builds; Vercel posts a preview link.
3. Once approved and merged, the live site updates in a couple of minutes.

Values that start with `TODO` are placeholders waiting on a decision. They are outlined in orange on local and preview builds so they are easy to spot.

## Local development

```bash
cd website
npm install
cp .env.example .env.local     # optional; leave the script URL empty to run without a backend
npm run dev                    # http://localhost:3000
```

Checks before you push:

```bash
npm run lint && npx tsc --noEmit && npm run build
```

## Repo layout

```
docs/PRD.md                  product requirements
website/
  content/site.json          all copy, dates, options, feature flags
  src/app/                   routes: / (home) and /apply
  src/components/            hero, "Can I do this?", journey, sections, form
  src/lib/                   content loader, validation schema, submit contract, draft storage
apps-script/                 backend: doPost, validation, sheet upsert, confirmation email
.github/workflows/           CI for website and backend, optional Vercel deploy
```

## Deploying

The site is static and lives on Vercel's free Hobby plan.

**First deploy (dashboard):**

1. Sign in to vercel.com with GitHub and import this repository.
2. Set **Root Directory** to `website`. Framework preset: Next.js. Leave build settings as detected.
3. Environment variables: `NEXT_PUBLIC_APPS_SCRIPT_URL` (leave empty until the backend is deployed) and `NEXT_PUBLIC_ENV` (`prod` for Production, `preview` for Preview).
4. Deploy. Every pull request gets its own preview URL; merges to `main` go live.

**Who can deploy:** on the Hobby plan Vercel only builds commits authored by the Vercel account owner. Merging a PR with a *merge commit* (not squash) makes the owner the author, so merges by the owner always deploy. If that ever gets in the way, set `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as repository secrets and `website-deploy.yml` deploys every merge through the Vercel CLI instead.

**Backend:** see [apps-script/README.md](apps-script/README.md).

## Contributing

- Work on a branch, open a PR, get one review. `main` is what's live.
- Content changes only touch `website/content/site.json`.
- Form validation rules live in two places on purpose: `website/src/lib/schema.ts` (browser) and `apps-script/validate.js` (server). Change both.
- Keep the palette and contrast rules from the PRD: burnt orange only for large headlines and button fills with white text.

## Key dates

| Milestone | Date |
| --- | --- |
| Site launch, applications open | Nov 9, 2026 |
| Applications close | Dec 4, 2026 |
| Decisions out | Dec 11, 2026 |
| Boot camp | Feb 5, 2027 |
| Build window, demo day | TODO |
