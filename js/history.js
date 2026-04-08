import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allHistory = [];

async function loadHistory() {
    const snapshot = await getDocs(collection(db, "inspections"));

    allHistory = [];

    snapshot.forEach(doc => {
        const data = doc.data();

        let fresh = 0;
        let spoiled = 0;

        const scanHistory = data.scanHistory || [];

        scanHistory.forEach(scan => {
            if (scan.label === "Fresh") fresh++;
            if (scan.label === "Spoiled") spoiled++;
        });

        allHistory.push({
            vendor: data.vendorName || "Unknown Vendor",
            stall: data.stallNumber || "-",
            inspector: data.inspectorName || "Unknown",
            fresh,
            spoiled,
            date: data.timestamp?.toDate().toLocaleDateString() || "-"
        });
    });

    renderHistory(allHistory);
}

function renderHistory(rows) {
    const container = document.getElementById("historyList");
    if (!container) return;

    container.innerHTML = rows
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(row => `
            <div class="history-card">
                <h3>${row.vendor}</h3>

                <div class="history-meta">
                    <span>🏪 Stall ${row.stall}</span>
                    <span>👤 ${row.inspector}</span>
                    <span>📅 ${row.date}</span>
                </div>

                <div class="history-status">
                    <span class="badge fresh">Fresh: ${row.fresh}</span>
                    <span class="badge spoiled">Spoiled: ${row.spoiled}</span>
                </div>
            </div>
        `)
        .join("");
}

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", e => {
        const value = e.target.value.toLowerCase();

        const filtered = allHistory.filter(row =>
            row.vendor.toLowerCase().includes(value) ||
            row.stall.toLowerCase().includes(value)
        );

        renderHistory(filtered);
    });
}

loadHistory();