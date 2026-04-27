import { logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("sidebar-container");

  if (!container) return;

  container.innerHTML = `
    <aside class="sidebar">
      <div class="logo">
        <span>QualiMeat</span>
        <small>PRECISION INSPECTION</small>
      </div>

      <nav class="menu">
        <a href="dashboard.html">Dashboard</a>
        <a href="inspection_history.html">Inspection History</a>
        <a href="reports.html">Reports</a>
        <a href="information.html">Registry</a>
        <a href="profile.html">Profile</a>
      </nav>

      <button id="logoutBtn" class="logout-btn">LOG OUT</button>
    </aside>
  `;

  /* ACTIVE LINK */
  const links = container.querySelectorAll(".menu a");
  const currentPage = window.location.pathname.split("/").pop();

  links.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  /* 🔥 LOGOUT FIX (REAL FIX) */
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }
});