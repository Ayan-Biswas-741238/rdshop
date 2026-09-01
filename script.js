const API_URL = "https://script.google.com/macros/s/AKfycbzcf1JgISHCR4nMZOSLFcQNxSldeDFw-f_WBS4eXpmkiy9dHnp7j-lhVE9Oa0k0JgbY/exec";

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('show');
}

function showPage(pageId) {
  document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active-page'));
  document.getElementById(pageId).classList.add('active-page');
  
  const navLinks = document.getElementById('navLinks');
  if (navLinks.classList.contains('show')) navLinks.classList.remove('show');
}

// Button loading animation helper
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
    alert("Connection error! Please check your internet network.");
  });
}

function submitBooking() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();

  if(!name || !phone || !address){
    alert("Please fill in your name, phone number, and address.");
    return;
  }

  const msgBox = document.getElementById('bookingMessage');
  msgBox.className = "msg-box info-text";
  msgBox.innerText = "";
  
  // Start button spinner
  setButtonState('bookBtn', true, 'Book Appointment');
  
  callAPI({ action: 'book', name, phone, address }, function(res) {
    setButtonState('bookBtn', false, 'Book Appointment');
    if(res.success) {
      msgBox.className = "msg-box success-text";
      msgBox.innerText = res.message;
      document.getElementById('name').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('address').value = '';
      setTimeout(() => { msgBox.innerText = ''; }, 5000);
    }
  }, function() {
    setButtonState('bookBtn', false, 'Book Appointment');
  });
}

function loginAdmin() {
  const id = document.getElementById('adminId').value.trim();
  const pass = document.getElementById('adminPassword').value;
  const msgBox = document.getElementById('adminMessage');
  
  msgBox.innerText = "";
  
  // Start button spinner
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

function showData(data) {
  if(data.length <= 1) {
    document.getElementById('tableContainer').innerHTML = "<p>No appointments found.</p>";
    return;
  }
  
  let table = "<table><tr><th>Name</th><th>Phone</th><th>Address</th><th>Date & Time</th><th>Status</th><th>Action</th></tr>";
  
  for(let i = data.length - 1; i >= 1; i--) {
    let status = data[i][4] || "Pending";
    let statusClass = status === "Approved" ? "status-approved" : (status === "Rejected" ? "status-rejected" : "status-pending");

    let actionButtons = `
      <button class="btn-approve" onclick="changeStatus(${i}, 'Approved')">Approve</button>
      <button class="btn-reject" onclick="changeStatus(${i}, 'Rejected')">Reject</button>
    `;

    table += `<tr>
      <td>${data[i][0]}</td>
      <td>${data[i][1]}</td>
      <td>${data[i][2]}</td>
      <td>${data[i][3]}</td>
      <td><span class="${statusClass}">${status}</span></td>
      <td style="min-width: 100px;">${actionButtons}</td>
    </tr>`;
  }
  table += "</table>";
  document.getElementById('tableContainer').innerHTML = table;
}

function changeStatus(index, newStatus) {
  document.getElementById('tableContainer').innerHTML = `<p class='msg-box info-text'><div class="spinner" style="border-top-color:#3498db;"></div> Updating status...</p>`;
  callAPI({ action: 'update', rowIndex: index, status: newStatus }, function(res) {
    if(res.success) showData(res.data);
  });
}

function logoutAdmin() {
  document.getElementById('adminLoginSection').style.display = 'block';
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminId').value = '';
  document.getElementById('adminPassword').value = '';
  document.getElementById('tableContainer').innerHTML = "Loading...";
}
