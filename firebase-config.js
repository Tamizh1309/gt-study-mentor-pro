// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔥 Firebase configuration for project: linguastream-lzxdj
const firebaseConfig = {
  apiKey: "AIzaSyD1iAczyFw9fZDxS2wPSIKwoC18lzReFHg",
  authDomain: "linguastream-lzxdj.firebaseapp.com",
  projectId: "linguastream-lzxdj",
  storageBucket: "linguastream-lzxdj.firebasestorage.app",
  messagingSenderId: "277774555956",
  appId: "1:277774555956:web:14c48c26d7906efdf8e361"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider, signInWithPopup, onAuthStateChanged, signOut, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot, firebaseConfig, app };
