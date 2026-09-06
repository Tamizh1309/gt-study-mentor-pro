// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔥 Firebase configuration for official project: gt-study-mentor-pro
const firebaseConfig = {
  apiKey: "AIzaSyB937BvY64PUlDGCvXFwkbWRONVx2qxqjk",
  authDomain: "gt-study-mentor-pro.firebaseapp.com",
  projectId: "gt-study-mentor-pro",
  storageBucket: "gt-study-mentor-pro.firebasestorage.app",
  messagingSenderId: "1088683345601",
  appId: "1:1088683345601:web:7f7493d624c8b4a32c7640",
  measurementId: "G-DPD1ZH2NL6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot, firebaseConfig, app };
