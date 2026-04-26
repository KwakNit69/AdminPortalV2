import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let qualityChart = null;

async function loadDashboard() {
    try {
        // --- 1. INJECT SKELETONS ---
        const kpis = ["totalInspections", "freshScans", "spoiledScans", "totalVendors"];
        kpis.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<div class="skeleton sk-title" style="margin:0; width: 60px; height: 35px;"></div>`;
        });

        const topStalls = document.getElementById("topStallsList");
        if (topStalls) {
            topStalls.innerHTML = Array(3).fill(`
                <div style="margin-bottom: 12px;">
                    <div class="skeleton sk-text" style="width: 30%;"></div>
                    <div class="skeleton sk-text" style="height: 10px; border-radius: 5px;"></div>
                </div>
            `).join("");
        }

        const tbody = document.getElementById("inspectionTableBody");
        if (tbody) {
            tbody.innerHTML = Array(5).fill(`
                <tr class="skeleton-row">
                    <td><div class="skeleton sk-text"></div></td>
                    <td><div class="skeleton sk-text" style="width: 80%;"></div></td>
                    <td><div class="skeleton sk-text" style="width: 50%;"></div></td>
                    <td><div class="skeleton sk-text"></div></td>
                    <td><div class="skeleton sk-text"></div></td>
                    <td><div class="skeleton sk-text"></div></td>
                </tr>
            `).join("");
        }
        // ---------------------------

        const snapshot = await getDocs(collection(db, "inspections"));

        let totalInspections = snapshot.size;
        let FRESH = 0;
        let SPOILED = 0;
        let vendors = new Set();

        const stallStats = {};
        const dailyStats = {};
        const recentRows = [];

        snapshot.forEach(doc => {
            const data = doc.data();

            if (data.vendorName) vendors.add(data.vendorName);

            const stall = data.stallNumber || "Unknown";

            if (!stallStats[stall]) stallStats[stall] = { FRESH: 0, SPOILED: 0 };

            let day = "Unknown";
            let formattedDate = "-";

            if (data.timestamp && typeof data.timestamp.toDate === 'function') {
                const dateObj = data.timestamp.toDate();
                day = dateObj.toLocaleDateString();
                formattedDate = day;
            } else if (data.timestamp) {
                day = new Date(data.timestamp).toLocaleDateString();
                formattedDate = day;
            }

            if (!dailyStats[day]) dailyStats[day] = { FRESH: 0, SPOILED: 0 };

            let FRESHCount = 0;
            let SPOILEDCount = 0;

            if (data.scanHistory && Array.isArray(data.scanHistory)) {
                data.scanHistory.forEach(scan => {
                    const label = (scan.label || "").toLowerCase();
                    if (label.includes("fresh")) { 
                        FRESH++; FRESHCount++; dailyStats[day].FRESH++; stallStats[stall].FRESH++;
                    } 
                    if (label.includes("spoiled")) {
                        SPOILED++; SPOILEDCount++; dailyStats[day].SPOILED++; stallStats[stall].SPOILED++;
                    }
                });
            }

            recentRows.push({
                inspector: data.inspectorName || "Unknown",
                vendor: data.vendorName || "Unknown",
                stall,
                fresh: FRESHCount,
                spoiled: SPOILEDCount,
                date: formattedDate
            });
        });

        // 2. RENDER REAL DATA
        if (document.getElementById("totalInspections")) document.getElementById("totalInspections").textContent = totalInspections;
        if (document.getElementById("freshScans")) document.getElementById("freshScans").textContent = FRESH;
        if (document.getElementById("spoiledScans")) document.getElementById("spoiledScans").textContent = SPOILED;
        if (document.getElementById("totalVendors")) document.getElementById("totalVendors").textContent = vendors.size;

        renderTrendChart(dailyStats);
        renderRecentInspections(recentRows);
        renderTopStalls(stallStats);

    } catch (error) {
        console.error("Dashboard Data Error:", error);
    }
}

function renderTrendChart(dailyStats) {
    const labels = Object.keys(dailyStats).sort((a, b) => new Date(a) - new Date(b));
    const freshData = labels.map(day => dailyStats[day].FRESH);
    const spoiledData = labels.map(day => dailyStats[day].SPOILED);

    const ctx = document.getElementById("qualityTrendChart");
    if (!ctx) return;
    if (qualityChart) qualityChart.destroy();

    qualityChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                { label: "FRESH", data: freshData, backgroundColor: "#22c55e", borderRadius: 6 },
                { label: "SPOILED", data: spoiledData, backgroundColor: "#ef4444", borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "top" } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderRecentInspections(rows) {
    const tbody = document.getElementById("inspectionTableBody");
    if (!tbody) return;

    tbody.innerHTML = rows
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(row => `
            <tr>
                <td>${row.inspector}</td>
                <td>${row.vendor}</td>
                <td>${row.stall}</td>
                <td>${row.fresh}</td>
                <td>${row.spoiled}</td>
                <td>${row.date}</td>
            </tr>
        `).join("");
}

function renderTopStalls(stallStats) {
    const container = document.getElementById("topStallsList");
    if (!container) return;

    const topStalls = Object.entries(stallStats)
        .filter(([, stats]) => stats.SPOILED === 0 && stats.FRESH > 0)
        .sort((a, b) => b[1].FRESH - a[1].FRESH)
        .slice(0, 10);

    container.innerHTML = topStalls.map(([stall, stats]) => {
        const width = Math.min(stats.FRESH * 10, 100);
        return `
            <div class="progress-item">
                <span>Stall ${stall}</span>
                <div class="bar"><div style="width:${width}%"></div></div>
            </div>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", loadDashboard);