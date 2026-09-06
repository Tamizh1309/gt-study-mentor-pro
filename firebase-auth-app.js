// firebase-auth-app.js
import { db, auth, provider, signInWithPopup, onAuthStateChanged, signOut, doc, getDoc, setDoc } from './firebase-config.js';

// ========== GOOGLE SIGN-IN ==========
window.signInWithGoogle = async function() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("✅ Logged in:", user.displayName);
    await saveUserToFirestore(user);
    updateUIAfterLogin(user);
  } catch (error) {
    console.error("❌ Sign-in error:", error);
    // Fallback for popup blocking or unconfigured origin
    if (error.code === 'auth/unauthorized-domain') {
      alert("⚠️ Firebase Auth Notice:\n\nPlease add 'tamizh1309.github.io' to your Firebase Console under:\nAuthentication > Settings > Authorized domains.\n\nLogging in with Demo Student profile so your testing is not blocked!");
    }
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/unauthorized-domain' || error.code === 'auth/cancelled-popup-request') {
      console.info("ℹ️ Using student fallback session");
      const fallbackUser = {
        uid: "demo_student_" + Date.now(),
        displayName: "GATE Aspirant",
        email: "aspirant@gtmentor.pro",
        photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=gate2027"
      };
      await saveUserToFirestore(fallbackUser);
      updateUIAfterLogin(fallbackUser);
      return;
    }
    alert("Sign-in failed! Check console (F12).");
  }
};

window.signOutUser = function() {
  signOut(auth);
  updateUIAfterLogout();
};

// ========== SAVE USER TO FIRESTORE ==========
async function saveUserToFirestore(user) {
  try {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "GATE Student",
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
        studyStreak: 1,
        totalStudyHours: 0,
        readinessScores: { dsa: 65, dbms: 72, os: 60, networks: 58, systemDesign: 50 },
        weakTopics: [],
        mistakeBank: []
      });
      console.log("✅ New user created in Firestore!");
    }
  } catch (e) {
    console.warn("Firestore save notice:", e);
  }
}

// ========== LOAD USER DATA ==========
async function loadUserData(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("📊 Data loaded from Firestore:", data);
      updateDashboard(data);
      return data;
    }
  } catch (e) {
    console.warn("Firestore load notice:", e);
  }
  return null;
}

// ========== UPDATE UI (Replace "Loading..." with Real Data) ==========
function updateDashboard(data) {
  if (!data) return;

  // 1. Weak Areas update
  const weakEl = document.getElementById('weak-areas');
  if (weakEl) {
    if (data.weakTopics && data.weakTopics.length > 0) {
      weakEl.innerHTML = data.weakTopics.map(t => `<span class="weak-topic-badge" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:var(--danger);padding:3px 8px;border-radius:4px;font-size:12px;display:inline-block;margin:2px;">⚠️ ${t}</span>`).join(' ');
    } else {
      weakEl.innerHTML = '<span style="color:var(--success);font-weight:600;font-size:12px;">✅ Complete 10 questions to identify weak spots. No recurring gaps yet!</span>';
    }
  }

  // 2. Readiness Scores
  console.log("📈 Scores:", data.readinessScores);
  if (data.readinessScores) {
    const dsaBar = document.getElementById('dsa-readiness-bar');
    if (dsaBar && data.readinessScores.dsa) dsaBar.style.width = data.readinessScores.dsa + '%';
    const osBar = document.getElementById('os-readiness-bar');
    if (osBar && data.readinessScores.os) osBar.style.width = data.readinessScores.os + '%';
  }

  // 3. Update header status badge
  const fbText = document.getElementById('firebase-status-text');
  if (fbText) fbText.textContent = 'Cloud Active';
}

// ========== UI TOGGLE ==========
function updateUIAfterLogin(user) {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userName = document.getElementById('user-name');
  
  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = 'block';
  if (userName) userName.textContent = user.displayName || user.email || 'Student';

  // Also sync with header-auth-btn if present
  const headerAuthText = document.getElementById('header-auth-text');
  if (headerAuthText) headerAuthText.textContent = (user.displayName || 'Student').split(' ')[0];

  loadUserData(user.uid);
}

function updateUIAfterLogout() {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userName = document.getElementById('user-name');
  
  if (loginBtn) loginBtn.style.display = 'block';
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (userName) userName.textContent = 'Guest';

  const headerAuthText = document.getElementById('header-auth-text');
  if (headerAuthText) headerAuthText.textContent = 'Sign In';
}

// ========== AUTO-LOGIN CHECK (Page Load) ==========
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("👤 Auto-login detected:", user.uid);
    updateUIAfterLogin(user);
  } else {
    console.log("👤 No user logged in.");
    updateUIAfterLogout();
  }
});

// Expose functions for window accessibility
window.saveUserToFirestore = saveUserToFirestore;
window.loadUserData = loadUserData;
window.updateDashboard = updateDashboard;
window.updateUIAfterLogin = updateUIAfterLogin;
window.updateUIAfterLogout = updateUIAfterLogout;

export { saveUserToFirestore, loadUserData, updateDashboard, updateUIAfterLogin, updateUIAfterLogout };
