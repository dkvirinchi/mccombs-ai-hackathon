/**
 * Backend configuration: option code → label maps, Sheet column order and email copy.
 * The site sends stable codes (see website/src/lib/submit.ts); the Sheet stores labels
 * so organizers can read and filter it without a legend.
 *
 * Runtime settings live in Script Properties (File > Project properties, or the Apps Script
 * editor's Project Settings page), never in this file:
 *   PROD_SHEET_ID        Spreadsheet ID of the production Sheet
 *   TEST_SHEET_ID        Spreadsheet ID of the test Sheet (used by preview deploys)
 *   APPLICATIONS_OPEN    ISO date-time, e.g. 2026-11-09T09:00:00-06:00
 *   APPLICATIONS_CLOSE   ISO date-time, e.g. 2026-12-04T23:59:00-06:00
 *   SEND_EMAIL           "true" to send confirmation emails, anything else to skip
 *   FROM_NAME            Sender name shown in the confirmation email
 *   REPLY_TO             Reply-to address for the confirmation email
 *   DECISIONS_BY         Human-readable date shown in the email, e.g. "Dec 11, 2026"
 */

var LABELS = {
  program: {
    fulltime_mba: "Full-time MBA",
    temba: "TEMBA",
    parttime_other: "Part-time MBA or other",
  },
  availability: { yes: "Yes", maybe: "Maybe", no: "No" },
  applyingAs: { team: "With a team", solo: "Solo" },
  aiSubscription: {
    none: "None",
    free: "Free tiers only",
    school: "School enterprise plan",
    paid: "Paid individual plan",
    power: "Power-user plan",
  },
  buildExperience: {
    none: "None",
    some: "Some",
    shipped: "I've shipped something",
  },
};

/** Column order from the PRD. Index + 1 = column number. */
var COLUMNS = [
  "Timestamp",
  "Submission ID",
  "Name",
  "EID",
  "Email",
  "Program",
  "Feb 5 availability",
  "Week availability",
  "Applying as",
  "Team name",
  "Teammate emails",
  "AI subscription",
  "Build experience",
  "Why",
  "Resume link",
  "Consent",
  "Team rows found",
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
    "Decisions go out by email by {decisionsBy}. Until then, no action needed.\n\n" +
    "Questions? Reply to this email.\n\n" +
    "The McCombs AI Hackathon organizing team",
  teamLine:
    "Team: {teamName}. Remind your teammates to apply with the same team name; every seat needs its own application.\n\n",
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
