// Updated Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbzd-_1EH8ymdjQhNjAD-7mml1PXoi9rRTZEODx6-L9a9MyT4siWNFQ_DHlOffT0ZHI-/exec";

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('show');
}

function showPage(pageId) {
  document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active-page'));
  document.getElementById(pageId).classList.add('active-page');
  
  const navLinks = document.getElementById('navLinks');
  if (navLinks.classList.contains('show')) navLinks.classList.remove('show');
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

// 1. SUBMIT BOOKING
function submitBooking() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const service = document.getElementById('service').value;

  if(!name || !phone || !address){
    alert("Please fill in your name, phone number, and address.");
    return;
  }

  const resultBox = document.getElementById('bookingResult');
  resultBox.style.display = 'none';
  setButtonState('bookBtn', true, 'Book Appointment');
  
  callAPI({ action: 'book', name, phone, address, service }, function(res) {
    setButtonState('bookBtn', false, 'Book Appointment');
    if(res.success) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <h3 style="color:#27ae60;">🎉 ${res.message}</h3>
        <p style="margin-top:10px;">Please save your Reference ID to check status later:</p>
        <div class="ref-badge">${res.refId}</div>
        <p style="font-size:13px; color:#666;">Note down this Reference ID carefully.</p>
      `;
      document.getElementById('name').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('address').value = '';
    }
  }, function() {
    setButtonState('bookBtn', false, 'Book Appointment');
  });
}

// DATE FORMATTER HELPER (DD/MM/YYYY)
function formatDate(dateString) {
  if (!dateString || dateString === "Not Scheduled Yet") return "Not Scheduled Yet";
  let d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString; 
  let day = String(d.getDate()).padStart(2, '0');
  let month = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// DATE FORMATTER FOR INPUT FIELD (YYYY-MM-DD)
function formatDateForInput(dateString) {
  if (!dateString || dateString === "Not Scheduled Yet") return "";
  let d = new Date(dateString);
  if (isNaN(d.getTime())) return ""; 
  let day = String(d.getDate()).padStart(2, '0');
  let month = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

// 2. CHECK APPOINTMENT STATUS
function checkStatus() {
  const refId = document.getElementById('refIdInput').value.trim();
  if(!refId) {
    alert("Please enter a Reference ID!");
    return;
  }

  const statusCard = document.getElementById('statusResultCard');
  statusCard.style.display = 'none';
  setButtonState('statusBtn', true, 'Check Status');

  callAPI({ action: 'checkStatus', refId: refId }, function(res) {
    setButtonState('statusBtn', false, 'Check Status');
    statusCard.style.display = 'block';
    
    if(res.success) {
      const item = res.data;
      let statusBadge = item.status === "Approved" ? "status-approved" : (item.status === "Rejected" ? "status-rejected" : "status-pending");
      
      // Date Formatting Applied Here
      let displayDate = formatDate(item.visitingDate);

      statusCard.innerHTML = `
        <h3 style="color:#2c3e50; margin-bottom:15px; text-align:center;">Appointment Details</h3>
        <div class="status-row"><strong>Reference ID:</strong> <span>${item.refId}</span></div>
        <div class="status-row"><strong>Name:</strong> <span>${item.name}</span></div>
        <div class="status-row"><strong>Service:</strong> <span>${item.service}</span></div>
        <div class="status-row"><strong>Status:</strong> <span class="${statusBadge}">${item.status}</span></div>
        <div class="status-row"><strong>Visiting Date:</strong> <span style="font-weight:bold; color:#2980b9;">${displayDate}</span></div>
      `;
    } else {
      statusCard.innerHTML = `<p style="color:#e74c3c; text-align:center; font-weight:bold;">❌ ${res.message}</p>`;
    }
  }, function() {
    setButtonState('statusBtn', false, 'Check Status');
  });
}

// 3. ADMIN LOGIN
function loginAdmin() {
  const id = document.getElementById('adminId').value.trim();
  const pass = document.getElementById('adminPassword').value;
  const msgBox = document.getElementById('adminMessage');
  
  msgBox.innerText = "";
  setButtonState('loginBtn', true, 'Login');
  
  callAPI({ action: 'login', id: id, password: pass }, function(res) {
    setButtonState('loginBtn', false, 'Login');
    if(res.success) {
      msgBox.innerText = "";
      document.getElementById('adminLoginSection').style.display = 'none';
      document.getElementById('adminDashboard').style.display = 'block';
      showData(res.data);
    } else {
      msgBox.className = "msg-box error-text";
      msgBox.innerText = res.message;
    }
  }, function() {
    setButtonState('loginBtn', false, 'Login');
  });
}

// 4. DISPLAY ADMIN DATA TABLE
function showData(data) {
  if(data.length <= 1) {
    document.getElementById('tableContainer').innerHTML = "<p>No appointments found.</p>";
    return;
  }
  
  let table = "<table><tr><th>Ref ID</th><th>Name</th><th>Phone</th><th>Address</th><th>Service</th><th>Status</th><th>Visiting Date</th><th>Action</th></tr>";
  
  for(let i = data.length - 1; i >= 1; i--) {
    let refId = data[i][0] || "N/A";
    let status = data[i][6] || "Pending";
    let rawDate = data[i][7] || "";
    
    let statusClass = status === "Approved" ? "status-approved" : (status === "Rejected" ? "status-rejected" : "status-pending");

    // Date Formatting Applied Here for Table & Input field
    let displayDate = formatDate(rawDate);
    let inputDateValue = formatDateForInput(rawDate);

    let actionButtons = `
      <div style="margin-bottom:5px;">
        <input type="date" id="dateInput_${i}" value="${inputDateValue}" class="admin-date-input" placeholder="Set Date">
      </div>
      <button class="btn-approve" onclick="updateAppointment(${i}, 'Approved')">Approve</button>
      <button class="btn-reject" onclick="updateAppointment(${i}, 'Rejected')">Reject</button>
    `;

    table += `<tr>
      <td><strong>${refId}</strong></td>
      <td>${data[i][1]}</td>
      <td>${data[i][2]}</td>
      <td>${data[i][3]}</td>
      <td>${data[i][4]}</td>
      <td><span class="${statusClass}">${status}</span></td>
      <td>${displayDate}</td>
      <td style="min-width: 140px;">${actionButtons}</td>
    </tr>`;
  }
  table += "</table>";
  document.getElementById('tableContainer').innerHTML = table;
}

// 5. ADMIN UPDATE STATUS & DATE
function updateAppointment(index, newStatus) {
  const dateVal = document.getElementById(`dateInput_${index}`).value;
  let visitingDateText = dateVal ? dateVal : "Not Scheduled Yet";
  
  document.getElementById('tableContainer').innerHTML = `<p class='msg-box info-text'><div class="spinner" style="border-top-color:#3498db;"></div> Updating status & date...</p>`;
  
  callAPI({ action: 'update', rowIndex: index, status: newStatus, visitingDate: visitingDateText }, function(res) {
    if(res.success) showData(res.data);
  });
}

// 6. LOGOUT
function logoutAdmin() {
  document.getElementById('adminLoginSection').style.display = 'block';
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminId').value = '';
  document.getElementById('adminPassword').value = '';
  document.getElementById('tableContainer').innerHTML = "Loading...";
}
