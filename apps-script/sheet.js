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
  var J = colLetter("Team name");
  var F = colLetter("Program");
  var G = colLetter("Feb 5 availability");
  var I = colLetter("Applying as");
  var L = LABELS;

  var teamRows =
    "=IF(" + J + row + '="","",SUMPRODUCT(--(LOWER(TRIM($' + J + "$2:$" + J + "))=LOWER(TRIM(" + J + row + ")))))";

  var tier =
    "=IFS(" +
    G + row + '="' + L.availability.no + '","0 Excluded (Feb 5 No)",' +
    "AND(" + F + row + '="' + L.program.fulltime_mba + '",' + I + row + '="' + L.applyingAs.team + '",' + G + row + '="' + L.availability.yes + '"),"1 Full-time team, Yes",' +
    "AND(" + I + row + '="' + L.applyingAs.team + '",' + G + row + '="' + L.availability.yes + '"),"2 Other team, Yes",' +
    "AND(" + I + row + '="' + L.applyingAs.solo + '",' + G + row + '="' + L.availability.yes + '"),"3 Solo, Yes",' +
    G + row + '="' + L.availability.maybe + '","4 Maybe",' +
    'TRUE,"")';

  return { teamRows: teamRows, tier: tier };
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
 * Append or overwrite the applicant's row. Call inside a LockService lock.
 * Resubmissions keep the first Timestamp and Submission ID and bump the Duplicate flag.
 * @returns {{id: string, row: number, resubmission: boolean}}
 */
function upsertApplication(sheet, d, now) {
  var existingRow = findRowByEid(sheet, d.eid);
  var resubmission = existingRow > 0;
  var row = resubmission ? existingRow : sheet.getLastRow() + 1;

  var id, timestamp, duplicateFlag;
  if (resubmission) {
    id = String(sheet.getRange(row, col("Submission ID")).getValue()) || newSubmissionId();
    timestamp = sheet.getRange(row, col("Timestamp")).getValue() || now;
    var prev = String(sheet.getRange(row, col("Duplicate flag")).getValue());
    var m = prev.match(/Resubmitted (\d+)/);
    var count = (m ? parseInt(m[1], 10) : 0) + 1;
    duplicateFlag = "Resubmitted " + count + (count === 1 ? " time" : " times") + ", last " + formatStamp(now);
  } else {
    id = newSubmissionId();
    timestamp = now;
    duplicateFlag = "";
  }

  var f = computedFormulas(row);
  var values = [
    timestamp,
    id,
    d.name,
    d.eid,
    d.email,
    LABELS.program[d.program],
    LABELS.availability[d.feb5],
    LABELS.availability[d.week],
    LABELS.applyingAs[d.applyingAs],
    d.teamName,
    d.teammateEmails.join(", "),
    LABELS.aiSubscription[d.aiSubscription],
    LABELS.buildExperience[d.buildExperience],
    d.why,
    d.resumeLink,
    d.consent ? "Yes" : "No",
    f.teamRows,
    f.tier,
    duplicateFlag,
  ];

  // Decision and Team assignment are organizer-owned; never overwrite them.
  sheet.getRange(row, 1, 1, values.length).setValues([values]);
  sheet.getRange(row, col("Timestamp")).setNumberFormat("yyyy-mm-dd hh:mm");
  return { id: id, row: row, resubmission: resubmission };
}
