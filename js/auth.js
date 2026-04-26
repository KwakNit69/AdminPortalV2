import { auth } from "./firebase-config.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* LOGIN */
window.login = function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "admin" && password === "admin") {
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials");
    }
};

/* GOOGLE LOGIN */
window.googleLogin = async function() {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
};

/* 🔥 FORCE GLOBAL LOGOUT */
window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (e) {
        console.error("Logout error:", e);
    }
};

export async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}