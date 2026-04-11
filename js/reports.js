import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let vendorStats = {};

async function loadReports() {
    const snapshot = await getDocs(collection(db, "inspections"));
    vendorStats = {};

    snapshot.forEach(doc => {
        const data = doc.data();
        const vendor = data.vendorName || "Unknown Vendor";

        if (!vendorStats[vendor]) {
            vendorStats[vendor] = {
                inspections: 0,
                cleanSessions: 0,
                spoiledSessions: 0
            };
        }

        vendorStats[vendor].inspections++;

        const scanHistory = data.scanHistory || [];

        const hasSpoiled = scanHistory.some(
            scan => scan.label === "Spoiled"
        );

        if (hasSpoiled) {
            vendorStats[vendor].spoiledSessions++;
        } else {
            vendorStats[vendor].cleanSessions++;
        }
    });

    renderReports();
}

function renderReports() {
    const entries = Object.entries(vendorStats);

    const topVendors = [...entries]
        .sort((a, b) => b[1].cleanSessions - a[1].cleanSessions)
        .slice(0, 5);

    const spoiledVendors = [...entries]
        .sort((a, b) => b[1].spoiledSessions - a[1].spoiledSessions)
        .slice(0, 5);

    // Top vendors
    document.getElementById("topVendorList").innerHTML =
        topVendors.map(([vendor, stats]) => `
            <div class="report-item">
                <span>${vendor}</span>
                <span class="clean-text">${stats.cleanSessions} clean</span>
            </div>
        `).join("");

    // Most flagged
    document.getElementById("spoiledVendorList").innerHTML =
        spoiledVendors.map(([vendor, stats]) => `
            <div class="report-item">
                <span>${vendor}</span>
                <span class="flagged-text">${stats.spoiledSessions} flagged</span>
            </div>
        `).join("");

    // Summary
    document.getElementById("vendorTableBody").innerHTML =
        entries.map(([vendor, stats]) => `
            <tr>
                <td>${vendor}</td>
                <td>${stats.inspections}</td>
                <td><span class="badge-clean">${stats.cleanSessions}</span></td>
                <td><span class="badge-flagged">${stats.spoiledSessions}</span></td>
            </tr>
        `).join("");
}

document.getElementById("exportBtn").addEventListener("click", () => {
    let csv = "Vendor,Inspections,Clean Sessions,Flagged Sessions\n";

    Object.entries(vendorStats).forEach(([vendor, stats]) => {
        csv += `${vendor},${stats.inspections},${stats.cleanSessions},${stats.spoiledSessions}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vendor_performance_report.csv";
    a.click();
});

loadReports();