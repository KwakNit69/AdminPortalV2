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
                fresh: 0,
                spoiled: 0
            };
        }

        vendorStats[vendor].inspections++;

        const scanHistory = data.scanHistory || [];

        scanHistory.forEach(scan => {
            if (scan.label === "Fresh") vendorStats[vendor].fresh++;
            if (scan.label === "Spoiled") vendorStats[vendor].spoiled++;
        });
    });

    renderReports();
}

function renderReports() {
    const entries = Object.entries(vendorStats);

    const topVendors = [...entries]
        .sort((a, b) => b[1].fresh - a[1].fresh)
        .slice(0, 5);

    const spoiledVendors = [...entries]
        .sort((a, b) => b[1].spoiled - a[1].spoiled)
        .slice(0, 5);

    document.getElementById("topVendorList").innerHTML =
        topVendors.map(([vendor, stats]) => `
            <div class="report-item">
                ${vendor} — ${stats.fresh} fresh
            </div>
        `).join("");

    document.getElementById("spoiledVendorList").innerHTML =
        spoiledVendors.map(([vendor, stats]) => `
            <div class="report-item">
                ${vendor} — ${stats.spoiled} spoiled
            </div>
        `).join("");

    document.getElementById("vendorTableBody").innerHTML =
        entries.map(([vendor, stats]) => `
            <tr>
                <td>${vendor}</td>
                <td>${stats.inspections}</td>
                <td>${stats.fresh}</td>
                <td>${stats.spoiled}</td>
            </tr>
        `).join("");
}

document.getElementById("exportBtn").addEventListener("click", () => {
    let csv = "Vendor,Inspections,Fresh,Spoiled\n";

    Object.entries(vendorStats).forEach(([vendor, stats]) => {
        csv += `${vendor},${stats.inspections},${stats.fresh},${stats.spoiled}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vendor_report.csv";
    a.click();
});

loadReports();