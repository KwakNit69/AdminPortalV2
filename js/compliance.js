import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let vendorSpoilage = {};

async function loadCompliance() {
    const snapshot = await getDocs(collection(db, "inspections"));

    vendorSpoilage = {};

    snapshot.forEach(doc => {
        const data = doc.data();
        const vendor = data.vendorName || "Unknown Vendor";

        if (!vendorSpoilage[vendor]) {
            vendorSpoilage[vendor] = 0;
        }

        const scanHistory = data.scanHistory || [];

        scanHistory.forEach(scan => {
            if (scan.label === "Spoiled") {
                vendorSpoilage[vendor]++;
            }
        });
    });

    renderCompliance();
}

function getStatus(count) {
    if (count >= 3) return "critical";
    if (count >= 1) return "warning";
    return "compliant";
}

function renderCompliance() {
    const entries = Object.entries(vendorSpoilage);

    const critical = entries.filter(([_, count]) => count >= 3);
    const warning = entries.filter(([_, count]) => count >= 1 && count < 3);

    document.getElementById("criticalVendorList").innerHTML =
        critical.map(([vendor, count]) => `
            <div class="compliance-item">
                ${vendor} — ${count} spoiled
            </div>
        `).join("");

    document.getElementById("warningVendorList").innerHTML =
        warning.map(([vendor, count]) => `
            <div class="compliance-item">
                ${vendor} — ${count} spoiled
            </div>
        `).join("");

    document.getElementById("complianceTableBody").innerHTML =
        entries.map(([vendor, count]) => `
            <tr>
                <td>${vendor}</td>
                <td>${count}</td>
                <td>
                    <span class="status ${getStatus(count)}">
                        ${getStatus(count).toUpperCase()}
                    </span>
                </td>
            </tr>
        `).join("");
}

loadCompliance();