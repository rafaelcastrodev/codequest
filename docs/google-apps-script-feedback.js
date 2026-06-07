/**
 * Google Apps Script — CodeQuest Feedback Receiver
 *
 * Setup:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Add these headers in row 1: Timestamp | Version | Route | Type | Message
 * 3. Go to Extensions > Apps Script
 * 4. Paste this entire code and save
 * 5. Click Deploy > New deployment
 * 6. Select type: "Web app"
 * 7. Set "Execute as": your account
 * 8. Set "Who has access": "Anyone"
 * 9. Click Deploy and copy the URL
 * 10. Add the URL to your .env file as VITE_FEEDBACK_URL=<url>
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date().toISOString(),
    data.version || '',
    data.route || '',
    data.type || '',
    data.message || '',
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok' })
  ).setMimeType(ContentService.MimeType.JSON);
}
