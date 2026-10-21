/**
 * Server-side validation. Mirrors website/src/lib/schema.ts exactly.
 * If you change a rule here, change it there too.
 */

var EID_RE = /^[a-z]{2,8}[0-9]{1,6}$/i;
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var UT_DOMAIN_RE = /utexas\.edu$/i;

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

  d.name = str(body.name);
  if (d.name.length < 2 || d.name.length > 80) fields.name = "Please enter your full name (2 to 80 characters).";

  d.eid = str(body.eid).toLowerCase();
  if (!EID_RE.test(d.eid)) fields.eid = "An EID is letters followed by numbers, like abc123.";

  d.email = str(body.email).toLowerCase();
  if (!EMAIL_RE.test(d.email)) fields.email = "That doesn't look like a valid email.";
  else if (!UT_DOMAIN_RE.test(d.email)) fields.email = "Please use an email that ends in utexas.edu.";

  d.program = oneOf(body.program, LABELS.program);
  if (!d.program) fields.program = "This one's required.";

  d.feb5 = oneOf(body.feb5, LABELS.availability);
  if (!d.feb5) fields.feb5 = "This one's required.";

  d.week = oneOf(body.week, LABELS.availability);
  if (!d.week) fields.week = "This one's required.";

  d.applyingAs = oneOf(body.applyingAs, LABELS.applyingAs);
  if (!d.applyingAs) fields.applyingAs = "This one's required.";

  d.teamName = "";
  d.teammateEmails = [];
  if (d.applyingAs === "team") {
    d.teamName = str(body.teamName);
    if (d.teamName.length < 2 || d.teamName.length > 40) fields.teamName = "Team names are 2 to 40 characters.";

    var raw = Array.isArray(body.teammateEmails) ? body.teammateEmails : [];
    var emails = raw.map(function (e) { return str(e).toLowerCase(); }).filter(function (e) { return e.length > 0; });
    if (emails.length < 1 || emails.length > 3) fields.teammateEmails = "Add between 1 and 3 teammate emails.";
    else if (emails.some(function (e) { return !EMAIL_RE.test(e); })) fields.teammateEmails = "That doesn't look like a valid email.";
    else if (emails.some(function (e) { return !UT_DOMAIN_RE.test(e); })) fields.teammateEmails = "Please use an email that ends in utexas.edu.";
    else if (emails.indexOf(d.email) >= 0) fields.teammateEmails = "That's your own email. Add your teammates' emails instead.";
    else if (new Set(emails).size !== emails.length) fields.teammateEmails = "You've listed the same email twice.";
    d.teammateEmails = emails;
  }

  d.aiSubscription = oneOf(body.aiSubscription, LABELS.aiSubscription);
  if (!d.aiSubscription) fields.aiSubscription = "This one's required.";

  d.buildExperience = oneOf(body.buildExperience, LABELS.buildExperience);
  if (!d.buildExperience) fields.buildExperience = "This one's required.";

  d.why = str(body.why);
  if (d.why.length < 1) fields.why = "This one's required.";
  else if (d.why.length > 300) fields.why = "Keep it to 300 characters.";

  d.consent = body.consent === true;
  if (!d.consent) fields.consent = "We need your consent to process the application.";

  // Resume upload is behind a flag and not accepted in v1. Any payload is ignored.
  d.resumeLink = "";

  if (Object.keys(fields).length) return { ok: false, fields: fields };
  return { ok: true, data: d };
}
