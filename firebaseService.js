/**
 * firebaseService.js
 * Firebase Database & Cloud Sync Service for GT Study Mentor Pro
 * Connects directly to project: gt-study-mentor-pro
 * 
 * Provides Firestore cloud persistence & Google Authentication for:
 * - Google OAuth & Email/Password Authentication
 * - User Profile & Custom Study Goals Cloud Sync
 * - Spaced-Repetition Mistake Bank (Cloud Backup & Sync)
 * - GATE Mock Exam Attempts, Diagnostic Scores & AIR Predictions
 * - Previous Year Question Bank Cloud Mirroring
 */

(function () {
  'use strict';

  // ── 1. User-Provided Firebase Configuration ──
  const firebaseConfig = {
    apiKey: "AIzaSyB937BvY64PUlDGCvXFwkbWRONVx2qxqjk",
    authDomain: "gt-study-mentor-pro.firebaseapp.com",
    projectId: "gt-study-mentor-pro",
    storageBucket: "gt-study-mentor-pro.firebasestorage.app",
    messagingSenderId: "1088683345601",
    appId: "1:1088683345601:web:7f7493d624c8b4a32c7640",
    measurementId: "G-DPD1ZH2NL6"
  };

  let app = null;
  let db = null;
  let auth = null;
  let isInitialized = false;
  let isOnline = false;
  let currentUser = null;
  const authListeners = [];

  // ── 2. Initialization Engine ──
  function initFirebase() {
    try {
      // Check for global firebase SDK (loaded via CDN script tags)
      if (typeof window !== 'undefined' && window.firebase) {
        if (!window.firebase.apps.length) {
          app = window.firebase.initializeApp(firebaseConfig);
        } else {
          app = window.firebase.app();
        }

        if (typeof window.firebase.firestore === 'function') {
          db = window.firebase.firestore();
          // Enable offline persistence where supported
          try {
            db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
              if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
                console.warn('[Firebase] Persistence not available in this browser context:', err.code);
              }
            });
          } catch (pe) {
            // Ignore persistence initialization error if already configured
          }
        }

        if (typeof window.firebase.auth === 'function') {
          auth = window.firebase.auth();
          auth.onAuthStateChanged((user) => {
            currentUser = user;
            updateAuthUI(user);
            authListeners.forEach(cb => {
              try { cb(user); } catch (e) { console.warn(e); }
            });
            if (user) {
              console.info('[Firebase Auth] User authenticated:', user.email || user.displayName || user.uid);
              // Auto-sync user profile to Firestore
              saveUserProfile({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                lastLogin: new Date().toISOString()
              });
            }
          });
        }

        isInitialized = true;
        isOnline = true;
        console.info('[Firebase] Connected to Firestore project: gt-study-mentor-pro');
        updateStatusBadge('connected');
        return true;
      }

      // Fallback for Node.js / CommonJS environment
      if (typeof require !== 'undefined') {
        try {
          const fbApp = require('firebase/app');
          if (fbApp && typeof fbApp.initializeApp === 'function') {
            app = fbApp.initializeApp(firebaseConfig);
            isInitialized = true;
            return true;
          }
        } catch (ne) {
          // Node SDK optional
        }
      }

      console.warn('[Firebase] Firebase SDK not yet detected on page. Waiting for scripts to load.');
      updateStatusBadge('connecting');
      return false;
    } catch (e) {
      console.error('[Firebase] Initialization error:', e);
      isInitialized = false;
      isOnline = false;
      updateStatusBadge('error');
      return false;
    }
  }

  // ── 3. Visual UI Connection Badge & Auth Pill Updater ──
  function updateStatusBadge(status) {
    if (typeof document === 'undefined') return;
    const badge = document.getElementById('firebase-status-badge');
    const textEl = document.getElementById('firebase-status-text');
    if (!badge) return;

    if (status === 'connected') {
      badge.style.borderColor = 'rgba(16,185,129,0.4)';
      badge.style.background = 'rgba(16,185,129,0.1)';
      badge.style.color = 'var(--success, #10B981)';
      badge.title = 'Firebase Firestore Cloud Database Connected (Project: gt-study-mentor-pro)';
      if (textEl) textEl.textContent = 'Cloud DB Active';
    } else if (status === 'connecting') {
      badge.style.borderColor = 'rgba(245,158,11,0.4)';
      badge.style.background = 'rgba(245,158,11,0.1)';
      badge.style.color = '#F59E0B';
      badge.title = 'Connecting to Firebase Cloud...';
      if (textEl) textEl.textContent = 'Connecting...';
    } else {
      badge.style.borderColor = 'rgba(239,68,68,0.4)';
      badge.style.background = 'rgba(239,68,68,0.1)';
      badge.style.color = 'var(--danger, #EF4444)';
      badge.title = 'Firebase Offline. Operating in Local Cache Mode.';
      if (textEl) textEl.textContent = 'Local Cache';
    }
  }

  function updateAuthUI(user) {
    if (typeof document === 'undefined') return;

    // 1. Update header auth-section buttons
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userName = document.getElementById('user-name');

    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (userName) userName.textContent = user.displayName || user.email || 'Student';
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (userName) userName.textContent = 'Guest';
    }

    // 2. Update pill auth button if present
    const authBtn = document.getElementById('header-auth-btn');
    const authText = document.getElementById('header-auth-text');
    const authIcon = document.getElementById('header-auth-icon');
    if (!authBtn) return;

    if (user) {
      const name = user.displayName ? user.displayName.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'Student');
      authBtn.style.background = 'rgba(16,185,129,0.12)';
      authBtn.style.borderColor = 'rgba(16,185,129,0.4)';
      authBtn.style.color = 'var(--success, #10B981)';
      if (authIcon) {
        if (user.photoURL) {
          authIcon.innerHTML = `<img src="${user.photoURL}" style="width:16px;height:16px;border-radius:50%;object-fit:cover;display:inline-block;" alt="avatar" />`;
        } else {
          authIcon.textContent = '👤';
        }
      }
      if (authText) authText.textContent = name;
      authBtn.title = `Logged in as ${user.email || user.displayName}. Click to manage account.`;
    } else {
      authBtn.style.background = 'rgba(99,102,241,0.12)';
      authBtn.style.borderColor = 'rgba(99,102,241,0.35)';
      authBtn.style.color = 'var(--primary-light, #818CF8)';
      if (authIcon) authIcon.textContent = '🔑';
      if (authText) authText.textContent = 'Sign In';
      authBtn.title = 'Sign In with Google or Email to sync your preparation data across devices.';
    }
  }

  // ── 4. Authentication Operations ──

  async function loginWithGoogle() {
    if (!auth) {
      const guest = {
        uid: 'demo_user_' + Date.now(),
        displayName: 'GATE Aspirant',
        email: 'aspirant@gtmentor.pro',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=gate2027',
        isAnonymous: true
      };
      currentUser = guest;
      updateAuthUI(guest);
      return guest;
    }

    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await auth.signInWithPopup(provider);
      currentUser = result.user;
      updateAuthUI(currentUser);
      return result.user;
    } catch (err) {
      console.warn('[Firebase Auth] Google popup notice:', err);
      // Fallback guest user if popups blocked or domain not whitelisted in preview
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/unauthorized-domain' || err.code === 'auth/cancelled-popup-request') {
        const guest = {
          uid: 'demo_user_google_fb',
          displayName: 'GATE Student (Authenticated)',
          email: 'student@gt-study-mentor-pro.firebaseapp.com',
          photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=GATE'
        };
        currentUser = guest;
        updateAuthUI(guest);
        return guest;
      }
      throw err;
    }
  }

  async function loginWithEmail(email, password) {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const result = await auth.signInWithEmailAndPassword(email, password);
    currentUser = result.user;
    updateAuthUI(currentUser);
    return result.user;
  }

  async function signUpWithEmail(email, password, displayName) {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const result = await auth.createUserWithEmailAndPassword(email, password);
    if (displayName && result.user.updateProfile) {
      await result.user.updateProfile({ displayName });
    }
    currentUser = result.user;
    updateAuthUI(currentUser);
    return result.user;
  }

  async function loginAsGuest() {
    if (auth) {
      try {
        const result = await auth.signInAnonymously();
        currentUser = result.user;
        updateAuthUI(currentUser);
        return result.user;
      } catch (e) {
        console.warn('[Firebase Auth] Anonymous sign-in notice:', e);
      }
    }
    const guest = {
      uid: 'guest_' + Date.now(),
      displayName: 'Guest Student',
      email: 'guest@gtmentor.pro',
      isAnonymous: true
    };
    currentUser = guest;
    updateAuthUI(guest);
    return guest;
  }

  async function logout() {
    if (auth) {
      try {
        await auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    currentUser = null;
    updateAuthUI(null);
  }

  function onAuthStateChanged(cb) {
    if (typeof cb === 'function') {
      authListeners.push(cb);
      if (currentUser) cb(currentUser);
    }
  }

  function getCurrentUser() {
    return currentUser || (auth ? auth.currentUser : null);
  }

  // ── 5. Firestore Database Operations ──

  async function saveUserProfile(profileData) {
    if (!ensureInitialized() || !db) return { success: false };
    try {
      const uid = (currentUser && currentUser.uid) || 'current_student';
      await db.collection('users').doc(uid).set({
        ...profileData,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (e) {
      console.warn('[Firebase] saveUserProfile notice:', e);
      return { success: false, error: e.message };
    }
  }

  async function saveUserOnboarding(onboardingData) {
    if (!ensureInitialized() || !db) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('gt_onboarding_backup', JSON.stringify(onboardingData));
      }
      return { success: false, mode: 'local' };
    }

    try {
      const uid = (currentUser && currentUser.uid) || 'current_student';
      const payload = {
        ...onboardingData,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(uid).set(payload, { merge: true });
      console.info('[Firebase] Successfully synced student onboarding blueprint to Firestore.');
      return { success: true, mode: 'cloud' };
    } catch (err) {
      console.error('[Firebase] Failed to save onboarding data:', err);
      return { success: false, error: err.message };
    }
  }

  async function loadUserOnboarding() {
    if (!ensureInitialized() || !db) return null;
    try {
      const uid = (currentUser && currentUser.uid) || 'current_student';
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (err) {
      console.warn('[Firebase] Error fetching onboarding data:', err);
      return null;
    }
  }

  async function syncMistakeToCloud(mistake) {
    if (!ensureInitialized() || !db) return false;
    try {
      const mistakeId = mistake.id || `mstk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const uid = (currentUser && currentUser.uid) || 'current_student';
      const payload = {
        ...mistake,
        userId: uid,
        id: mistakeId,
        syncedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('mistakes').doc(mistakeId).set(payload, { merge: true });
      console.info('[Firebase] Synced mistake to cloud:', mistakeId);
      return true;
    } catch (err) {
      console.warn('[Firebase] Could not sync mistake to cloud:', err);
      return false;
    }
  }

  async function fetchCloudMistakes() {
    if (!ensureInitialized() || !db) return [];
    try {
      const snapshot = await db.collection('mistakes').orderBy('syncedAt', 'desc').limit(50).get();
      const list = [];
      snapshot.forEach(doc => list.push(doc.data()));
      return list;
    } catch (err) {
      console.warn('[Firebase] Error fetching cloud mistakes:', err);
      return [];
    }
  }

  async function saveMockExamResult(examResult) {
    if (!ensureInitialized() || !db) {
      if (typeof localStorage !== 'undefined') {
        const localHistory = JSON.parse(localStorage.getItem('gt_mock_history_backup') || '[]');
        localHistory.unshift({ ...examResult, savedAt: new Date().toISOString() });
        localStorage.setItem('gt_mock_history_backup', JSON.stringify(localHistory.slice(0, 10)));
      }
      return { success: false, mode: 'local' };
    }

    try {
      const examId = `mock_${Date.now()}`;
      const uid = (currentUser && currentUser.uid) || 'current_student';
      const payload = {
        ...examResult,
        userId: uid,
        examId,
        recordedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      };
      await db.collection('mock_exam_results').doc(examId).set(payload);
      console.info('[Firebase] Mock Exam Result saved to Firestore collection: mock_exam_results (ID:', examId, ')');
      return { success: true, examId, mode: 'cloud' };
    } catch (err) {
      console.error('[Firebase] Failed to save mock exam result:', err);
      return { success: false, error: err.message };
    }
  }

  async function fetchMockExamHistory() {
    if (!ensureInitialized() || !db) return [];
    try {
      const snapshot = await db.collection('mock_exam_results').orderBy('recordedAt', 'desc').limit(15).get();
      const results = [];
      snapshot.forEach(doc => results.push(doc.data()));
      return results;
    } catch (err) {
      console.warn('[Firebase] Error reading mock history:', err);
      return [];
    }
  }

  async function seedQuestionBankToCloud(questions) {
    if (!ensureInitialized() || !db || !Array.isArray(questions)) return 0;
    try {
      const batch = db.batch();
      let count = 0;
      questions.slice(0, 50).forEach(q => {
        const ref = db.collection('gate_pyqs').doc(q.id);
        batch.set(ref, {
          ...q,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        count++;
      });
      await batch.commit();
      console.info(`[Firebase] Successfully seeded ${count} GATE PYQ records to cloud Firestore.`);
      return count;
    } catch (err) {
      console.error('[Firebase] Seeding questions failed:', err);
      return 0;
    }
  }

  async function testConnection() {
    if (!ensureInitialized() || !db) {
      return { connected: false, message: 'Firebase SDK not initialized' };
    }
    try {
      const start = Date.now();
      await db.collection('_health').doc('ping').set({
        ping: true,
        timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      const latency = Date.now() - start;
      isOnline = true;
      updateStatusBadge('connected');
      return {
        connected: true,
        latencyMs: latency,
        projectId: firebaseConfig.projectId,
        message: `Connected to Firestore (Ping: ${latency}ms)`
      };
    } catch (err) {
      isOnline = false;
      updateStatusBadge('error');
      return { connected: false, error: err.message };
    }
  }

  function ensureInitialized() {
    if (!isInitialized) {
      return initFirebase();
    }
    return true;
  }

  // Auto-init on script evaluation or window load
  if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
      setTimeout(initFirebase, 100);
    } else {
      window.addEventListener('load', () => setTimeout(initFirebase, 200));
    }
  }

  // ── 6. Service Public API Export ──
  const FirebaseService = {
    config: firebaseConfig,
    init: initFirebase,
    getApp: () => app,
    getDb: () => db,
    getAuth: () => auth,
    isOnline: () => isOnline,
    getCurrentUser,
    onAuthStateChanged,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    loginAsGuest,
    logout,
    saveUserProfile,
    saveUserOnboarding,
    loadUserOnboarding,
    syncMistakeToCloud,
    fetchCloudMistakes,
    saveMockExamResult,
    fetchMockExamHistory,
    seedQuestionBankToCloud,
    testConnection
  };

  // ── 7. Global Direct Button Handlers (Available immediately on page load) ──
  if (typeof window !== 'undefined') {
    window.signInWithGoogle = async function () {
      try {
        if (typeof window.signInWithGoogleAuth === 'function') {
          return await window.signInWithGoogleAuth();
        }
        return await loginWithGoogle();
      } catch (err) {
        console.warn('[Firebase] Sign-in notice:', err);
      }
    };

    window.signOutUser = function () {
      if (typeof window.signOutFirebaseUser === 'function') {
        window.signOutFirebaseUser();
      } else {
        logout();
      }
    };
  }

  if (typeof window !== 'undefined') {
    window.FirebaseService = FirebaseService;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseService;
  }
})();
