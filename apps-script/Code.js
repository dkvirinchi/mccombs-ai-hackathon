/**
 * McCombs AI Hackathon application backend.
 *
 * Contract (keep in sync with website/src/lib/submit.ts):
 *   POST  text/plain JSON body  -> { ok: true, id, resubmission }
 *                               |  { ok: false, error: "validation", fields: { field: message } }
 *                               |  { ok: false, error: "closed" }
 *                               |  { ok: false, error: "server", message }
 *   GET                         -> { ok: true, service, open }   (health check)
 *
 * Always responds HTTP 200: Apps Script web apps can't set status codes reliably,
 * so the client reads `ok` instead.
 */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function isOpen(now) {
  var open = prop("APPLICATIONS_OPEN", "");
  var close = prop("APPLICATIONS_CLOSE", "");
  if (open && now < new Date(open)) return false;
  if (close && now > new Date(close)) return false;
  return true;
}

function doGet() {
  return json({ ok: true, service: "mccombs-ai-hackathon", open: isOpen(new Date()) });
}

function doPost(e) {
  var now = new Date();
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Honeypot: bots fill hidden fields. Pretend success so they don't retry, write nothing.
    if (body.hp) return json({ ok: true, id: "HK-00000000", resubmission: false });

    // The open/close window only applies to real applications. Test-link submissions (env "preview")
    // go to the TEST sheet and are accepted any time, so organizers can review before launch.
    if (body.env === "prod" && !isOpen(now)) return json({ ok: false, error: "closed" });

    var v = validate(body);
    if (!v.ok) return json({ ok: false, error: "validation", fields: v.fields });

    var env = body.env === "prod" ? "prod" : "preview";
    var sheet = openSheet(env);
    v.data.resumeLink = saveResume(v.data, env); // outside the lock: Drive uploads can be slow
    v.data.resume = null; // don't keep the file contents around once saved

    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    var result;
    try {
      result = upsertApplication(sheet, v.data, now);
    } finally {
      lock.releaseLock();
    }

    sendConfirmation(v.data, result);
    return json({ ok: true, id: result.id, resubmission: result.resubmission });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "server", message: String(err && err.message ? err.message : err) });
  }
}

/**
 * Run once from the editor after setting Script Properties: creates the Applications
 * sheet with headers in both the production and test spreadsheets.
 */
function setup() {
  ["prod", "preview"].forEach(function (env) {
    try {
      var sheet = openSheet(env);
      console.log(env + ": " + sheet.getParent().getName() + " ready, " + Math.max(0, sheet.getLastRow() - 1) + " rows");
    } catch (err) {
      console.warn(env + ": " + err.message);
    }
  });
}

/** Dry run from the editor: writes one fake application to the TEST sheet. */
function testSubmit() {
  var fake = {
    v: 2,
    env: "preview",
    firstName: "Test",
    lastName: "Applicant",
    eid: "tst123",
    email: "test.applicant@my.utexas.edu",
    program: "fulltime_mba",
    applyingAs: "team",
    teamName: "Test Team",
    teammateEmails: ["teammate@utexas.edu"],
    captain: "yes",
    captainCommit: true,
    bootCamp: "yes",
    buildWindow: "yes",
    finalPresentation: "maybe",
    useCases: ["marketing", "finance", "strategy"],
    aiSubscription: "free",
    buildExperience: "tried",
    aiComfort: "3",
    resumeShare: false,
    consent: true,
    resume: null,
    hp: "",
  };
  var out = doPost({ postData: { contents: JSON.stringify(fake) } });
  console.log(out.getContent());
}
