// ══════════════════════════════════════════════════════════════
// GT Study Mentor Pro v3.0 — focusSession.js
// Distraction-Free Focus Session Controller
// Plan → Focus → Rate → Feed back → Adapt
// ══════════════════════════════════════════════════════════════

const FocusSession = (function () {
  const STORAGE_KEY = 'gt_focus_sessions_v3';

  let currentTask = null;
  let timerInterval = null;
  let totalSeconds = 25 * 60;  // default 25 min
  let remainingSeconds = totalSeconds;
  let isRunning = false;
  let sessionLog = [];

  // Load past sessions
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) sessionLog = JSON.parse(saved);
    } catch (e) { console.warn('[FocusSession] Load error', e); }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionLog.slice(-50)));
    } catch (e) { console.warn('[FocusSession] Save error', e); }
  }

  load();

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function updateDisplay() {
    const el = document.getElementById('focus-timer-display');
    if (!el) return;
    el.textContent = formatTime(remainingSeconds);
    el.classList.toggle('danger', remainingSeconds < 300);

    // Progress bar
    const bar = document.getElementById('focus-progress-bar');
    if (bar) {
      const pct = Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100);
      bar.style.width = pct + '%';
    }
  }

  function show() {
    const overlay = document.getElementById('focus-session-overlay');
    if (overlay) overlay.classList.add('active');
    // Trap focus inside
    overlay && overlay.querySelector('button') && overlay.querySelector('button').focus();
  }

  function hide() {
    const overlay = document.getElementById('focus-session-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;

    // Update header stopwatch dot to green
    const dot = document.getElementById('stopwatch-dot');
    if (dot) { dot.style.background = 'var(--success)'; dot.style.boxShadow = '0 0 8px rgba(16,185,129,0.6)'; }

    timerInterval = setInterval(() => {
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        onTimerComplete();
        return;
      }
      remainingSeconds--;
      updateDisplay();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    const dot = document.getElementById('stopwatch-dot');
    if (dot) { dot.style.background = 'var(--text-muted)'; dot.style.boxShadow = ''; }
  }

  function onTimerComplete() {
    updateDisplay();
    // Notify user session is complete
    if (typeof showToast === 'function') showToast('Focus session complete! Rate your understanding.', 'success');
    // Try browser notification
    if (Notification && Notification.permission === 'granted') {
      new Notification('GT Mentor — Focus Session Done!', {
        body: `Session on "${currentTask ? currentTask.topic : 'task'}" complete. Rate it now.`,
        icon: 'icon.svg'
      });
    }
    // Keep overlay open for rating
  }

  return {
    // Start from Next Best Action card
    startNBA: function() {
      if (!window.PrepIntelligenceEngine) {
        console.warn('[FocusSession] PrepIntelligenceEngine not loaded');
        return;
      }
      const nba = PrepIntelligenceEngine.getNextBestAction();
      const state = PrepIntelligenceEngine.getState();
      const firstPendingTask = state.todayTasks.find(t => !t.completed);
      currentTask = firstPendingTask || {
        id: 'nba-' + Date.now(),
        topic: nba.action,
        subject: nba.subject,
        estMinutes: 45,
        track: nba.track,
        highLeverageNote: nba.why
      };
      FocusSession.startTask(currentTask.topic, currentTask.estMinutes);
    },

    // Start from any task
    startTask: function(taskTitle, durationMinutes) {
      const mins = parseInt(durationMinutes) || 25;
      totalSeconds = mins * 60;
      remainingSeconds = totalSeconds;
      isRunning = false;

      currentTask = currentTask || { topic: taskTitle, id: 'manual-' + Date.now(), estMinutes: mins };

      // Populate overlay
      const titleEl = document.getElementById('focus-task-title');
      if (titleEl) titleEl.textContent = taskTitle;

      const goalEl = document.getElementById('focus-goal-text');
      if (goalEl) {
        goalEl.textContent = currentTask.highLeverageNote ||
          `Complete the ${durationMinutes}-minute focus block on "${taskTitle}". Stay in deep work mode.`;
      }

      // Clear previous notes
      const notes = document.getElementById('focus-notes');
      if (notes) notes.value = '';

      updateDisplay();
      show();
      startTimer();
    },

    pause: function() {
      if (isRunning) {
        stopTimer();
        const btn = document.getElementById('focus-pause-btn');
        if (btn) btn.textContent = '▶ Resume';
        if (typeof showToast === 'function') showToast('Session paused', 'info');
      } else {
        startTimer();
        const btn = document.getElementById('focus-pause-btn');
        if (btn) btn.textContent = '⏸️ Pause';
      }
    },

    finish: function(rating) {
      // rating: 'easy' | 'good' | 'hard' | 'revision'
      stopTimer();

      const notes = document.getElementById('focus-notes');
      const noteText = notes ? notes.value.trim() : '';
      const minutesSpent = Math.round((totalSeconds - remainingSeconds) / 60);

      const sessionRecord = {
        id: 'session-' + Date.now(),
        taskId: currentTask ? currentTask.id : null,
        taskTopic: currentTask ? currentTask.topic : 'Unknown',
        taskSubject: currentTask ? (currentTask.subject || '') : '',
        rating: rating,
        minutesSpent: minutesSpent,
        notes: noteText,
        timestamp: new Date().toISOString()
      };
      sessionLog.push(sessionRecord);
      save();

      // Feed into PrepIntelligenceEngine / FSRS
      if (window.PrepIntelligenceEngine && currentTask && currentTask.id) {
        PrepIntelligenceEngine.toggleTask(currentTask.id); // Mark as complete if not already
      }

      // Feed into MistakeBookModule FSRS if applicable
      if (window.MistakeBookModule && (rating === 'hard' || rating === 'revision')) {
        // Find matching FSRS card if exists
        const cards = MistakeBookModule.getAllFSRSCards();
        const matchCard = cards.find(c =>
          c.topic && currentTask && c.topic.toLowerCase().includes(currentTask.subject ? currentTask.subject.toLowerCase().substring(0, 6) : 'xxx')
        );
        if (matchCard) {
          const fsrsRating = rating === 'easy' ? 'Easy' : rating === 'good' ? 'Good' : rating === 'hard' ? 'Hard' : 'Again';
          MistakeBookModule.rateFSRSCard(matchCard.id, fsrsRating);
        }
      }

      // Toast feedback
      const messages = {
        'easy': '💚 Mastered! Topic locked in. Next review scheduled.',
        'good': '👍 Solid! Keep it up da!',
        'hard': '⚠️ Logged as challenging. Will schedule revision tomorrow.',
        'revision': '🔄 Added to Smart Revision queue. We will revisit this soon.'
      };
      if (typeof showToast === 'function') {
        showToast(messages[rating] || 'Session recorded!', rating === 'easy' || rating === 'good' ? 'success' : 'warning');
      }

      hide();
      currentTask = null;

      // Refresh home view if visible
      if (typeof renderHomeView === 'function') renderHomeView();
      if (typeof refreshNBA === 'function') refreshNBA();
    },

    abort: function() {
      stopTimer();
      hide();
      currentTask = null;
      if (typeof showToast === 'function') showToast('Session abandoned. Pick it up again when ready.', 'info');
    },

    stuck: function() {
      // Open AI Mentor with context
      hide(); // hide focus overlay temporarily
      if (typeof navigateToView === 'function') {
        navigateToView('mentor');
        setTimeout(() => {
          const topic = currentTask ? currentTask.topic : 'the current topic';
          const ctx = `I am stuck on: "${topic}". I have been working on it for ${Math.round((totalSeconds - remainingSeconds) / 60)} minutes. Can you help me with a hint using the Socratic method?`;
          if (typeof openChatWithContext === 'function') openChatWithContext(ctx);
        }, 300);
      }
    },

    getSessionLog: function() {
      return sessionLog;
    },

    getTodayStats: function() {
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessionLog.filter(s => s.timestamp && s.timestamp.startsWith(today));
      const totalMinutes = todaySessions.reduce((a, s) => a + (s.minutesSpent || 0), 0);
      const ratings = todaySessions.map(s => s.rating);
      const easyCount = ratings.filter(r => r === 'easy').length;
      const hardCount = ratings.filter(r => r === 'hard' || r === 'revision').length;
      return {
        sessionsCount: todaySessions.length,
        totalMinutes,
        easyCount,
        hardCount,
        accuracy: todaySessions.length > 0 ? Math.round((easyCount + ratings.filter(r=>r==='good').length) / todaySessions.length * 100) : 0
      };
    },

    isActive: function() {
      return isRunning;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.FocusSession = FocusSession;
}
