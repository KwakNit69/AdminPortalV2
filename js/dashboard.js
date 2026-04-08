import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let qualityChart = null;

async function loadDashboard() {
    const snapshot = await getDocs(collection(db, "inspections"));

    let totalInspections = snapshot.size;
    let fresh = 0;
    let spoiled = 0;
    let vendors = new Set();

    const stallStats = {};
    const dailyStats = {};
    const recentRows = [];

    snapshot.forEach(doc => {
        const data = doc.data();

        if (data.vendorName) {
            vendors.add(data.vendorName);
        }

        const stall = data.stallNumber || "Unknown";

        if (!stallStats[stall]) {
            stallStats[stall] = {
                fresh: 0,
                spoiled: 0
            };
        }

        let day = "Unknown";
        let formattedDate = "-";

        if (data.timestamp?.toDate) {
            const dateObj = data.timestamp.toDate();
            day = dateObj.toLocaleDateString();
            formattedDate = day;
        }

        if (!dailyStats[day]) {
            dailyStats[day] = { fresh: 0, spoiled: 0 };
        }

        let freshCount = 0;
        let spoiledCount = 0;

        if (data.scanHistory) {
            data.scanHistory.forEach(scan => {
                if (scan.label === "Fresh") {
                    fresh++;
                    freshCount++;
                    dailyStats[day].fresh++;
                    stallStats[stall].fresh++;
                }

                if (scan.label === "Spoiled") {
                    spoiled++;
                    spoiledCount++;
                    dailyStats[day].spoiled++;
                    stallStats[stall].spoiled++;
                }
            });
        }

        recentRows.push({
            inspector: data.inspectorName || "Unknown",
            vendor: data.vendorName || "Unknown",
            stall,
            fresh: freshCount,
            spoiled: spoiledCount,
            date: formattedDate
        });
    });

    // KPI updates
    document.getElementById("totalInspections").textContent = totalInspections;
    document.getElementById("freshScans").textContent = fresh;
    document.getElementById("spoiledScans").textContent = spoiled;
    document.getElementById("totalVendors").textContent = vendors.size;

    // chart
    renderTrendChart(dailyStats);

    // recent inspections table
    renderRecentInspections(recentRows);

    // top clean stalls
    renderTopStalls(stallStats);
}

function renderTrendChart(dailyStats) {
    const labels = Object.keys(dailyStats).sort(
        (a, b) => new Date(a) - new Date(b)
    );

    const freshData = labels.map(day => dailyStats[day].fresh);
    const spoiledData = labels.map(day => dailyStats[day].spoiled);

    const ctx = document.getElementById("qualityTrendChart");

    if (!ctx) return;

    // prevent duplicate chart rendering
    if (qualityChart) {
        qualityChart.destroy();
    }

    qualityChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Fresh",
                    data: freshData,
                    backgroundColor: "#22c55e",
                    borderRadius: 6
                },
                {
                    label: "Spoiled",
                    data: spoiledData,
                    backgroundColor: "#ef4444",
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top"
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
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
        `)
        .join("");
}

function renderTopStalls(stallStats) {
    const container = document.getElementById("topStallsList");

    if (!container) return;

    const topStalls = Object.entries(stallStats)
        .filter(([stall, stats]) => stats.spoiled === 0 && stats.fresh > 0)
        .sort((a, b) => b[1].fresh - a[1].fresh)
        .slice(0, 10);

    container.innerHTML = topStalls
        .map(([stall, stats]) => {
            const width = Math.min(stats.fresh * 10, 100);

            return `
                <div class="progress-item">
                    <span>Stall ${stall}</span>
                    <div class="bar">
                        <div style="width:${width}%"></div>
                    </div>
                </div>
            `;
        })
        .join("");
}

loadDashboard();