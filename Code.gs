const SHEET_NAME = 'Sheet1'; 
const ADMIN_ID = 'Rahul Bas'; 
const ADMIN_PASS = '123';     

function doPost(e) {
  let result = {};
  try {
    let data = JSON.parse(e.postData.contents);
    let action = data.action;
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (action === "book") {
      let timestamp = new Date().toLocaleString(); 
      sheet.appendRow([data.name, data.phone, data.address, timestamp, "Pending"]);
      result = { success: true, message: "Your appointment has been successfully booked!" };
    } 
    else if (action === "login") {
      if (data.id === ADMIN_ID && data.password === ADMIN_PASS) {
        let sheetData = sheet.getDataRange().getValues();
        result = { success: true, data: sheetData };
      } else {
        result = { success: false, message: "Invalid Admin ID or Password!" };
      }
    } 
    else if (action === "update") {
      sheet.getRange(data.rowIndex + 1, 5).setValue(data.status);
      let sheetData = sheet.getDataRange().getValues();
      result = { success: true, data: sheetData, message: "Status updated!" };
    }
  } catch (error) {
    result = { success: false, message: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput("API is running smoothly.");
}
