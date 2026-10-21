/** Confirmation email (F-12), sent from the account that deployed the script. */

function fill(template, vars) {
  return Object.keys(vars).reduce(function (s, k) {
    return s.split("{" + k + "}").join(vars[k]);
  }, template);
}

function sendConfirmation(d, result) {
  if (prop("SEND_EMAIL", "false") !== "true") return false;
  var vars = {
    name: d.name.split(" ")[0],
    id: result.id,
    teamName: d.teamName,
    decisionsBy: prop("DECISIONS_BY", "Dec 11, 2026"),
    teamLine: d.applyingAs === "team" ? fill(EMAIL.teamLine, { teamName: d.teamName }) : "",
  };
  var body = fill(EMAIL.body, vars);
  if (result.resubmission) body = body.replace("Your application is in.\n\n", "Your application is in.\n\n" + EMAIL.resubmitLine);

  try {
    MailApp.sendEmail({
      to: d.email,
      subject: EMAIL.subject,
      body: body,
      name: prop("FROM_NAME", "McCombs AI Hackathon"),
      replyTo: prop("REPLY_TO", ""),
      noReply: false,
    });
    return true;
  } catch (err) {
    // Email failure must not fail the submission; the row is already saved.
    console.error("Confirmation email failed for " + d.email + ": " + err);
    return false;
  }
}
