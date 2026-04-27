import { db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// 🔥 Add Firebase Auth import
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

async function loadProfile() {
    // 1. INJECT SKELETONS FIRST
    const avatarSec = document.getElementById("avatarSection");
    if (avatarSec) {
        avatarSec.innerHTML = `
            <div class="skeleton sk-avatar"></div>
            <div class="skeleton sk-text" style="height: 24px;"></div>
            <div class="skeleton sk-text"></div>
            <div class="skeleton" style="height: 40px; width: 100%; border-radius: 8px; margin-top: 1.5rem;"></div>
        `;
    }

    const detailsSec = document.getElementById("detailsSection");
    if (detailsSec) {
        detailsSec.innerHTML = `
            <h2 style="margin-top: 0; margin-bottom: 1.5rem; color: #111827; font-size: 1.25rem;">Personal Information</h2>
            <div class="form-grid">
                ${Array(4).fill(`
                    <div class="form-group">
                        <div class="skeleton sk-label"></div>
                        <div class="skeleton sk-input"></div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    const auth = getAuth();
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                let currentUser = {
                    fullName: user.displayName || "System Admin",
                    email: user.email || "",
                    jobTitle: "Administrator",
                    phone: user.phoneNumber || "+63 900 000 0000",
                    photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "Admin")}&background=10B981&color=fff&size=120`
                };

                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", currentUser.email));
                const userSnap = await getDocs(q);

                if (!userSnap.empty) {
                    const dbData = userSnap.docs[0].data();
                    
                    currentUser.jobTitle = dbData.jobTitle || currentUser.jobTitle;
                    currentUser.phone = dbData.phone || currentUser.phone;
                    
                    if (dbData.profilePicture) {
                        currentUser.photoURL = dbData.profilePicture;
                    }
                }

                document.getElementById("saveBtn").classList.remove("hidden");

                if (avatarSec) {
                    avatarSec.innerHTML = `
                        <img src="${currentUser.photoURL}" class="avatar-img" alt="Profile" referrerpolicy="no-referrer">
                        <h3 style="margin: 0; color: #111827; font-size: 1.2rem;">${currentUser.fullName}</h3>
                        <span class="role-badge">${currentUser.jobTitle.toUpperCase()}</span>
                        <button class="upload-btn">Change Photo</button>
                    `;
                }

                if (detailsSec) {
                    const nameParts = currentUser.fullName.split(" ");
                    const firstName = nameParts[0] || "";
                    const lastName = nameParts.slice(1).join(" ") || "";

                    detailsSec.innerHTML = `
                        <h2 style="margin-top: 0; margin-bottom: 1.5rem; color: #111827; font-size: 1.25rem;">Personal Information</h2>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>First Name</label>
                                <input type="text" value="${firstName}">
                            </div>
                            <div class="form-group">
                                <label>Last Name</label>
                                <input type="text" value="${lastName}">
                            </div>
                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" value="${currentUser.email}" readonly style="background: #F3F4F6; color: #6B7280; cursor: not-allowed;">
                            </div>
                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="text" value="${currentUser.phone}">
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                console.error("Error loading profile details:", error);
            }
        } else {
            console.log("No user signed in.");
            window.location.href = "index.html"; 
        }
    });
}

window.saveProfile = function() {
    const btn = document.getElementById("saveBtn");
    btn.innerText = "SAVING...";
    
    setTimeout(() => {
        btn.innerText = "SAVED SUCCESSFULLY";
        btn.style.background = "#059669";
        
        setTimeout(() => {
            btn.innerText = "SAVE CHANGES";
            btn.style.background = "#10B981";
        }, 2000);
    }, 800);
};

document.addEventListener("DOMContentLoaded", loadProfile);