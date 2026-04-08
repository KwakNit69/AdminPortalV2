document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("sidebar-container");

    if (container) {
        container.innerHTML = `
            <aside class="sidebar">
              <div class="logo">
                <span>QualiMeat</span>
                <small>PRECISION INSPECTION</small>
              </div>

              <nav class="menu">
                <a href="dashboard.html">Dashboard</a>
                <a href="inspections.html">Inspections</a>
                <a href="history.html">Batch History</a>
                <a href="reports.html">Reports</a>
                <a href="compliance.html">Compliance</a>
                <a href="information.html">Information</a>
              </nav>

              <button class="new-btn">NEW INSPECTION</button>
            </aside>
        `;

        const links = container.querySelectorAll(".menu a");
        const currentPage = window.location.pathname.split("/").pop();

        links.forEach(link => {
            if (link.getAttribute("href") === currentPage) {
                link.classList.add("active");
            }
        });
    }
}); 