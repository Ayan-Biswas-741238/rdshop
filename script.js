const API_URL = "https://script.google.com/macros/s/AKfycbzDxCvcyMIDnTjhoyqiArnRmiNLo0Jv6Vm6Lo8Rl-y_Pc7Ej3HiCtnvvegw4VDHme_f/exec";

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

// 1. SUBMIT BOOKING (Updated to include email)
function submitBooking() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const service = document.getElementById('service').value;

  if(!name || !phone || !email || !address){
    alert("Please fill in your name, phone, email, and address.");
    return;
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
        <div class="ref-badge">${res.refId}</div>
        <p style="font-size:13px; color:#666;">Note down this Reference ID carefully.</p>
      `;
      document.getElementById('name').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('email').value = '';
      document.getElementById('address').value = '';
    }
  }, function() {
    setButtonState('bookBtn', false, 'Book Appointment');
  });
}

function formatDate(dateString) {
  if (!dateString || dateString === "Not Scheduled Yet") return "Not Scheduled Yet";
  let d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString; 
  let day = String(d.getDate()).padStart(2, '0');
  let month = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

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

function formatForInput(dateStr) {
  if(!dateStr || dateStr === "Not Scheduled Yet") return "";
  let parts = dateStr.split("/");
  if(parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return "";
}

// 4. DISPLAY ADMIN DATA TABLE (Updated with shifted columns)
function showData(data) {
  if(data.length <= 1) {
    document.getElementById('tableContainer').innerHTML = "<p>No appointments found.</p>";
    return;
  }
  
  let table = "<table><tr><th>Ref ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Status</th><th>Visiting Date</th><th>Action</th></tr>";
  
  for(let i = data.length - 1; i >= 1; i--) {
    let refId = data[i][0] || "N/A";
    let name = data[i][1] || "N/A";
    let phone = data[i][2] || "N/A";
    let email = data[i][4] || "N/A";     // Column E (Index 4)
    let service = data[i][5] || "N/A";   // Column F (Index 5)
    let status = data[i][7] || "Pending"; // Column H (Index 7)
    let rawDate = data[i][8] || "";       // Column I (Index 8)
    
    let statusClass = status === "Approved" ? "status-approved" : (status === "Rejected" ? "status-rejected" : "status-pending");

    let displayDate = formatDate(rawDate);
    let inputDateValue = formatForInput(rawDate); // Use the simple formatForInput for table

    let actionButtons = `
      <div style="margin-bottom:5px;">
        <input type="date" id="dateInput_${i}" value="${inputDateValue}" class="admin-date-input" placeholder="Set Date">
      </div>
      <button class="btn-approve" onclick="updateAppointment(${i}, 'Approved')">Approve</button>
      <button class="btn-reject" onclick="updateAppointment(${i}, 'Rejected')">Reject</button>
    `;

    table += `<tr>
      <td><strong>${refId}</strong></td>
      <td>${name}</td>
      <td>${email}</td>
      <td>${phone}</td>
      <td>${service}</td>
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
  let visitingDateText = "Not Scheduled Yet";
  
  if(dateVal) {
    let parts = dateVal.split("-");
    if(parts.length === 3) {
      visitingDateText = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      visitingDateText = dateVal;
    }
  }
  
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
