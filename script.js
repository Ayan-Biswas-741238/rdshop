// APNAR APPS SCRIPT WEB APP URL INTEGRATE KORA HOYECHE
const API_URL = "https://script.google.com/macros/s/AKfycbzcf1JgISHCR4nMZOSLFcQNxSldeDFw-f_WBS4eXpmkiy9dHnp7j-lhVE9Oa0k0JgbY/exec";

// Toggle Mobile Burger Menu
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('show');
}

// Page Navigation Logic
function showPage(pageId) {
  const pages = document.querySelectorAll('.page-section');
  pages.forEach(page => page.classList.remove('active-page'));
  
  document.getElementById(pageId).classList.add('active-page');

  // Close mobile burger menu after clicking a link
  const navLinks = document.getElementById('navLinks');
  if (navLinks.classList.contains('show')) {
    navLinks.classList.remove('show');
  }
}

// API Fetch Helper
function callAPI(payload, successCallback) {
  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  })
  .then(res => res.json())
  .then(data => successCallback(data))
  .catch(err => {
    console.error("API Error:", err);
    alert("Connection error! Please check your network or API link.");
  });
}

// Submit Appointment
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
  msgBox.innerText = "Booking in progress, please wait...";
  
  callAPI({ action: 'book', name, phone, address }, function(res) {
    if(res.success) {
      msgBox.className = "msg-box success-text";
      msgBox.innerText = res.message;
      document.getElementById('name').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('address').value = '';
      
      setTimeout(() => { msgBox.innerText = ''; }, 5000);
    } else {
      msgBox.className = "msg-box error-text";
      msgBox.innerText = res.message;
    }
  });
}

// Admin Login
function loginAdmin() {
  const id = document.getElementById('adminId').value.trim();
  const pass = document.getElementById('adminPassword').value;
  const msgBox = document.getElementById('adminMessage');
  
  msgBox.className = "msg-box info-text";
  msgBox.innerText = "Checking credentials...";
  
  callAPI({ action: 'login', id: id, password: pass }, function(res) {
    if(res.success) {
      msgBox.innerText = "";
      document.getElementById('adminLoginSection').style.display = 'none';
      document.getElementById('adminDashboard').style.display = 'block';
      showData(res.data);
    } else {
      msgBox.className = "msg-box error-text";
      msgBox.innerText = res.message;
    }
  });
}

// Display Admin Data
function showData(data) {
  if(data.length <= 1) {
    document.getElementById('tableContainer').innerHTML = "<p>No appointments found.</p>";
    return;
  }
  
  let table = "<table><tr><th>Name</th><th>Phone</th><th>Address</th><th>Date & Time</th><th>Status</th><th>Action</th></tr>";
  
  for(let i = data.length - 1; i >= 1; i--) {
    let status = data[i][4] || "Pending";
    let statusClass = "status-pending";
    if(status === "Approved") statusClass = "status-approved";
    if(status === "Rejected") statusClass = "status-rejected";

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
      <td style="min-width: 90px;">${actionButtons}</td>
    </tr>`;
  }
  table += "</table>";
  document.getElementById('tableContainer').innerHTML = table;
}

// Change Appointment Status
function changeStatus(index, newStatus) {
  document.getElementById('tableContainer').innerHTML = "<p class='msg-box info-text'>Updating status, please wait...</p>";
  
  callAPI({ action: 'update', rowIndex: index, status: newStatus }, function(res) {
    if(res.success) {
      showData(res.data);
    }
  });
}

// Logout Admin
function logoutAdmin() {
  document.getElementById('adminLoginSection').style.display = 'block';
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminId').value = '';
  document.getElementById('adminPassword').value = '';
  document.getElementById('tableContainer').innerHTML = "Loading...";
}
