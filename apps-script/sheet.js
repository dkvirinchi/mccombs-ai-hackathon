/**
 * Sheet access: open the right spreadsheet, create headers, upsert a row by EID,
 * and keep the computed columns as live formulas so organizers can tweak them.
 */

function openSheet(env) {
  var id = env === "prod" ? prop("PROD_SHEET_ID", "") : prop("TEST_SHEET_ID", "");
  if (!id) throw new Error("Script property " + (env === "prod" ? "PROD_SHEET_ID" : "TEST_SHEET_ID") + " is not set.");
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) writeHeaders(sheet);
  return sheet;
}

function writeHeaders(sheet) {
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, COLUMNS.length).setBackground("#D6D2C4");
  sheet.setColumnWidth(col("Why"), 360);
  sheet.setColumnWidth(col("Teammate emails"), 260);
}

/** Live formulas for the computed columns on a given row. */
function computedFormulas(row) {
  var team = colLetter("Team name");
  var cap = colLetter("Captain");
  var prog = colLetter("Program");
  var boot = colLetter("Boot camp");
  var as = colLetter("Applying as");
  var L = LABELS;
  var sameTeam = "--(LOWER(TRIM($" + team + "$2:$" + team + "))=LOWER(TRIM(" + team + row + ")))";

  var teamRows = "=IF(" + team + row + '="","",SUMPRODUCT(' + sameTeam + "))";
  var captains = "=IF(" + team + row + '="","",SUMPRODUCT(' + sameTeam + ",--($" + cap + "$2:$" + cap + '="' + L.captain.yes + '")))';

  // Priority rules from the PRD. Organizers can edit this formula in the Sheet.
  var tier =
    "=IFS(" +
    boot + row + '="' + L.availability.no + '","0 Excluded (boot camp No)",' +
    "AND(" + prog + row + '="' + L.program.fulltime_mba + '",' + as + row + '="' + L.applyingAs.team + '",' + boot + row + '="' + L.availability.yes + '"),"1 Full-time team, Yes",' +
    "AND(" + as + row + '="' + L.applyingAs.team + '",' + boot + row + '="' + L.availability.yes + '"),"2 Other team, Yes",' +
    "AND(" + as + row + '="' + L.applyingAs.solo + '",' + boot + row + '="' + L.availability.yes + '"),"3 Solo, Yes",' +
    boot + row + '="' + L.availability.maybe + '","4 Not sure",' +
    'TRUE,"")';

  return { teamRows: teamRows, captains: captains, tier: tier };
}

function findRowByEid(sheet, eid) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, col("EID"), last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === eid) return i + 2;
  }
  return 0;
}

function newSubmissionId() {
  return "HK-" + Utilities.getUuid().replace(/-/g, "").slice(0, 8).toUpperCase();
}

function formatStamp(date) {
  return Utilities.formatDate(date, "America/Chicago", "yyyy-MM-dd HH:mm");
}

/**
 * Save an uploaded resume to the RESUME_FOLDER_ID Drive folder and return its link.
 * Test-link submissions get a "[TEST]" prefix so they are easy to clean up.
 * The folder inherits its sharing, so keep it shared with organizers only.
 */
function saveResume(d, env) {
  if (!d.resume) return "";
  var folderId = prop("RESUME_FOLDER_ID", "");
  if (!folderId) return "Resume received, but RESUME_FOLDER_ID is not set";
  var name = (env === "prod" ? "" : "[TEST] ") + d.lastName + ", " + d.firstName + " (" + d.eid + ").pdf";
  var blob = Utilities.newBlob(Utilities.base64Decode(d.resume.base64), "application/pdf", name);
  var file = DriveApp.getFolderById(folderId).createFile(blob);
  return file.getUrl();
}

/**
 * Append or overwrite the applicant's row. Call inside a LockService lock.
 * Resubmissions keep the first Timestamp, Submission ID and (if no new file) the earlier resume link,
 * and bump the Duplicate flag.
 * @returns {{id: string, row: number, resubmission: boolean}}
 */
function upsertApplication(sheet, d, now) {
  var existingRow = findRowByEid(sheet, d.eid);
  var resubmission = existingRow > 0;
  var row = resubmission ? existingRow : sheet.getLastRow() + 1;

  var id, timestamp, duplicateFlag, resumeLink = d.resumeLink, resumeShare = d.resumeShare;
  if (resubmission) {
    id = String(sheet.getRange(row, col("Submission ID")).getValue()) || newSubmissionId();
    timestamp = sheet.getRange(row, col("Timestamp")).getValue() || now;
    var prev = String(sheet.getRange(row, col("Duplicate flag")).getValue());
    var m = prev.match(/Resubmitted (\d+)/);
    var count = (m ? parseInt(m[1], 10) : 0) + 1;
    duplicateFlag = "Resubmitted " + count + (count === 1 ? " time" : " times") + ", last " + formatStamp(now);
    if (!resumeLink) {
      resumeLink = String(sheet.getRange(row, col("Resume link")).getValue());
      resumeShare = String(sheet.getRange(row, col("OK to share resume")).getValue()) === "Yes";
    }
  } else {
    id = newSubmissionId();
    timestamp = now;
    duplicateFlag = "";
  }

  var f = computedFormulas(row);
  var areas = d.useCases.map(function (a) { return LABELS.businessAreas[a]; });
  var values = [
    timestamp,
    id,
    d.firstName,
    d.lastName,
    d.eid,
    d.email,
    LABELS.program[d.program],
    LABELS.applyingAs[d.applyingAs],
    d.teamName,
    d.teammateEmails.join(", "),
    d.captain ? LABELS.captain[d.captain] : "",
    d.captainCommit ? "Yes" : "",
    LABELS.availability[d.bootCamp],
    LABELS.availability[d.buildWindow],
    LABELS.availability[d.finalPresentation],
    areas[0] || "",
    areas[1] || "",
    areas[2] || "",
    areas.slice(3).join(", "),
    LABELS.aiSubscription[d.aiSubscription],
    LABELS.buildExperience[d.buildExperience],
    Number(d.aiComfort),
    resumeLink,
    resumeLink ? (resumeShare ? "Yes" : "No") : "",
    f.teamRows,
    f.captains,
    f.tier,
    duplicateFlag,
  ];

  // Decision and Team assignment are organizer-owned; never overwrite them.
  sheet.getRange(row, 1, 1, values.length).setValues([values]);
  sheet.getRange(row, col("Timestamp")).setNumberFormat("yyyy-mm-dd hh:mm");
  return { id: id, row: row, resubmission: resubmission };
}
