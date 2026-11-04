/**
 * Server-side validation. Mirrors website/src/lib/schema.ts exactly.
 * If you change a rule here, change it there too.
 */

var EID_RE = /^[a-z]{2,8}[0-9]{1,6}$/i;
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MIN_USE_CASES = 3; // applicants may rank more, up to all of them
// A 5 MB PDF is about 6.7 million base64 characters.
var RESUME_MAX_BASE64 = Math.ceil((5 * 1024 * 1024 * 4) / 3) + 4;

var REQUIRED = "This one's required.";

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}

function oneOf(v, map) {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(map, v) ? v : "";
}

/**
 * @param {Object} body Parsed JSON from the form.
 * @returns {{ok: true, data: Object} | {ok: false, fields: Object<string,string>}}
 */
function validate(body) {
  var fields = {};
  var d = {};

  d.firstName = str(body.firstName);
  if (d.firstName.length < 1 || d.firstName.length > 40) fields.firstName = "Please enter a name between 1 and 40 characters.";
  d.lastName = str(body.lastName);
  if (d.lastName.length < 1 || d.lastName.length > 40) fields.lastName = "Please enter a name between 1 and 40 characters.";

  d.eid = str(body.eid).toLowerCase();
  if (!EID_RE.test(d.eid)) fields.eid = "An EID is letters followed by numbers, like abc123.";

  d.email = str(body.email).toLowerCase();
  if (!EMAIL_RE.test(d.email)) fields.email = "That doesn't look like a valid email.";

  d.program = oneOf(body.program, LABELS.program);
  if (!d.program) fields.program = REQUIRED;

  d.applyingAs = oneOf(body.applyingAs, LABELS.applyingAs);
  if (!d.applyingAs) fields.applyingAs = REQUIRED;

  d.teamName = "";
  d.teammateEmails = [];
  d.captain = "";
  d.captainCommit = false;
  if (d.applyingAs === "team") {
    d.teamName = str(body.teamName);
    if (d.teamName.length < 2 || d.teamName.length > 40) fields.teamName = "Team names are 2 to 40 characters.";

    var raw = Array.isArray(body.teammateEmails) ? body.teammateEmails : [];
    var emails = raw.map(function (e) { return str(e).toLowerCase(); }).filter(function (e) { return e.length > 0; });
    if (emails.length < 1 || emails.length > 3) fields.teammateEmails = "Add between 1 and 3 teammate emails.";
    else if (emails.some(function (e) { return !EMAIL_RE.test(e); })) fields.teammateEmails = "That doesn't look like a valid email.";
    else if (emails.indexOf(d.email) >= 0) fields.teammateEmails = "That's your own email. Add your teammates' emails instead.";
    else if (new Set(emails).size !== emails.length) fields.teammateEmails = "You've listed the same email twice.";
    d.teammateEmails = emails;

    d.captain = oneOf(body.captain, LABELS.captain);
    if (!d.captain) fields.captain = REQUIRED;
    d.captainCommit = d.captain === "yes" && body.captainCommit === true;
    if (d.captain === "yes" && !d.captainCommit) fields.captainCommit = "Check the box to confirm, or go back and choose No.";
  }

  ["bootCamp", "buildWindow", "finalPresentation"].forEach(function (k) {
    d[k] = oneOf(body[k], LABELS.availability);
    if (!d[k]) fields[k] = REQUIRED;
  });

  var areas = Array.isArray(body.useCases) ? body.useCases : [];
  d.useCases = areas.filter(function (a) { return oneOf(a, LABELS.businessAreas); });
  if (d.useCases.length < MIN_USE_CASES || d.useCases.length !== areas.length || new Set(d.useCases).size !== d.useCases.length) {
    fields.useCases = "Pick at least 3 business areas.";
  }

  d.aiSubscription = oneOf(body.aiSubscription, LABELS.aiSubscription);
  if (!d.aiSubscription) fields.aiSubscription = REQUIRED;

  d.buildExperience = oneOf(body.buildExperience, LABELS.buildExperience);
  if (!d.buildExperience) fields.buildExperience = REQUIRED;

  d.aiComfort = oneOf(body.aiComfort, LABELS.aiComfort);
  if (!d.aiComfort) fields.aiComfort = REQUIRED;

  // Resume is optional. Anything that is not a PDF under 5 MB is rejected with a field error.
  d.resume = null;
  var r = body.resume;
  if (r && typeof r === "object") {
    var b64 = typeof r.base64 === "string" ? r.base64 : "";
    // "JVBER" is base64 for "%PDF-", the header every PDF starts with. The mime type comes from the
    // browser and is easy to fake by renaming a file, so check the bytes.
    if (r.mime !== "application/pdf" || b64.indexOf("JVBER") !== 0) fields.resume = "Please upload a PDF.";
    else if (b64.length > RESUME_MAX_BASE64) fields.resume = "That file is over 5 MB. Please upload a smaller PDF.";
    else d.resume = { name: str(r.name).slice(0, 120) || "resume.pdf", base64: b64 };
  }
  d.resumeShare = !!d.resume && body.resumeShare === true;
  d.resumeLink = "";


  if (Object.keys(fields).length) return { ok: false, fields: fields };
  return { ok: true, data: d };
}
