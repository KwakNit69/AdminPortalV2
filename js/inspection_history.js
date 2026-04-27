import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allStalls = [];
let allInspections = [];
let currentStall = null;
let currentView = 1; 

async function initPage() {
    try {
        // INJECT SKELETONS FOR VIEW 1
        const grid = document.getElementById("stallGrid");
        if (grid) {
            grid.innerHTML = Array(8).fill(`
                <div class="stall-card">
                    <div class="skeleton sk-avatar"></div>
                    <div class="skeleton sk-title"></div>
                    <div class="skeleton sk-text"></div>
                </div>
            `).join("");
        }

        // FETCH DATA
        const stallSnap = await getDocs(collection(db, "stalls"));
        const inspectSnap = await getDocs(collection(db, "inspections"));

        allStalls = stallSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        allInspections = inspectSnap.docs.map(doc => {
            const data = doc.data();
            let dateStr = "-";
            if (data.timestamp && typeof data.timestamp.toDate === 'function') {
                dateStr = data.timestamp.toDate().toLocaleDateString();
            } else if (data.timestamp) {
                dateStr = new Date(data.timestamp).toLocaleDateString();
            }
            return { id: doc.id, ...data, formattedDate: dateStr };
        });

        renderStallGrid(allStalls);

    } catch (error) {
        console.error("Error loading history data:", error);
    }
}

function renderStallGrid(stalls) {
    const grid = document.getElementById("stallGrid");
    if (!grid) return;

    grid.innerHTML = stalls.map(stall => `
        <div class="stall-card" onclick="openStallHistory('${stall.stallNumber}')">
            <img class="stall-img" src="${stall.stallImageUrl || 'https://via.placeholder.com/80'}" alt="Stall">
            <h3>Stall ${stall.stallNumber}</h3>
            <p>${stall.vendorName || 'Unknown Vendor'}</p>
        </div>
    `).join("");
}

// ==========================================
// VIEW 2: OPEN STALL HISTORY
// ==========================================
window.openStallHistory = function(stallNumber) {
    currentStall = allStalls.find(s => String(s.stallNumber) === String(stallNumber));
    if (!currentStall) return;

    currentView = 2;
    document.getElementById("view1-stalls").classList.add("hidden");
    document.getElementById("view2-history").classList.remove("hidden");
    document.getElementById("view3-details").classList.add("hidden");
    document.getElementById("backBtn").classList.remove("hidden");

    document.getElementById("selectedStallHeader").innerHTML = `
        <img src="${currentStall.stallImageUrl || 'https://via.placeholder.com/70'}">
        <div>
            <h2 style="margin:0 0 5px;">Stall ${currentStall.stallNumber}</h2>
            <p style="margin:0; color:#64748b;">${currentStall.vendorName}</p>
        </div>
    `;

    const stallInspections = allInspections
        .filter(i => String(i.stallNumber) === String(stallNumber))
        .sort((a, b) => new Date(b.formattedDate) - new Date(a.formattedDate));

    const list = document.getElementById("stallHistoryList");
    
    if (stallInspections.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:3rem; color:#94a3b8;">No inspection history found for this stall.</div>`;
        return;
    }

    list.innerHTML = stallInspections.map(insp => {
        let fresh = 0, spoiled = 0;
        (insp.scanHistory || []).forEach(scan => {
            const lbl = (scan.label || "").toLowerCase();
            if (lbl.includes("fresh")) fresh++;
            if (lbl.includes("spoiled")) spoiled++;
        });

        return `
            <div class="history-row" onclick='openInspectionDetails(${JSON.stringify(insp)})'>
                <div class="row-info">
                    <strong>${insp.formattedDate}</strong>
                    <span>Inspector: ${insp.inspectorName || 'Unknown'}</span>
                </div>
                <div class="row-stats">
                    <span class="badge fresh">${fresh} Fresh</span>
                    <span class="badge spoiled">${spoiled} Spoiled</span>
                </div>
            </div>
        `;
    }).join("");
};

// ==========================================
// VIEW 3: OPEN DEEP DETAILS
// ==========================================
window.openInspectionDetails = function(insp) {
    currentView = 3;
    document.getElementById("view2-history").classList.add("hidden");
    document.getElementById("view3-details").classList.remove("hidden");

    let fresh = 0, spoiled = 0;
    const scansHTML = (insp.scanHistory || []).map(scan => {
        const lbl = (scan.label || "").toLowerCase();
        const isFresh = lbl.includes("fresh");
        if (isFresh) fresh++; else spoiled++;

        return `
            <div class="scan-item">
                <span>🥩 ${scan.cut || 'Unknown Cut'}</span>
                <span class="${isFresh ? 'text-fresh' : 'text-spoiled'}">${scan.label}</span>
            </div>
        `;
    }).join("");

    document.getElementById("inspectionDetailCard").innerHTML = `
        <div class="detail-header">
            <h2 style="margin:0 0 10px;">Inspection Details</h2>
            <p style="margin:0; color:#64748b;">Date: ${insp.formattedDate} | Inspector: ${insp.inspectorName}</p>
        </div>
        
        <div style="margin-bottom: 1.5rem; display:flex; gap:1rem;">
            <div class="badge fresh" style="font-size:1rem;">Total Fresh: ${fresh}</div>
            <div class="badge spoiled" style="font-size:1rem;">Total Spoiled: ${spoiled}</div>
        </div>

        <h3 style="margin-bottom:1rem;">Items Scanned:</h3>
        <div class="scan-grid">
            ${scansHTML || '<p>No scans recorded in this session.</p>'}
        </div>
    `;
};

// ==========================================
// NAVIGATION CONTROLLER
// ==========================================
window.goBack = function() {
    if (currentView === 3) {
        currentView = 2;
        document.getElementById("view3-details").classList.add("hidden");
        document.getElementById("view2-history").classList.remove("hidden");
    } else if (currentView === 2) {
        currentView = 1;
        document.getElementById("view2-history").classList.add("hidden");
        document.getElementById("view1-stalls").classList.remove("hidden");
        document.getElementById("backBtn").classList.add("hidden");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", e => {
            const val = e.target.value.toLowerCase();
            const filtered = allStalls.filter(s => 
                String(s.stallNumber).toLowerCase().includes(val) || 
                (s.vendorName || "").toLowerCase().includes(val)
            );
            renderStallGrid(filtered);
        });
    }
    initPage();
});