import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2c1f9guIlAXOiDTIUKyIXF-kGfl3xgDk",
  authDomain: "qualimeatdb.firebaseapp.com",
  projectId: "qualimeatdb",
  storageBucket: "qualimeatdb.firebasestorage.app",
  messagingSenderId: "247856692336",
  appId: "1:247856692336:web:e39f42000af793a7a308b5"
};

const app = initializeApp(firebaseConfig);

/* ✅ EXPORT BOTH */
export const auth = getAuth(app);
export const db = getFirestore(app);