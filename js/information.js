import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let inspections = [];

async function loadPage() {
    const userSnap = await getDocs(collection(db, "users"));
    const stallSnap = await getDocs(collection(db, "stalls"));
    const inspectSnap = await getDocs(collection(db, "inspections"));

    inspections = inspectSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));

    renderInspectors(userSnap);
    renderStalls(stallSnap);
}

function renderInspectors(snapshot) {
    const tbody = document.getElementById("inspectorTableBody");

    tbody.innerHTML = snapshot.docs.map(docSnap => {
        const data = docSnap.data();

        return `
            <tr>
                <td>
                    <span class="clickable" onclick="showInspector('${data.fullName}')">
                        ${data.fullName}
                    </span>
                </td>
                <td>${data.jobTitle}</td>
            </tr>
        `;
    }).join("");
}

function renderStalls(snapshot) {
    const tbody = document.getElementById("stallTableBody");

    tbody.innerHTML = snapshot.docs.map(docSnap => {
        const data = docSnap.data();

        return `
            <tr>
                <td>
                    <span class="clickable" onclick="showStall('${data.stallNumber}')">
                        ${data.stallNumber}
                    </span>
                </td>
                <td>${data.vendorName}</td>
            </tr>
        `;
    }).join("");
}

/* =========================
   MODAL HELPERS
========================= */
window.openModal = function(content) {
    document.getElementById("modalContent").innerHTML = content;
    document.getElementById("modalOverlay").classList.remove("hidden");
};

window.closeModal = function() {
    document.getElementById("modalOverlay").classList.add("hidden");
};

/* =========================
   INSPECTOR POPUP
========================= */
window.showInspector = function(name) {
    const sessions = inspections.filter(
        i => i.inspectorName === name
    );

    openModal(`
        <div class="profile-header">
            <img src="https://via.placeholder.com/90">
            <div>
                <h2>${name}</h2>
                <p>Total Sessions: ${sessions.length}</p>
            </div>
        </div>

        <h3>Inspection Sessions</h3>

        ${sessions.map(s => `
            <div class="session-item">
                <strong>${s.vendorName}</strong><br>
                Stall: ${s.stallNumber}<br>
                Date: ${
                    s.timestamp?.toDate
                        ? s.timestamp.toDate().toLocaleDateString()
                        : "-"
                }
                <br>
                <button class="delete-btn" onclick="deleteOne('${s.id}')">
                    Delete
                </button>
            </div>
        `).join("")}

        <button class="delete-btn" onclick="deleteAllInspector('${name}')">
            Delete All Sessions
        </button>

        <button class="close-btn" onclick="closeModal()">
            Close
        </button>
    `);
};

/* =========================
   STALL POPUP
========================= */
window.showStall = async function(stallNumber) {
    const stallSnapshot = await getDocs(collection(db, "stalls"));
    let stallData = null;

    stallSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (String(data.stallNumber) === String(stallNumber)) {
            stallData = data;
        }
    });

    const sessions = inspections.filter(
        i => String(i.stallNumber) === String(stallNumber)
    );

    openModal(`
        <div class="profile-header">
            <img src="${
                stallData?.stallImageUrl ||
                "https://via.placeholder.com/90"
            }">
            <div>
                <h2>Stall ${stallNumber}</h2>
                <p>Vendor: ${stallData?.vendorName || "Unknown"}</p>
                <p>Total Sessions: ${sessions.length}</p>
            </div>
        </div>

        <h3>Inspection Sessions</h3>

        ${sessions.map(s => `
            <div class="session-item">
                <strong>${s.vendorName}</strong><br>
                Inspector: ${s.inspectorName}<br>
                Date: ${
                    s.timestamp?.toDate
                        ? s.timestamp.toDate().toLocaleDateString()
                        : "-"
                }
                <br>
                <button class="delete-btn" onclick="deleteOne('${s.id}')">
                    Delete
                </button>
            </div>
        `).join("")}

        <button class="delete-btn" onclick="deleteAllStall('${stallNumber}')">
            Delete All Sessions
        </button>

        <button class="close-btn" onclick="closeModal()">
            Close
        </button>
    `);
};

/* =========================
   DELETE FUNCTIONS
========================= */
window.deleteOne = async function(id) {
    await deleteDoc(doc(db, "inspections", id));
    location.reload();
};

window.deleteAllInspector = async function(name) {
    const targets = inspections.filter(i => i.inspectorName === name);

    for (const row of targets) {
        await deleteDoc(doc(db, "inspections", row.id));
    }

    location.reload();
};

window.deleteAllStall = async function(stallNumber) {
    const targets = inspections.filter(
        i => String(i.stallNumber) === String(stallNumber)
    );

    for (const row of targets) {
        await deleteDoc(doc(db, "inspections", row.id));
    }

    location.reload();
};

loadPage();