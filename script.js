const API_URL = "https://script.google.com/macros/s/AKfycbyDB7Rlmk5LvTtI35DKP4K6NGGHAP3wEO74B2uVj--RwwumMEICy5DnU9iG8ajEm1kL/exec";

let currentAdminId = "";
let currentAdminPass = "";

function toggleMenu() { document.getElementById('navLinks').classList.toggle('show'); }

function showPage(pageId) {
  document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active-page'));
  document.getElementById(pageId).classList.add('active-page');
  const navLinks = document.getElementById('navLinks');
  if (navLinks.classList.contains('show')) navLinks.classList.remove('show');
}

// Page Reset / Refresh Handler
function refreshPage(pageId) {
  if (pageId === 'appointmentPage') {
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
    document.getElementById('address').value = '';
    document.getElementById('service').selectedIndex = 0;
    document.getElementById('bookingResult').style.display = 'none';
    document.getElementById('bookingResult').innerHTML = '';
  } else if (pageId === 'careerPage') {
    document.getElementById('jobName').value = '';
    document.getElementById('jobPhone').value = '';
    document.getElementById('jobEmail').value = '';
    document.getElementById('jobPosition').selectedIndex = 0;
    document.getElementById('jobExperience').value = '';
    document.getElementById('jobResult').style.display = 'none';
    document.getElementById('jobResult').innerHTML = '';
  } else if (pageId === 'statusPage') {
    document.getElementById('refIdInput').value = '';
    document.getElementById('statusResultCard').style.display = 'none';
    document.getElementById('statusResultCard').innerHTML = '';
  } else if (pageId === 'contactPage') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function setButtonState(btnId, isLoading, defaultText) {
  const btn = document.getElementById(btnId);
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> Wait...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = defaultText;
  }
}

function callAPI(payload, successCallback, errorCallback) {
  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  })
  .then(res => res.json())
  .then(data => successCallback(data))
  .catch(err => {
    console.error("API Error:", err);
    if(errorCallback) errorCallback();
    alert("Connection error! Please check your internet connection.");
  });
}

// ================= 1. APPOINTMENT BOOKING =================
function submitBooking() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const service = document.getElementById('service').value;

  if(!name || !phone || !email || !address){
    alert("Please fill in all details."); return;
  }

  const resultBox = document.getElementById('bookingResult');
  resultBox.style.display = 'none';
  setButtonState('bookBtn', true, 'Book Appointment');
  
  callAPI({ action: 'book', name, phone, address, email, service }, function(res) {
    setButtonState('bookBtn', false, 'Book Appointment');
    if(res.success) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <h3 style="color:#27ae60;">🎉 ${res.message}</h3>
        <p style="margin-top:10px;">Your Reference ID has been sent to your email.</p>
        <div class="ref-badge" style="color:#27ae60;">${res.refId}</div>
      `;
      document.getElementById('name').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('email').value = '';
      document.getElementById('address').value = '';
    }
  }, function() { setButtonState('bookBtn', false, 'Book Appointment'); });
}

// ================= 2. CAREER JOB APPLICATION =================
function submitJobApplication() {
  const name = document.getElementById('jobName').value.trim();
  const phone = document.getElementById('jobPhone').value.trim();
  const email = document.getElementById('jobEmail').value.trim();
  const position = document.getElementById('jobPosition').value;
  const experience = document.getElementById('jobExperience').value.trim();

  if(!name || !phone || !email || !experience){
    alert("Please fill in all details."); return;
  }

  const resultBox = document.getElementById('jobResult');
  resultBox.style.display = 'none';
  setButtonState('jobBtn', true, 'Submit Application');
  
  callAPI({ action: 'applyJob', name, phone, email, position, experience }, function(res) {
    setButtonState('jobBtn', false, 'Submit Application');
    if(res.success) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <h3 style="color:#2980b9;">🎉 ${res.message}</h3>
        <p style="margin-top:10px;">Your Job Application ID has been sent to your email.</p>
        <div class="ref-badge" style="color:#2980b9;">${res.appId}</div>
      `;
      document.getElementById('jobName').value = '';
      document.getElementById('jobPhone').value = '';
      document.getElementById('jobEmail').value = '';
      document.getElementById('jobExperience').value = '';
    }
  }, function() { setButtonState('jobBtn', false, 'Submit Application'); });
}

// Date Format Helpers
function formatDate(dateString) {
  if (!dateString || dateString === "Not Scheduled Yet") return "Not Scheduled Yet";
  let d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString; 
  let day = String(d.getDate()).padStart(2, '0');
  let month = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
function formatForInput(dateStr) {
  if(!dateStr || dateStr === "Not Scheduled Yet") return "";
  let parts = dateStr.split("/");
  if(parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return "";
}

// ================= 3. CHECK STATUS =================
function checkStatus() {
  const refId = document.getElementById('refIdInput').value.trim();
  if(!refId) { alert("Please enter Reference ID!"); return; }

  const statusCard = document.getElementById('statusResultCard');
  statusCard.style.display = 'none';
  setButtonState('statusBtn', true, 'Check Status');

  callAPI({ action: 'checkStatus', refId: refId }, function(res) {
    setButtonState('statusBtn', false, 'Check Status');
    statusCard.style.display = 'block';
    if(res.success) {
      const item = res.data;
      let statusBadge = item.status === "Approved" ? "status-approved" : (item.status === "Rejected" ? "status-rejected" : "status-pending");
      let displayDate = formatDate(item.visitingDate);

      statusCard.innerHTML = `
        <h3 style="color:#2c3e50; margin-bottom:15px; text-align:center;">Details Found</h3>
        <div class="status-row"><strong>Ref ID:</strong> <span>${item.refId}</span></div>
        <div class="status-row"><strong>Name:</strong> <span>${item.name}</span></div>
        <div class="status-row"><strong>Service:</strong> <span>${item.service}</span></div>
        <div class="status-row"><strong>Status:</strong> <span class="${statusBadge}">${item.status}</span></div>
        <div class="status-row"><strong>Visiting Date:</strong> <span style="font-weight:bold; color:#2980b9;">${displayDate}</span></div>
      `;
    } else {
      statusCard.innerHTML = `<p style="color:#e74c3c; text-align:center; font-weight:bold;">❌ ${res.message}</p>`;
    }
  }, function() { setButtonState('statusBtn', false, 'Check Status'); });
}

// ================= 4. ADMIN PANEL =================
function loginAdmin() {
  const id = document.getElementById('adminId').value.trim();
  const pass = document.getElementById('adminPassword').value;
  const msgBox = document.getElementById('adminMessage');
  
  msgBox.innerText = "";
  setButtonState('loginBtn', true, 'Login');
  
  callAPI({ action: 'login', id: id, password: pass }, function(res) {
    setButtonState('loginBtn', false, 'Login');
    if(res.success) {
      currentAdminId = id;
      currentAdminPass = pass;
      msgBox.innerText = "";
      document.getElementById('adminLoginSection').style.display = 'none';
      document.getElementById('adminDashboard').style.display = 'block';
      renderAdminTables(res.appointmentData, res.jobData);
    } else {
      msgBox.className = "msg-box error-text"; msgBox.innerText = res.message;
    }
  }, function() { setButtonState('loginBtn', false, 'Login'); });
}

// Real-Time Admin Data Refresh
function refreshAdminData() {
  if (!currentAdminId || !currentAdminPass) {
    document.getElementById('adminId').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminMessage').innerText = '';
    return;
  }
  
  setButtonState('adminRefreshBtn', true, '🔄 Refreshing...');
  callAPI({ action: 'login', id: currentAdminId, password: currentAdminPass }, function(res) {
    setButtonState('adminRefreshBtn', false, '🔄 Refresh Data');
    if(res.success) {
      renderAdminTables(res.appointmentData, res.jobData);
    }
  }, function() { setButtonState('adminRefreshBtn', false, '🔄 Refresh Data'); });
}

// Switch Tabs
function switchAdminTab(tabName) {
  document.getElementById('tabAppBtn').classList.remove('active-tab');
  document.getElementById('tabJobBtn').classList.remove('active-tab');
  document.getElementById('appointmentTableContainer').style.display = 'none';
  document.getElementById('jobTableContainer').style.display = 'none';

  if (tabName === 'appointments') {
    document.getElementById('tabAppBtn').classList.add('active-tab');
    document.getElementById('appointmentTableContainer').style.display = 'block';
  } else {
    document.getElementById('tabJobBtn').classList.add('active-tab');
    document.getElementById('jobTableContainer').style.display = 'block';
  }
}

// Render Both Tables
function renderAdminTables(appData, jobData) {
  // --- Render Appointments Table ---
  let appTable = "<table><tr><th>Ref ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Status</th><th>Date</th><th>Action</th></tr>";
  if(appData && appData.length > 1) {
    for(let i = appData.length - 1; i >= 1; i--) {
      let refId = appData[i][0] || "N/A";
      let name = appData[i][1] || "N/A";
      let phone = appData[i][2] || "N/A";
      let email = appData[i][4] || "N/A";     
      let service = appData[i][5] || "N/A";   
      let status = appData[i][7] || "Pending"; 
      let rawDate = appData[i][8] || "";       
      let statusClass = status === "Approved" ? "status-approved" : (status === "Rejected" ? "status-rejected" : "status-pending");
      
      appTable += `<tr>
        <td><strong>${refId}</strong></td><td>${name}</td><td>${email}</td><td>${phone}</td><td>${service}</td>
        <td><span class="${statusClass}">${status}</span></td><td>${formatDate(rawDate)}</td>
        <td style="min-width: 140px;">
          <input type="date" id="dateInput_${i}" value="${formatForInput(rawDate)}" class="admin-date-input" style="margin-bottom:5px;">
          <button class="btn-approve" onclick="updateAppointment(${i}, 'Approved')">Approve</button>
          <button class="btn-reject" onclick="updateAppointment(${i}, 'Rejected')">Reject</button>
        </td></tr>`;
    }
  } else { appTable += "<tr><td colspan='8'>No appointments found.</td></tr>"; }
  appTable += "</table>";
  document.getElementById('appointmentTableContainer').innerHTML = appTable;

  // --- Render Job Applications Table ---
  let jobTable = "<table><tr><th>App ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Position</th><th>Details</th><th>Status</th><th>Action</th></tr>";
  if(jobData && jobData.length > 1) {
    for(let i = jobData.length - 1; i >= 1; i--) {
      let appId = jobData[i][0] || "N/A";
      let name = jobData[i][1] || "N/A";
      let phone = jobData[i][2] || "N/A";
      let email = jobData[i][3] || "N/A";
      let position = jobData[i][4] || "N/A";
      let details = jobData[i][5] || "N/A";
      let status = jobData[i][7] || "Pending";
      let statusClass = status === "Approved" ? "status-approved" : (status === "Rejected" ? "status-rejected" : "status-pending");
      
      jobTable += `<tr>
        <td><strong>${appId}</strong></td><td>${name}</td><td>${phone}</td><td>${email}</td><td>${position}</td>
        <td style="max-width:200px; overflow:hidden;">${details}</td><td><span class="${statusClass}">${status}</span></td>
        <td style="min-width: 90px;">
          <button class="btn-approve" onclick="updateJob(${i}, 'Approved')">Approve</button>
          <button class="btn-reject" onclick="updateJob(${i}, 'Rejected')">Reject</button>
        </td></tr>`;
    }
  } else { jobTable += "<tr><td colspan='8'>No job applications found.</td></tr>"; }
  jobTable += "</table>";
  document.getElementById('jobTableContainer').innerHTML = jobTable;
}

// Update Appointment
function updateAppointment(index, newStatus) {
  const dateVal = document.getElementById(`dateInput_${index}`).value;
  let visitingDateText = "Not Scheduled Yet";
  if(dateVal) {
    let parts = dateVal.split("-");
    if(parts.length === 3) visitingDateText = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  document.getElementById('appointmentTableContainer').innerHTML = `<p class='msg-box info-text'><div class="spinner" style="border-top-color:#3498db;"></div> Updating...</p>`;
  callAPI({ action: 'update', rowIndex: index, status: newStatus, visitingDate: visitingDateText }, function(res) {
    if(res.success) renderAdminTables(res.appointmentData, res.jobData);
  });
}

// Update Job Application
function updateJob(index, newStatus) {
  document.getElementById('jobTableContainer').innerHTML = `<p class='msg-box info-text'><div class="spinner" style="border-top-color:#3498db;"></div> Updating status...</p>`;
  callAPI({ action: 'updateJob', rowIndex: index, status: newStatus }, function(res) {
    if(res.success) renderAdminTables(res.appointmentData, res.jobData);
  });
}

function logoutAdmin() {
  currentAdminId = "";
  currentAdminPass = "";
  document.getElementById('adminLoginSection').style.display = 'block';
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminId').value = '';
  document.getElementById('adminPassword').value = '';
}
