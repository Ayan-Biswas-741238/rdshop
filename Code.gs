const SHEET_NAME = 'Sheet1'; 
const ADMIN_ID = 'Rahul Bas'; // Admin ID
const ADMIN_PASS = '123';     // Admin Password

function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Appointment Booking System')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Save Appointment
function bookAppointment(name, phone, address) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const timestamp = new Date(); 
  
  sheet.appendRow([name, phone, address, timestamp, "Pending"]);
  return "Your appointment has been successfully booked!";
}

// Fetch Appointments for Admin
function getAppointments(id, password) {
  if(id !== ADMIN_ID || password !== ADMIN_PASS) {
    return { error: true, message: "Invalid Admin ID or Password!" };
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  return { error: false, data: data };
}

// Update Status (Approve/Reject)
function updateStatus(rowIndex, newStatus) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.getRange(rowIndex + 1, 5).setValue(newStatus);
  return "Status updated successfully!";
}
