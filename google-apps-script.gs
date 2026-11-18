/**
 * Team Sandesh | Visitor Registration — Google Sheets backend
 *
 * Paste this into Extensions → Apps Script of your Google Sheet,
 * run setupSheet() once, then Deploy → New deployment → Web app.
 */

const SHEET_NAME = "Visitor Responses";

const HEADERS = [
  "Timestamp",
  "Full Name",
  "Phone Number",
  "Address (District / Municipality)",
  "Interested Course",
  "Where Did You Hear About Us?",
  "Purpose of Visit",
  "Preferred Class Mode",
  "When Are You Planning to Join?",
  "May Team Sandesh contact you about your course inquiry?",
];

/** Run once from the editor to create and format the sheet. */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

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

/** Receives form submissions from the static site. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);

    // Server-side checks (mirror the front-end rules)
    const required = [
      "Full Name",
      "Phone Number",
      "Address (District / Municipality)",
      "Interested Course",
      "Where Did You Hear About Us?",
      "May Team Sandesh contact you about your course inquiry?",
    ];
    for (const key of required) {
      if (!String(data[key] || "").trim()) throw new Error("Missing: " + key);
    }
    if (!/^9[0-9]{9}$/.test(String(data["Phone Number"]))) {
      throw new Error("Invalid phone number");
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) { setupSheet(); sheet = ss.getSheetByName(SHEET_NAME); }

    const row = HEADERS.map((h) =>
      h === "Timestamp" ? new Date() : String(data[h] || "").substring(0, 500)
    );
    sheet.appendRow(row);

    return json({ result: "success" });
  } catch (err) {
    return json({ result: "error", error: err.message });
  } finally {
    lock.releaseLock();
  }
}

/** Simple health check: open the Web App URL in a browser. */
function doGet() {
  return json({ result: "ok", message: "Team Sandesh visitor form endpoint is running." });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
