// app.js
// Basic JavaScript used across all pages for the ePOD demo

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  initDashboard();
  initOrderForm();
  initLoginForm();
  initSignupForm();
});

// 1. Set current year in footer
function setCurrentYear() {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

// ----------------- DASHBOARD & ORDERS -----------------

let orders = []; // global array for orders (demo)

// Load from localStorage or use default demo data
function loadOrders() {
  const stored = localStorage.getItem("epodOrders");
  if (stored) {
    try {
      orders = JSON.parse(stored);
      return;
    } catch (e) {
      console.error("Error reading stored orders", e);
    }
  }

  // default demo data if nothing stored yet
  orders = [
    { id: "SO1001", customer: "ABC Trading", salesperson: "Ali", status: "Signed" },
    { id: "SO1002", customer: "Global Stores", salesperson: "Sara", status: "Pending" },
    { id: "SO1003", customer: "Bright Co.", salesperson: "Ali", status: "Signed" },
    { id: "SO1004", customer: "Future Home", salesperson: "Mohammed", status: "Pending" }
  ];
  saveOrders();
}

function saveOrders() {
  localStorage.setItem("epodOrders", JSON.stringify(orders));
}

function initDashboard() {
  const tableBody = document.querySelector("#orders-table tbody");
  if (!tableBody) return; // not on index page

  const statusFilter = document.getElementById("statusFilter");
  const statTotal = document.getElementById("stat-total");
  const statSigned = document.getElementById("stat-signed");
  const statPending = document.getElementById("stat-pending");

  loadOrders();

  function renderOrders() {
    const filter = statusFilter.value;

    const filtered = orders.filter(order =>
      filter === "all" ? true : order.status === filter
    );

    // Fill table body
    tableBody.innerHTML = "";
    filtered.forEach(order => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td>${order.salesperson}</td>
        <td>${order.status}</td>
        <td>
          ${
            order.status === "Pending"
              ? `<button type="button" class="btn-sign" data-id="${order.id}">Sign</button>`
              : `<span class="signed-label">Signed</span>`
          }
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Stats
    const total = orders.length;
    const signed = orders.filter(o => o.status === "Signed").length;
    const pending = orders.filter(o => o.status === "Pending").length;

    statTotal.textContent = total;
    statSigned.textContent = signed;
    statPending.textContent = pending;
  }

  // Event: change filter
  statusFilter.addEventListener("change", renderOrders);

  // Event: click Sign on a pending order
  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-sign");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const ok = confirm(
      `Simulate customer signature for order ${order.id}?\n` +
      `Customer: ${order.customer}\n` +
      `Salesperson: ${order.salesperson}`
    );

    if (!ok) return;

    // Here we simulate that the customer signed the POD
    order.status = "Signed";
    // A real system would also capture signature image + timestamp + hash
    order.signedAt = new Date().toISOString();

    saveOrders();
    renderOrders();
  });

  // Make renderOrders available to other functions (e.g. new orders)
  window.renderOrdersDashboard = renderOrders;
  renderOrders();
}

// ----------------- NEW ORDER FORM -----------------

function initOrderForm() {
  const form = document.getElementById("order-form");
  if (!form) return;

  const msg = document.getElementById("order-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("order-id").value.trim();
    const customer = document.getElementById("order-customer").value.trim();
    const salesperson = document.getElementById("order-salesperson").value.trim();
    const status = document.getElementById("order-status").value;

    if (!id || !customer || !salesperson) {
      msg.textContent = "Please complete all fields.";
      msg.style.color = "red";
      return;
    }

    // check duplicate order number
    if (orders.some(o => o.id === id)) {
      msg.textContent = "This order number already exists.";
      msg.style.color = "red";
      return;
    }

    const newOrder = { id, customer, salesperson, status };

    // Newly created orders are not really signed in real life,
    // but we allow "Signed" here only for demo/testing.
    orders.push(newOrder);
    saveOrders();

    msg.textContent = "Order added successfully. It now appears in the dashboard.";
    msg.style.color = "green";
    form.reset();
    document.getElementById("order-status").value = "Pending";

    if (typeof window.renderOrdersDashboard === "function") {
      window.renderOrdersDashboard();
    }
  });
}

// ----------------- LOGIN FORM -----------------

function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const messageEl = document.getElementById("login-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // we are not sending to a server

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
      messageEl.textContent = "Please fill in both email and password.";
      messageEl.style.color = "red";
      return;
    }

    if (!email.endsWith("@stu.kau.edu.sa")) {
      messageEl.textContent = "Please use your university email (@stu.kau.edu.sa).";
      messageEl.style.color = "red";
      return;
    }

    if (password.length < 6) {
      messageEl.textContent = "Password should be at least 6 characters.";
      messageEl.style.color = "red";
      return;
    }

    // For this project we just simulate success
    messageEl.textContent = "Login successful (demo only). Redirecting to dashboard...";
    messageEl.style.color = "green";
  });
}

// ----------------- SIGNUP FORM -----------------

function initSignupForm() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  const messageEl = document.getElementById("signup-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirm = document.getElementById("confirm").value.trim();
    const terms = document.getElementById("terms").checked;

    if (!email || !password || !confirm) {
      messageEl.textContent = "Please complete all required fields.";
      messageEl.style.color = "red";
      return;
    }

    if (!email.endsWith("@stu.kau.edu.sa")) {
      messageEl.textContent = "Please register with your university email (@stu.kau.edu.sa).";
      messageEl.style.color = "red";
      return;
    }

    if (password.length < 6) {
      messageEl.textContent = "Password must be at least 6 characters.";
      messageEl.style.color = "red";
      return;
    }

    if (password !== confirm) {
      messageEl.textContent = "Passwords do not match.";
      messageEl.style.color = "red";
      return;
    }

    if (!terms) {
      messageEl.textContent = "You must agree to the terms and conditions.";
      messageEl.style.color = "red";
      return;
    }

    // Simulate successful registration
