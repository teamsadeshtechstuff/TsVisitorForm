/**
 * Team Sandesh | Visitor Registration — Google Sheets backend
 *
 * If this script was opened from the sheet (Extensions → Apps Script),
 * leave SPREADSHEET_ID empty. If it is a standalone script, paste the
 * sheet ID (the long code in the sheet's URL between /d/ and /edit).
 */
const SPREADSHEET_ID = "";
const SHEET_NAME = "Visitor Responses";

const HEADERS = [
  "Timestamp",
  "Full Name",
  "Phone Number",
  "Temporary Address",
  "Permanent Address",
  "Interested Course",
  "Where Did You Hear About Us?",
  "Purpose of Visit",
  "When Are You Planning to Join?",
  "May Team Sandesh contact you about your course inquiry?",
];

function getSheet_() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

/** Run once from the editor: creates/updates the header row. */
function setupSheet() {
  const sheet = getSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setValues([HEADERS])
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#134294")
    .setWrap(true)
    .setVerticalAlignment("middle");
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 42);
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidths(2, HEADERS.length - 1, 200);
  sheet.getRange("C:C").setNumberFormat("@"); // keep phone numbers as text
}

/** Receives form submissions (sent as URL-encoded form data). */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = (e && e.parameter) || {};

    if (!/^9[0-9]{9}$/.test(String(data["Phone Number"] || ""))) {
      throw new Error("Invalid phone number");
    }

    const sheet = getSheet_();
    if (sheet.getLastRow() === 0) setupSheet();

    const row = HEADERS.map((h) =>
      h === "Timestamp" ? new Date() : String(data[h] || "").substring(0, 500)
    );
    sheet.appendRow(row);

    return json_({ result: "success" });
  } catch (err) {
    console.error(err);
    return json_({ result: "error", error: err.message });
  } finally {
    lock.releaseLock();
  }
}

/** Open the Web App URL in a browser to check the deployment works.
 *  Add ?Full%20Name=Test&Phone%20Number=9800000000 to insert a test row. */
function doGet(e) {
  if (e && e.parameter && e.parameter["Phone Number"]) {
    return doPost(e);
  }
  return json_({ result: "ok", version: "v2", message: "Team Sandesh visitor form endpoint is running." });
}

/** Run from the editor to test writing a row without the website. */
function testInsert() {
  doPost({ parameter: {
    "Full Name": "Test Visitor",
    "Phone Number": "9800000000",
    "Temporary Address": "Kathmandu",
    "Permanent Address": "Jhapa",
    "Interested Course": "NASU / Kharidar",
    "Where Did You Hear About Us?": "Facebook",
    "May Team Sandesh contact you about your course inquiry?": "Yes",
  }});
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
