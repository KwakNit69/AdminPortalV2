import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allRows = [];

async function loadInspections() {
    const snapshot = await getDocs(collection(db, "inspections"));

    allRows = [];

    snapshot.forEach(doc => {
        const data = doc.data();

        let fresh = 0;
        let spoiled = 0;

        const scanHistory = data.scanHistory || [];

        scanHistory.forEach(scan => {
            if (scan.label === "Fresh") fresh++;
            if (scan.label === "Spoiled") spoiled++;
        });

        allRows.push({
            inspector: data.inspectorName || "Unknown",
            vendor: data.vendorName || "Unknown",
            stall: data.stallNumber || "-",
            fresh,
            spoiled,
            date: data.timestamp?.toDate().toLocaleDateString() || "-",
            scanHistory
        });
    });

    renderTable(allRows);
}

function renderTable(rows) {
    const tbody = document.getElementById("inspectionTableBody");

    if (!tbody) return;

    tbody.innerHTML = rows.map((row, index) => `
        <tr>
            <td>${row.inspector}</td>
            <td>${row.vendor}</td>
            <td>${row.stall}</td>
            <td>${row.fresh}</td>
            <td>${row.spoiled}</td>
            <td>${row.date}</td>
            <td>
                <button class="view-btn" onclick="toggleDetails(${index})">
                    View
                </button>
            </td>
        </tr>

        <tr id="details-${index}" class="details-row" style="display:none;">
            <td colspan="7">
                <div class="scan-history">
                    ${row.scanHistory.length
                        ? row.scanHistory.map(scan => `
                            <div class="scan-item">
                                <span>${scan.cut}</span>
                                <strong class="${scan.label === "Fresh" ? "fresh" : "spoiled"}">
                                    ${scan.label}
                                </strong>
                            </div>
                        `).join("")
                        : `<div class="scan-item">No scan history available</div>`
                    }
                </div>
            </td>
        </tr>
    `).join("");
}

window.toggleDetails = function(index) {
    const row = document.getElementById(`details-${index}`);
    if (!row) return;

    row.style.display =
        row.style.display === "none" ? "table-row" : "none";
};

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", e => {
        const value = e.target.value.toLowerCase();

        const filtered = allRows.filter(row =>
            row.vendor.toLowerCase().includes(value) ||
            row.inspector.toLowerCase().includes(value) ||
            row.stall.toLowerCase().includes(value)
        );

        renderTable(filtered);
    });
}

loadInspections();