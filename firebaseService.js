/**
 * firebaseService.js
 * Firebase Database & Cloud Sync Service for GT Study Mentor Pro
 * Connects directly to project: linguastream-lzxdj
 * 
 * Provides Firestore cloud persistence for:
 * - User Onboarding Profile & Custom Study Goals
 * - Spaced-Repetition Mistake Bank (Cloud Backup & Sync)
 * - GATE Mock Exam Attempts, Diagnostic Scores & AIR Predictions
 * - Previous Year Question Bank Cloud Mirroring
 */

(function () {
  'use strict';

  // ── 1. User-Provided Firebase Configuration ──
  const firebaseConfig = {
    apiKey: "AIzaSyD1iAczyFw9fZDxS2wPSIKwoC18lzReFHg",
    authDomain: "linguastream-lzxdj.firebaseapp.com",
    projectId: "linguastream-lzxdj",
    storageBucket: "linguastream-lzxdj.firebasestorage.app",
    messagingSenderId: "277774555956",
    appId: "1:277774555956:web:14c48c26d7906efdf8e361"
  };

  let app = null;
  let db = null;
  let auth = null;
  let isInitialized = false;
  let isOnline = false;

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
        }

        isInitialized = true;
        isOnline = true;
        console.info('[Firebase] Connected to Firestore project: linguastream-lzxdj');
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

  // ── 3. Visual UI Connection Badge Updater ──
  function updateStatusBadge(status) {
    if (typeof document === 'undefined') return;
    const badge = document.getElementById('firebase-status-badge');
    const textEl = document.getElementById('firebase-status-text');
    if (!badge) return;

    if (status === 'connected') {
      badge.style.borderColor = 'rgba(16,185,129,0.4)';
      badge.style.background = 'rgba(16,185,129,0.1)';
      badge.style.color = 'var(--success, #10B981)';
      badge.title = 'Firebase Firestore Cloud Database Connected (Project: linguastream-lzxdj)';
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

  // ── 4. Firestore Database Operations ──

  /**
   * Save User Onboarding Preferences to Cloud
   */
  async function saveUserOnboarding(onboardingData) {
    if (!ensureInitialized() || !db) {
      console.warn('[Firebase] Firestore not active. Falling back to localStorage.');
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('gt_onboarding_backup', JSON.stringify(onboardingData));
      }
      return { success: false, mode: 'local' };
    }

    try {
      const payload = {
        ...onboardingData,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc('current_student').set(payload, { merge: true });
      console.info('[Firebase] Successfully synced student onboarding blueprint to Firestore.');
      return { success: true, mode: 'cloud' };
    } catch (err) {
      console.error('[Firebase] Failed to save onboarding data:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch User Onboarding from Cloud
   */
  async function loadUserOnboarding() {
    if (!ensureInitialized() || !db) return null;
    try {
      const doc = await db.collection('users').doc('current_student').get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (err) {
      console.warn('[Firebase] Error fetching onboarding data:', err);
      return null;
    }
  }

  /**
   * Sync a Flagged Mistake to Cloud Mistake Bank
   */
  async function syncMistakeToCloud(mistake) {
    if (!ensureInitialized() || !db) return false;
    try {
      const mistakeId = mistake.id || `mstk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const payload = {
        ...mistake,
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

  /**
   * Fetch all Cloud Mistakes
   */
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

  /**
   * Save Full GATE Mock Exam Result to Cloud
   */
  async function saveMockExamResult(examResult) {
    if (!ensureInitialized() || !db) {
      console.warn('[Firebase] Saving mock exam result locally.');
      if (typeof localStorage !== 'undefined') {
        const localHistory = JSON.parse(localStorage.getItem('gt_mock_history_backup') || '[]');
        localHistory.unshift({ ...examResult, savedAt: new Date().toISOString() });
        localStorage.setItem('gt_mock_history_backup', JSON.stringify(localHistory.slice(0, 10)));
      }
      return { success: false, mode: 'local' };
    }

    try {
      const examId = `mock_${Date.now()}`;
      const payload = {
        ...examResult,
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

  /**
   * Fetch Historical Mock Exam Attempts
   */
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

  /**
   * Seed / Backup Question Bank to Firestore
   */
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

  /**
   * Test Live Firestore Connection
   */
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

  // ── 5. Service Public API Export ──
  const FirebaseService = {
    config: firebaseConfig,
    init: initFirebase,
    getApp: () => app,
    getDb: () => db,
    getAuth: () => auth,
    isOnline: () => isOnline,
    saveUserOnboarding,
    loadUserOnboarding,
    syncMistakeToCloud,
    fetchCloudMistakes,
    saveMockExamResult,
    fetchMockExamHistory,
    seedQuestionBankToCloud,
    testConnection
  };

  if (typeof window !== 'undefined') {
    window.FirebaseService = FirebaseService;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseService;
  }
})();
