import { db } from "./firebase-config.js";
import {
  collection,
 getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadInformation() {
    await loadInspectors();
    await loadStalls();
}

// 👥 LOAD INSPECTORS FROM users
async function loadInspectors() {
    const snapshot = await getDocs(collection(db, "users"));
    const tbody = document.getElementById("inspectorTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();

        tbody.innerHTML += `
            <tr>
                <td>${data.fullName || "Unknown Inspector"}</td>
                <td>${data.jobTitle || "Inspector"}</td>
            </tr>
        `;
    });
}

// 🏪 LOAD STALLS
async function loadStalls() {
    const snapshot = await getDocs(collection(db, "stalls"));
    const tbody = document.getElementById("stallTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();

        tbody.innerHTML += `
            <tr>
                <td>${data.stallNumber || "-"}</td>
                <td>${data.vendorName || "Unknown Vendor"}</td>
            </tr>
        `;
    });
}

loadInformation();