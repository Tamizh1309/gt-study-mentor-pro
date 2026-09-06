// firebase-auth-app.js
import { db, auth, provider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, doc, getDoc, setDoc } from './firebase-config.js';

// Check Redirect Result upon page load (handles redirect auth flow)
if (typeof window !== 'undefined') {
  try {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          console.log("✅ Redirect sign-in success:", result.user.displayName);
          await saveUserToFirestore(result.user);
          updateUIAfterLogin(result.user);
        }
      })
      .catch((err) => {
        if (err.code && err.code !== 'auth/credential-already-in-use') {
          console.info("Redirect verification:", err.code);
        }
      });
  } catch (redirectInitErr) {
    console.info("Redirect init notice:", redirectInitErr);
  }
}

// ========== GOOGLE SIGN-IN ==========
window.signInWithGoogle = async function() {
  try {
    // Attempt standard popup sign-in
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("✅ Logged in:", user.displayName);
    await saveUserToFirestore(user);
    updateUIAfterLogin(user);
  } catch (error) {
    if (error.code === 'auth/unauthorized-domain') {
      alert("⚠️ Firebase Auth Notice:\n\nPlease add 'tamizh1309.github.io' to your Firebase Console under:\nAuthentication > Settings > Authorized domains.");
      return;
    }
    // If popup is blocked, cancelled, or restricted by COOP, trigger redirect sign-in seamlessly
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.info("ℹ️ Popup restricted by browser security policies. Transitioning to Google Redirect Sign-In...");
      try {
        await signInWithRedirect(auth, provider);
        return;
      } catch (redirectErr) {
        console.warn("Redirect sign-in notice:", redirectErr);
      }
    }
    console.warn("Sign-in notice:", error.message || error);
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

  // 2. Readiness Scores & Orbs Grid
  console.log("📈 Scores:", data.readinessScores);
  if (data.readinessScores) {
    const scores = data.readinessScores;
    const orbsContainer = document.getElementById('readiness-orbs-container');
    if (orbsContainer) {
      const subjects = [
        { key: 'dsa', name: 'DSA & Algorithms', score: scores.dsa ?? 65, icon: '⚡', color: '#6366F1' },
        { key: 'dbms', name: 'DBMS & SQL', score: scores.dbms ?? 72, icon: '🗄️', color: '#10B981' },
        { key: 'os', name: 'Operating Systems', score: scores.os ?? 60, icon: '💻', color: '#F59E0B' },
        { key: 'networks', name: 'Computer Networks', score: scores.networks ?? scores.cn ?? 58, icon: '🌐', color: '#38BDF8' },
        { key: 'systemDesign', name: 'System Design', score: scores.systemDesign ?? 50, icon: '🏗️', color: '#EC4899' }
      ];
      orbsContainer.innerHTML = subjects.map(s => `
        <div class="readiness-orb-card" style="background:var(--depth-2);border:1px solid var(--border-subtle);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:6px;">
              <span>${s.icon}</span> <span>${s.name}</span>
            </span>
            <span class="skill-score" data-topic="${s.key}" style="font-size:14px;font-weight:800;color:${s.color};font-family:var(--font-mono);">${s.score}%</span>
          </div>
          <div style="background:var(--depth-4);border-radius:var(--radius-full);height:6px;overflow:hidden;">
            <div id="${s.key}-readiness-bar" style="height:100%;background:${s.color};border-radius:var(--radius-full);width:${s.score}%;transition:width 0.8s ease;"></div>
          </div>
          <div style="font-size:10px;color:var(--text-muted);display:flex;justify-content:space-between;">
            <span>Firestore Sync</span>
            <span style="color:var(--success);font-weight:600;">Active</span>
          </div>
        </div>
      `).join('');
    }

    // Update .skill-score elements with data-topic
    document.querySelectorAll('.skill-score').forEach(el => {
      const topic = el.dataset.topic;
      if (topic && data.readinessScores[topic] !== undefined) {
        el.textContent = data.readinessScores[topic] + '%';
      }
    });

    const dsaBar = document.getElementById('dsa-readiness-bar');
    if (dsaBar && data.readinessScores.dsa) dsaBar.style.width = data.readinessScores.dsa + '%';
    const osBar = document.getElementById('os-readiness-bar');
    if (osBar && data.readinessScores.os) osBar.style.width = data.readinessScores.os + '%';
    const dbmsBar = document.getElementById('dbms-readiness-bar');
    if (dbmsBar && data.readinessScores.dbms) dbmsBar.style.width = data.readinessScores.dbms + '%';
    const cnBar = document.getElementById('cn-readiness-bar');
    if (cnBar && (data.readinessScores.networks || data.readinessScores.cn)) {
      cnBar.style.width = (data.readinessScores.networks || data.readinessScores.cn) + '%';
    }
  }

  // 3. User Study Streak & Hours update
  if (data.studyStreak !== undefined) {
    const streakBadges = document.querySelectorAll('.streak-count, #user-streak-display');
    streakBadges.forEach(el => el.textContent = data.studyStreak + ' Days');
  }

  // 4. Update header status badge
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
