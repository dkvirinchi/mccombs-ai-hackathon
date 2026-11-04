/**
 * Backend configuration: option code → label maps, Sheet column order and email copy.
 * The site sends stable codes (see website/src/lib/submit.ts); the Sheet stores labels
 * so organizers can read and filter it without a legend.
 * The labels here must match form.options in website/content/site.json.
 *
 * Runtime settings live in Script Properties (File > Project properties, or the Apps Script
 * editor's Project Settings page), never in this file:
 *   PROD_SHEET_ID        Spreadsheet ID of the production Sheet
 *   TEST_SHEET_ID        Spreadsheet ID of the test Sheet (used by preview deploys and local dev)
 *   RESUME_FOLDER_ID     Drive folder ID for uploaded resumes (shared with organizers only)
 *   APPLICATIONS_OPEN    ISO date-time, must match dates.applicationsOpen in website/content/site.json, e.g. 2026-11-09T09:00:00-06:00 (prod only)
 *   APPLICATIONS_CLOSE   ISO date-time, must match dates.applicationsClose in website/content/site.json, e.g. 2026-12-15T23:59:00-06:00 (prod only)
 *   SEND_EMAIL           "true" to send confirmation emails, anything else to skip
 *   FROM_NAME            Sender name shown in the confirmation email
 *   REPLY_TO             Reply-to address for the confirmation email
 *   DECISIONS_BY         Human-readable date shown in the email, e.g. "Jan 30, 2027"
 */

var LABELS = {
  program: {
    fulltime_mba: "Full-time MBA",
    temba: "TEMBA",
    parttime_other: "Part-time MBA or other",
  },
  availability: { yes: "Yes", maybe: "Not sure yet", no: "No" },
  applyingAs: { team: "With a team", solo: "On my own" },
  captain: { yes: "Yes", no: "No" },
  businessAreas: {
    finance: "Finance",
    marketing: "Marketing",
    operations: "Operations & supply chain",
    hr: "HR & people",
    sales: "Sales",
    strategy: "Strategy",
  },
  aiSubscription: {
    none: "None",
    free: "Free tiers only",
    school: "School enterprise plan",
    paid: "Paid individual plan",
    power: "Power-user plan",
  },
  buildExperience: {
    none: "1 Never used an AI coding tool",
    tried: "2 Tried one by following along",
    prototype: "3 Built a working prototype",
    shipped: "4 Built and run apps",
  },
  aiComfort: { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" },
};

/** Sheet column order. Index + 1 = column number. Organizer-owned columns (Decision, Team assignment) go last. */
var COLUMNS = [
  "Timestamp",
  "Submission ID",
  "First name",
  "Last name",
  "EID",
  "Email",
  "Program",
  "Applying as",
  "Team name",
  "Teammate emails",
  "Captain",
  "Captain commitment",
  "Boot camp",
  "Build window",
  "Final presentation",
  "Business area 1st",
  "Business area 2nd",
  "Business area 3rd",
  "Other business areas",
  "AI subscription",
  "Build experience",
  "AI comfort (1-5)",
  "Resume link",
  "OK to share resume",
  "Team rows found",
  "Captains on team",
  "Priority tier",
  "Duplicate flag",
  "Decision",
  "Team assignment",
];

var SHEET_NAME = "Applications";

/** Confirmation email. {name}, {id}, {teamName}, {decisionsBy} are replaced at send time. */
var EMAIL = {
  subject: "We got your McCombs AI Hackathon application",
  // TODO: review copy with the organizing team before launch.
  body:
    "Hi {name},\n\n" +
    "Thanks for applying to the McCombs AI Hackathon. Your application is in.\n\n" +
    "Reference: {id}\n" +
    "{teamLine}" +
    "We'll email you by {decisionsBy} to let you know if you've been selected.\n\n" +
    "Questions? Reply to this email.\n\n" +
    "The McCombs AI Hackathon organizing team",
  teamLine:
    "Team: {teamName}. Remind each teammate to submit their own application with the same team name.\n\n",
  resubmitLine: "This replaces your earlier application. We'll use the newest answers.\n\n",
};

function col(name) {
  var i = COLUMNS.indexOf(name);
  if (i < 0) throw new Error("Unknown column " + name);
  return i + 1;
}

function colLetter(name) {
  var n = col(name);
  var s = "";
  while (n > 0) {
    var m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function prop(key, fallback) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  return v === null || v === undefined || v === "" ? fallback : v;
}
