/**
 * ============================================================================
 * GT JARVIS — Voice Assistant & 3D Core Engine
 * File: jarvis.js
 * ============================================================================
 * 
 * "Don't ask what to study. Ask JARVIS."
 * 
 * FEATURES:
 * 1. Web Speech API (SpeechRecognition for voice input + SpeechSynthesis for voice output)
 * 2. 3D Animated JARVIS Core Canvas with live responsive orbital rings & audio waveform
 * 3. Safe Application Action Dispatcher (starts timers, opens labs, switches views)
 * 4. Dedicated Modes (Study, GATE, DSA with Socratic hints, Placement, SWE, etc.)
 * 5. Wake Word detection ("Hey JARVIS")
 * 6. Graceful fallbacks for unsupported browsers or denied microphone permissions
 */

(function(window) {
  'use strict';

  // State
  const state = {
    mode: 'study',
    status: 'IDLE', // IDLE | LISTENING | PROCESSING | SPEAKING | ERROR
    voiceEnabled: true,
    wakeWordActive: false,
    recognition: null,
    speechSynthesis: window.speechSynthesis || null,
    activeVoice: null,
    isListening: false,
    isSpeaking: false,
    hasSpeechRecognition: false,
    canvasAnimId: null,
    audioWaveProgress: 0
  };

  // Supported modes configuration
  const MODES = {
    study: { name: 'Study Planning', icon: '📋' },
    gate: { name: 'GATE 2027', icon: '🎓' },
    dsa: { name: 'DSA Socratic', icon: '💻' },
    placement: { name: 'Placements', icon: '🏢' },
    swe: { name: 'Software Eng', icon: '⚙️' },
    intern: { name: 'Internship', icon: '🌟' },
    interview: { name: 'Mock Interview', icon: '🎙️' },
    resume: { name: 'ATS Resume', icon: '📄' },
    focus: { name: 'Deep Focus', icon: '⚡' }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Initialization
  // ──────────────────────────────────────────────────────────────────────────
  function init() {
    initSpeechRecognition();
    initSpeechSynthesis();
    initCanvas3DCore();
    initUIBindings();
    console.log('[GT JARVIS] Initialized successfully in', state.mode, 'mode.');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Speech Recognition Setup
  // ──────────────────────────────────────────────────────────────────────────
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      state.hasSpeechRecognition = false;
      console.warn('[GT JARVIS] SpeechRecognition API is not supported in this browser. Falling back to text input.');
      updateVoiceStatusBanner('Voice input is not supported in this browser. You can still type your questions!');
      return;
    }

    state.hasSpeechRecognition = true;
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        state.isListening = true;
        setStatus('LISTENING');
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('[GT JARVIS] Heard:', transcript);

        // Check for Wake Word
        if (state.wakeWordActive && !state.isListening) {
          if (/hey\s+jarvis|jarvis/i.test(transcript)) {
            speak("Yes, I'm listening.");
            startListening();
            return;
          }
        }

        handleUserInput(transcript, 'voice');
      };

      rec.onerror = (event) => {
        console.warn('[GT JARVIS] Recognition error:', event.error);
        state.isListening = false;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setStatus('ERROR', 'Microphone access blocked. Please allow microphone permission in your browser.');
        } else if (event.error === 'no-speech') {
          setStatus('IDLE');
        } else {
          setStatus('ERROR', `Recognition note: ${event.error}`);
          setTimeout(() => setStatus('IDLE'), 2500);
        }
      };

      rec.onend = () => {
        state.isListening = false;
        if (state.status === 'LISTENING') {
          setStatus('IDLE');
        }
      };

      state.recognition = rec;
    } catch (e) {
      console.warn('[GT JARVIS] Could not initialize speech recognition:', e);
      state.hasSpeechRecognition = false;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Speech Synthesis (Text-to-Speech)
  // ──────────────────────────────────────────────────────────────────────────
  function initSpeechSynthesis() {
    if (!state.speechSynthesis) return;

    function populateVoices() {
      const voices = state.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer high quality natural English voices
      const preferred = [
        'Google UK English Male',
        'Google UK English Female',
        'Google US English',
        'Microsoft George Online (Natural)',
        'Microsoft Ryan Online (Natural)',
        'Samantha',
        'Daniel'
      ];

      for (const name of preferred) {
        const found = voices.find(v => v.name.includes(name));
        if (found) {
          state.activeVoice = found;
          break;
        }
      }

      if (!state.activeVoice) {
        state.activeVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      }
    }

    populateVoices();
    if (typeof state.speechSynthesis.onvoiceschanged !== 'undefined') {
      state.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }

  function speak(text) {
    if (!state.voiceEnabled || !state.speechSynthesis || !text) return;

    try {
      state.speechSynthesis.cancel(); // Cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      if (state.activeVoice) utterance.voice = state.activeVoice;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        state.isSpeaking = true;
        setStatus('SPEAKING');
      };

      utterance.onend = () => {
        state.isSpeaking = false;
        setStatus('IDLE');
      };

      utterance.onerror = () => {
        state.isSpeaking = false;
        setStatus('IDLE');
      };

      state.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[GT JARVIS] Speech synthesis error:', e);
      state.isSpeaking = false;
      setStatus('IDLE');
    }
  }

  function stopSpeaking() {
    if (state.speechSynthesis) {
      state.speechSynthesis.cancel();
      state.isSpeaking = false;
      if (state.status === 'SPEAKING') setStatus('IDLE');
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Voice Controls & Status
  // ──────────────────────────────────────────────────────────────────────────
  function toggleListening() {
    if (!state.hasSpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your message in the chat box!");
      return;
    }

    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function startListening() {
    if (!state.recognition) return;
    try {
      stopSpeaking();
      state.recognition.start();
    } catch (e) {
      console.warn('[GT JARVIS] Start listening caught:', e);
    }
  }

  function stopListening() {
    if (state.recognition && state.isListening) {
      try {
        state.recognition.stop();
      } catch(e) {}
    }
  }

  function setStatus(newStatus, errorMsg = '') {
    state.status = newStatus;

    // Update HUD status badges
    const badge = document.getElementById('jarvis-status-badge');
    const subtitle = document.getElementById('jarvis-status-desc');
    const orb = document.getElementById('jarvis-floating-orb');

    if (badge) {
      badge.textContent = newStatus;
      badge.className = `jarvis-badge status-${newStatus.toLowerCase()}`;
    }

    if (subtitle) {
      if (newStatus === 'LISTENING') subtitle.textContent = 'Listening to your voice... Speak now!';
      else if (newStatus === 'PROCESSING') subtitle.textContent = 'Analyzing context & formulating guidance...';
      else if (newStatus === 'SPEAKING') subtitle.textContent = 'JARVIS is speaking...';
      else if (newStatus === 'ERROR') subtitle.textContent = errorMsg || 'Encountered an issue.';
      else subtitle.textContent = 'Online & Active • Ask me anything or say "Hey JARVIS"';
    }

    if (orb) {
      orb.setAttribute('data-status', newStatus.toLowerCase());
    }

    // Synchronize V5 Editorial Hero HUD indicators
    const heroStatus = document.getElementById('hero-jarvis-status');
    const heroStateLabel = document.getElementById('hero-jarvis-state-label');
    const heroDot = document.getElementById('hero-jarvis-dot');

    if (heroStatus) {
      heroStatus.textContent = `JARVIS • ${newStatus}`;
    }
    if (heroStateLabel) {
      heroStateLabel.textContent = newStatus;
    }
    if (heroDot) {
      heroDot.className = `pulse-dot-jarvis status-${newStatus.toLowerCase()}`;
    }
  }

  function updateVoiceStatusBanner(msg) {
    const banner = document.getElementById('jarvis-voice-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.textContent = msg;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Message Handling & Backend Communication
  // ──────────────────────────────────────────────────────────────────────────
  async function handleUserInput(text, inputType = 'text') {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    // 1. Render student message in chat window
    appendChatMessage('user', cleanText);

    // 2. Set processing state
    setStatus('PROCESSING');

    // 3. Collect active student context from local page state
    const studentContext = collectLocalStudentContext();

    // If hosted statically (e.g. GitHub Pages), directly run resilient client fallback without generating HTTP 405
    if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.protocol === 'file:')) {
      await handleOfflineFallback(cleanText, studentContext);
      return;
    }

    try {
      const response = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          mode: state.mode,
          context: studentContext,
          sessionId: 'student-session'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      // 4. Render JARVIS response
      appendChatMessage('assistant', data.reply, data.action, data.intent);

      // 5. Speak response (if voice is enabled)
      if (state.voiceEnabled && data.spokenText) {
        speak(data.spokenText);
      } else {
        setStatus('IDLE');
      }

      // 6. Execute safe application action if returned
      if (data.action) {
        executeSafeAction(data.action);
      }

    } catch (err) {
      console.warn('[GT JARVIS] Server unreachable or static host, using client intelligence:', err);
      await handleOfflineFallback(cleanText, studentContext);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5.1 Client-Side Intelligence & Gemini AI Bridge
  // ──────────────────────────────────────────────────────────────────────────
  async function handleOfflineFallback(cleanText, studentContext) {
    // 1. Check if user configured Google Gemini API Key
    const geminiKey = (typeof localStorage !== 'undefined') ? localStorage.getItem('gt_gemini_api_key') : null;
    if (geminiKey && geminiKey.trim()) {
      try {
        const geminiReply = await callGeminiAPI(cleanText, studentContext, geminiKey.trim());
        if (geminiReply && geminiReply.text) {
          appendChatMessage('assistant', geminiReply.text, geminiReply.action, 'GEMINI_AI');
          if (state.voiceEnabled && geminiReply.spoken) speak(geminiReply.spoken);
          if (geminiReply.action) executeSafeAction(geminiReply.action);
          setStatus('IDLE');
          return;
        }
      } catch (geminiErr) {
        console.warn('[GT JARVIS] Gemini API call failed, falling back to local knowledge engine:', geminiErr);
      }
    }

    // 2. Comprehensive Local Semantic Concept Engine
    const fallbackReply = generateClientFallback(cleanText, state.mode);
    appendChatMessage('assistant', fallbackReply.text, fallbackReply.action, fallbackReply.intent || null, true);
    if (state.voiceEnabled && fallbackReply.spoken) speak(fallbackReply.spoken);
    if (fallbackReply.action) executeSafeAction(fallbackReply.action);
    setStatus('IDLE');
  }

  async function callGeminiAPI(cleanText, studentContext, apiKey) {
    const systemPrompt = `You are GT JARVIS, the supreme AI Mentor for GATE CSE 2027, DSA, Campus Placements, and Software Engineering. Student Context: Day ${studentContext.day}, Track: ${studentContext.activeTrack || 'GATE + Placement'}, Mode: ${state.mode}. Answer with technical precision, intuitive analogies, formulas, ASCII diagrams or code snippets where helpful, and clear next steps. Keep formatting clean with standard markdown.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nStudent: "${cleanText}"` }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      })
    });

    if (!res.ok) throw new Error(`Gemini API HTTP ${res.status}`);
    const json = await res.json();
    const replyText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error('Empty response from Gemini');

    let action = null;
    const lower = cleanText.toLowerCase();
    if (/mock|65/i.test(lower)) action = { type: 'open_mock_exam' };
    else if (/setup wizard|onboarding/i.test(lower)) action = { type: 'open_setup_wizard' };
    else if (/focus/i.test(lower)) action = { type: 'start_focus', params: { duration: 45, topic: 'Deep Focus Block' } };
    else if (/dsa/i.test(lower)) action = { type: 'open_dsa' };
    else if (/pyq|gate question/i.test(lower)) action = { type: 'open_pyq' };

    const spoken = replyText.replace(/[*#`_\[\]()]/g, '').substring(0, 160);
    return { text: replyText, spoken, action };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Safe Action Dispatcher
  // ──────────────────────────────────────────────────────────────────────────
  function executeSafeAction(action) {
    if (!action || !action.type) return;
    console.log('[GT JARVIS] Executing safe application action:', action);

    setTimeout(() => {
      switch (action.type) {
        case 'start_focus': {
          const duration = action.params?.duration || 45;
          const topic = action.params?.topic || 'Deep Focus Session';
          if (window.FocusSession && typeof FocusSession.startTask === 'function') {
            FocusSession.startTask(topic, duration);
          } else if (typeof window.navigateToView === 'function') {
            window.navigateToView('prepare');
          }
          break;
        }

        case 'open_dsa': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('practice');
          }
          break;
        }

        case 'open_pyq': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('prepare');
          }
          break;
        }

        case 'open_revision': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('progress');
            if (typeof window.switchProgressTab === 'function') {
              window.switchProgressTab('smart-revision');
            }
          }
          break;
        }

        case 'show_progress': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('progress');
            if (typeof window.switchProgressTab === 'function') {
              window.switchProgressTab(action.params?.tab || 'readiness');
            }
          }
          break;
        }

        case 'open_resume': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('career');
            if (typeof window.switchCareerTab === 'function') {
              window.switchCareerTab('resume');
            }
          }
          break;
        }

        case 'open_company': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('career');
            if (typeof window.switchCareerTab === 'function') {
              window.switchCareerTab('companies');
            }
          }
          break;
        }

        case 'start_mock_interview': {
          if (typeof window.openModal === 'function') {
            window.openModal('mock-interview-modal');
          }
          break;
        }

        case 'open_cse_lab': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('cselabs');
          }
          break;
        }

        case 'open_dashboard': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('home');
          }
          break;
        }

        case 'start_quiz': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('practice');
            if (typeof window.switchPracticeTab === 'function') {
              window.switchPracticeTab('quiz');
            }
          }
          break;
        }

        case 'review_mistakes': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('progress');
            if (typeof window.switchProgressTab === 'function') {
              window.switchProgressTab('mistakes');
            }
          }
          break;
        }

        case 'reset_journey': {
          if (typeof window.resetPreparationJourney === 'function') {
            window.resetPreparationJourney();
          }
          break;
        }

        case 'open_gate_official': {
          const url = action.params?.url || 'https://gate2027.iitm.ac.in/';
          const label = action.params?.label || 'Official Portal';
          try {
            window.open(url, '_blank', 'noopener,noreferrer');
            if (typeof showToast === 'function') {
              showToast(`🔗 Opened IIT Madras GATE 2027: ${label}`, 'success');
            }
          } catch(e) {
            console.warn('[JARVIS] Error opening official link:', e);
          }
          break;
        }

        case 'open_gate_prepare': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('prepare', 'gate');
          }
          break;
        }

        case 'open_aptitude_resource': {
          const url = action.params?.url || 'https://www.indiabix.com/aptitude/questions-and-answers/';
          const label = action.params?.label || 'IndiaBIX Aptitude';
          try {
            window.open(url, '_blank', 'noopener,noreferrer');
            if (typeof showToast === 'function') {
              showToast(`🔗 Opened ${label}`, 'success');
            }
          } catch(e) {
            console.warn('[JARVIS] Error opening aptitude resource link:', e);
          }
          break;
        }

        case 'open_swe_roadmap': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('prepare', 'swe');
          }
          if (typeof showToast === 'function') {
            showToast('🗺️ Opened Software Engineer Roadmap', 'info');
          }
          break;
        }

        case 'open_placement_roadmap': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('prepare', 'placement');
          }
          if (typeof showToast === 'function') {
            showToast('💼 Opened Placement Preparation Roadmap', 'info');
          }
          break;
        }

        case 'open_internship_roadmap': {
          if (typeof window.navigateToView === 'function') {
            window.navigateToView('prepare', 'intern');
          }
          if (typeof showToast === 'function') {
            showToast('🚀 Opened Internship Preparation Roadmap', 'info');
          }
          break;
        }

        case 'open_setup_wizard': {
          if (typeof window.openSetupWizard === 'function') {
            window.openSetupWizard();
          } else if (typeof window.openDay0Onboarding === 'function') {
            window.openDay0Onboarding();
          }
          if (typeof showToast === 'function') {
            showToast('🚀 Opened Setup Wizard & Mentor Calibration', 'info');
          }
          break;
        }

        case 'open_mock_exam': {
          if (typeof window.openGATEPredictorStudio === 'function') {
            window.openGATEPredictorStudio();
          } else if (typeof window.navigateToView === 'function') {
            window.navigateToView('practice', 'gate-pyq');
          }
          if (typeof showToast === 'function') {
            showToast('⚡ Launching 65-Question GATE Mock Exam', 'info');
          }
          break;
        }

        default:
          console.log('[GT JARVIS] Unhandled action type:', action.type);
      }
    }, 600);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Context Collector (Reads Real Local Data)
  // ──────────────────────────────────────────────────────────────────────────
  function collectLocalStudentContext() {
    let pendingMistakes = 0;
    let confidentMisconceptions = 0;
    if (window.MistakeBookModule) {
      if (typeof MistakeBookModule.getMistakes === 'function') {
        const list = MistakeBookModule.getMistakes();
        pendingMistakes = list.filter(m => !m.resolved).length;
      }
      if (typeof MistakeBookModule.getMisconceptionsCount === 'function') {
        confidentMisconceptions = MistakeBookModule.getMisconceptionsCount();
      }
    }

    const prepState = (window.PrepIntelligenceEngine && typeof PrepIntelligenceEngine.getState === 'function')
      ? PrepIntelligenceEngine.getState()
      : null;

    const day = prepState ? (prepState.currentDay ?? 0) : 0;
    const readiness = {
      gate: prepState?.readinessScores?.gate?.score ?? 0,
      placement: prepState?.readinessScores?.placement?.score ?? 0,
      swe: prepState?.readinessScores?.swe?.score ?? 0,
      internship: prepState?.readinessScores?.internship?.score ?? 0
    };

    let phase = 'Day 0: Onboarding & Orientation';
    if (day >= 1 && day <= 30) phase = 'Phase 1: Foundation (Days 1–30)';
    else if (day >= 31 && day <= 60) phase = 'Phase 2: Core Deep Dive (Days 31–60)';
    else if (day >= 61) phase = 'Phase 3: Mocks & Execution (Days 61–90)';

    return {
      day,
      totalDays: 90,
      phase,
      status: prepState?.status || (day === 0 ? 'NOT_STARTED' : 'ACTIVE'),
      readiness,
      pendingMistakes,
      confidentMisconceptions,
      weakTopics: (prepState && Array.isArray(prepState.weakTopics)) ? prepState.weakTopics : [],
      todayTasks: (prepState && Array.isArray(prepState.todayTasks)) ? prepState.todayTasks : [],
      activeTrack: '90-Day Career Preparation OS',
      currentMode: state.mode
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Resilient Client Fallback (Deep Semantic Concept Engine & Tanglish)
  // ──────────────────────────────────────────────────────────────────────────
  function generateClientFallback(prompt, mode) {
    const lower = prompt.toLowerCase();
    const ctx = collectLocalStudentContext();

    // ── Direct App Trigger Queries ──
    if (/(setup\s*wizard|onboarding|calibration|re-?run|change\s*goal)/i.test(lower)) {
      return {
        text: "Opening your Setup Wizard & Mentor Calibration now. You can reconfigure your target track, time horizon, and daily study budget at any time!",
        spoken: "Opening your Setup Wizard and Mentor Calibration now.",
        action: { type: 'open_setup_wizard' }
      };
    }

    if (/(mock\s*exam|65\s*questions?|full\s*mock|gate\s*simulator)/i.test(lower)) {
      return {
        text: "Launching the official 65-Question GATE CSE Mock Exam Simulator with NAT/MCQ pattern, live timer, virtual calculator, and instant All India Rank prediction!",
        spoken: "Launching the official 65 question GATE CSE mock exam now.",
        action: { type: 'open_mock_exam' }
      };
    }

    // ── Deep Technical Concept Explanations ──
    // 1. SCS (Shortest Common Supersequence)
    if (/(scs|shortest\s*common\s*supersequence)/i.test(lower)) {
      return {
        text: `### 🎯 Shortest Common Supersequence (SCS)
**Definition**: The shortest sequence that contains both strings $X$ (length $m$) and $Y$ (length $n$) as subsequences.

- **Fundamental Formula**:
  $$\\text{Length}(SCS(X, Y)) = m + n - \\text{Length}(LCS(X, Y))$$
- **Core Intuition**: To construct the shortest string containing both, find their **Longest Common Subsequence (LCS)** and include the shared characters once, inserting non-shared characters in relative order.
- **Example**:
  - $X = \\text{"AGGTAB"}$ ($m = 6$), $Y = \\text{"GXTXAYB"}$ ($n = 7$)
  - $LCS(X, Y) = \\text{"GTAB"}$ (length 4)
  - $\\text{Length}(SCS) = 6 + 7 - 4 = 9$
  - Result: $\\text{"AGGXTXAYB"}$
- **Time Complexity**: $O(m \\times n)$ via 2D Dynamic Programming table.`,
        spoken: "Shortest Common Supersequence length equals length of X plus length of Y minus the length of their Longest Common Subsequence.",
        action: null
      };
    }

    // 2. 2PL (Two-Phase Locking)
    if (/(2pl|two[- ]phase\s*locking)/i.test(lower)) {
      return {
        text: `### 🔒 Two-Phase Locking (2PL) Protocol
2PL is a concurrency control protocol guaranteeing **Conflict Serializability**.

- **Phase 1: Growing (Expanding) Phase**:
  - Transactions may acquire Shared (S) or Exclusive (X) locks.
  - **No locks can be released** during this phase.
  - **Lock Point**: The moment the transaction acquires its final lock.
- **Phase 2: Shrinking Phase**:
  - Transactions may release locks.
  - **No new locks can be acquired**.
- **Important Variations**:
  - **Strict 2PL**: Holds all **Exclusive (X) locks** until COMMIT/ABORT. Guarantees **Strict Schedules** & eliminates Cascading Aborts.
  - **Rigorous 2PL**: Holds **ALL locks** (S and X) until COMMIT/ABORT. Serial order equals commit order.
  - **Conservative 2PL**: Pre-declares all required locks upfront. Prevents deadlocks completely.`,
        spoken: "Two Phase Locking ensures conflict serializability with a growing phase that acquires locks and a shrinking phase that releases them.",
        action: null
      };
    }

    // 3. Deadlocks & Banker's Algorithm
    if (/(deadlock|banker'?s\s*algorithm|coffman)/i.test(lower)) {
      return {
        text: `### 🛑 Deadlocks & Banker's Algorithm
A deadlock occurs when a set of processes are permanently blocked waiting for resources held by each other.

- **4 Necessary Coffman Conditions**:
  1. **Mutual Exclusion**: Non-shareable resource mode.
  2. **Hold and Wait**: Process holds at least one resource while waiting for more.
  3. **No Preemption**: Resources cannot be forcibly revoked.
  4. **Circular Wait**: $P_0 \\to P_1 \\to \\dots \\to P_n \\to P_0$.
- **Banker's Safety Algorithm**:
  - Matrix calculation: $\\text{Need}[i] = \\text{Max}[i] - \\text{Allocation}[i]$.
  - If $\\text{Need}[i] \\le \\text{Available}$, simulate process $i$ executing to completion:
    $$\\text{Available} = \\text{Available} + \\text{Allocation}[i]$$
  - If all processes can complete, the system is in a **Safe State** (free of deadlock).`,
        spoken: "Deadlock requires four Coffman conditions. Banker's algorithm checks whether a safe execution sequence exists.",
        action: null
      };
    }

    // 4. Subnetting & CIDR
    if (/(subnet|cidr|sub-netting|subnet\s*mask)/i.test(lower)) {
      return {
        text: `### 🌐 Subnetting & CIDR (Classless Inter-Domain Routing)
Subnetting divides a contiguous IP network into smaller logical broadcast domains.

- **Key Formulas**:
  - **Subnets created** borrowing $k$ bits from host portion $= 2^k$.
  - **Usable hosts per subnet** with $h$ host bits $= 2^h - 2$ (excluding Network ID and Directed Broadcast Address).
  - **New Subnet Mask**: Original Prefix $+ k$ bits (e.g. $/24 + 2 = /26$ is $255.255.255.192$).
- **Worked Example**:
  - Block $192.168.1.0/24$. Need 4 subnets.
  - Borrow $k = 2$ bits ($2^2 = 4$). New prefix is $/26$.
  - Host bits remaining $h = 32 - 26 = 6$.
  - Usable hosts per subnet $= 2^6 - 2 = 62$ hosts.`,
        spoken: "In subnetting, borrowing k bits creates 2 to the power k subnets, and h host bits yield 2 to the power h minus 2 usable hosts.",
        action: null
      };
    }

    // 5. B-Trees & B+ Trees
    if (/(b\+?\s*tree|fanout|b-tree)/i.test(lower)) {
      return {
        text: `### 🌲 B-Trees vs B+ Trees in Databases
B+ Trees are balanced search trees optimized for high-throughput secondary storage I/O.

- **B-Tree vs B+ Tree**:
  - In a **B-Tree**, search keys and actual data record pointers are stored in both internal and leaf nodes.
  - In a **B+ Tree**, data record pointers reside **exclusively in the leaf nodes**. Internal nodes contain only router keys and child pointers, maximizing node **fanout (order)**.
  - Leaves in a B+ Tree are linked via a **doubly linked list**, allowing range queries ($K_1 \\le \\text{key} \\le K_2$) in $O(\\log N + \\text{results})$.
- **Internal Node Order Formula**:
  $$p \\times \\text{pointer\\_size} + (p - 1) \\times \\text{key\\_size} \\le \\text{Block Size}$$
  Solve for maximum integer $p$ (order).`,
        spoken: "In B+ trees, internal nodes store only router keys to maximize fanout, while leaves store all data pointers in a doubly linked list.",
        action: null
      };
    }

    // 6. P vs NP & NP-Complete
    if (/(p\s*vs\s*np|np-?complete|np-?hard)/i.test(lower)) {
      return {
        text: `### ⚡ P vs NP & Computational Complexity
- **P**: Problems solvable in polynomial time $O(n^k)$ by a **Deterministic Turing Machine**.
- **NP**: Decision problems verifiable in polynomial time by a Deterministic Turing Machine (or solvable in polynomial time by a Non-deterministic TM).
- **NP-Hard**: At least as hard as every problem in NP. (For all $L' \\in \\text{NP}, L' \\le_P L$).
- **NP-Complete**: Both $\\in \\text{NP}$ and $\\in \\text{NP-Hard}$ (e.g. 3-SAT, Vertex Cover, Clique, Traveling Salesperson, Hamiltonian Cycle).
- **Millennium Rule**: If any single NP-Complete problem is proven solvable in polynomial time, then $P = NP$.`,
        spoken: "P contains problems solvable in polynomial time, while NP problems can be verified in polynomial time. NP-Complete problems are the hardest in NP.",
        action: null
      };
    }

    // 7. Virtual Memory & Inverted Page Tables
    if (/(virtual\s*memory|paging|inverted\s*page\s*table|tlb)/i.test(lower)) {
      return {
        text: `### 🧠 Virtual Memory & Inverted Page Tables
- **Two-Level Paging**:
  - Virtual Address: $[ \\text{Page Directory (Outer)} \\mid \\text{Page Table (Inner)} \\mid \\text{Page Offset} ]$.
  - Permits sparse allocation without holding the entire page table in physical RAM.
- **Inverted Page Table**:
  - Has exactly **one entry per physical page frame** rather than per virtual page.
  - Drastically reduces memory footprint on 64-bit systems. Uses hashing on $\\langle \\text{PID}, \\text{Page\\#}\\rangle$.
- **Effective Memory Access Time (EMAT)**:
  $$\\text{EMAT} = h \\times (t_{TLB} + t_{mem}) + (1 - h) \\times (t_{TLB} + 2 \\times t_{mem})$$
  where $h$ is the TLB hit ratio.`,
        spoken: "Inverted page tables maintain one entry per physical frame. Effective memory access time depends heavily on the TLB hit ratio.",
        action: null
      };
    }

    // 8. TCP Congestion Control
    if (/(tcp\s*reno|congestion\s*control|slow\s*start|fast\s*recovery)/i.test(lower)) {
      return {
        text: `### 🚀 TCP Reno Congestion Control
- **1. Slow Start**: $cwnd$ starts at 1 MSS and doubles every RTT ($cwnd = cwnd \\times 2$) until $cwnd \\ge ssthresh$.
- **2. Congestion Avoidance**: Linear additive increase: $cwnd = cwnd + 1$ MSS per RTT.
- **3. Fast Retransmit & Fast Recovery (on 3 Duplicate ACKs)**:
  - $ssthresh = \\max(\\lfloor cwnd / 2 \\rfloor, 2 \\times \\text{MSS})$
  - $cwnd = ssthresh + 3 \\times \\text{MSS}$
  - Retransmits missing packet without dropping back to 1 MSS!
- **4. On Timeout**:
  - $ssthresh = \\lfloor cwnd / 2 \\rfloor$
  - $cwnd = 1$ MSS (drops back to Slow Start).`,
        spoken: "TCP Reno uses Slow Start exponential growth, Congestion Avoidance linear growth, and Fast Recovery on 3 duplicate ACKs.",
        action: null
      };
    }

    // Tanglish / English Study Planning & Next Action
    if (/(enna\s*padikanum|what\s*(should\s*i|to)\s*study|plan\s*my\s*day|next\s*action)/i.test(lower)) {
      return {
        text: "Kandippa! Based on your current Day " + ctx.day + " zero-state roadmap, start with your Next Best Action on Home or launch a 45-minute focus session on core DSA/GATE concepts.",
        spoken: "Based on your 90-day trajectory, let's start with your high-leverage Next Best Action now.",
        action: { type: 'show_progress' }
      };
    }

    // Tanglish / English Focus session
    if (/(focus|study|timer|focus\s*start\s*pannu|\d+\s*mins?\s*focus)/i.test(lower)) {
      const match = lower.match(/(\d+)\s*mins?/);
      const mins = match ? parseInt(match[1], 10) : 45;
      return {
        text: `Starting a ${mins}-minute focused deep work session da! Keep distractions away and focus completely.`,
        spoken: `Starting a ${mins} minute focus session now.`,
        action: { type: 'start_focus', params: { duration: mins, topic: 'Deep Focus Block' } }
      };
    }

    // Tanglish / English Mistakes
    if (/(mistakes?\s*kaatu|show\s*(my\s*)?mistakes?|unresolved|review\s*mistakes?)/i.test(lower)) {
      return {
        text: "Opening your Mistake Book & Smart Revision queue. Reviewing confident errors is the fastest way to master concepts!",
        spoken: "Opening your Mistake Book and Smart Revision queue.",
        action: { type: 'open_revision' }
      };
    }

    // Tanglish / English Interview practice
    if (/(interview\s*practice|interview\s*practice\s*pannalama|mock\s*interview)/i.test(lower)) {
      return {
        text: "Sure da! Launching the AI Mock Interview Studio with SDE-1, GATE Oral, and HR STAR tracks.",
        spoken: "Launching the AI Mock Interview Studio now.",
        action: { type: 'start_interview' }
      };
    }

    // Tanglish / English DSA practice
    if (/(dsa|code|algorithm|dsa\s*practice)/i.test(lower)) {
      return {
        text: "Opening your DSA practice arena. Focus on two-pointers, sliding window, and graph traversals with Socratic guidance.",
        spoken: "Opening your DSA practice workspace.",
        action: { type: 'open_dsa' }
      };
    }

    // "I'm stuck" / "stuck" workflow
    if (/(stuck|i'm\s*stuck|help\s*me\s*debug|stuck\s*aagiten)/i.test(lower)) {
      return {
        text: "No worries da! Take a breath. Step 1: Write down small input test cases on paper. Step 2: Check boundary conditions (empty array, single element, negative numbers). Let's solve it step by step!",
        spoken: "Don't worry. Check your edge cases and boundary conditions first. Let's break down the problem.",
        action: null
      };
    }

    if (/progress|score|analytics/i.test(lower)) {
      if (ctx.day === 0) {
        return {
          text: "You are currently at Day 0. All metrics start at 0% and will advance as you log study sessions, quizzes, and problem sets.",
          spoken: "You are at Day 0. Your preparation readiness will update as you record real study activity.",
          action: { type: 'show_progress' }
        };
      }
      return {
        text: `Here is your preparation progress breakdown: GATE ${ctx.readiness.gate}%, SWE ${ctx.readiness.swe}%, Placement ${ctx.readiness.placement}%, Internship ${ctx.readiness.internship}%.`,
        spoken: "Displaying your preparation progress and readiness scores.",
        action: { type: 'show_progress' }
      };
    }

    if (/weak|weakness|struggle|weak\s*ah\s*iruken/i.test(lower)) {
      return {
        text: "I don't have enough tracked practice or quiz data yet to identify a weak topic. Complete practice questions or a diagnostic quiz to build evidence.",
        spoken: "I don't have enough tracked data yet to identify a weak area. Start your first practice session to begin tracking.",
        action: null
      };
    }

    return {
      text: ctx.day === 0 
        ? `Welcome to Day 0! You can complete your onboarding setup, start your first focus session, or ask me any Computer Science question (e.g. "Explain SCS", "Explain 2PL", "Deadlocks", "Subnetting").`
        : `I've noted your question regarding "${prompt}". Ask me to explain a CS concept (SCS, 2PL, Deadlocks, B+ Trees), start a focus session, or launch a mock exam!`,
      spoken: ctx.day === 0 ? "Welcome to Day 0. Let's get your preparation started." : "I'm ready to assist with your study plan, concepts, or focus sessions.",
      action: null
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. UI Chat Message Renderer
  // ──────────────────────────────────────────────────────────────────────────
  function appendChatMessage(role, text, action = null, intent = null, isOfflineFallback = false) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    // Remove welcome banner if present on first message
    const welcome = container.querySelector('.welcome-banner');
    if (welcome && container.children.length === 1) {
      welcome.style.display = 'none';
    }

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role === 'user' ? 'user' : 'mentor jarvis-msg'}`;

    if (role === 'user') {
      bubble.innerHTML = `<div class="chat-text">${escapeHtml(text)}</div>`;
    } else {
      let actionBadge = '';
      if (action) {
        actionBadge = `<div class="jarvis-action-tag">⚡ Action Executed: <strong>${action.type.replace('_', ' ').toUpperCase()}</strong></div>`;
      }

      const offlineTag = isOfflineFallback 
        ? `<span style="font-size:9px;padding:1px 6px;border-radius:4px;background:rgba(56,189,248,0.15);color:var(--accent);border:1px solid rgba(56,189,248,0.3);font-weight:700;">LOCAL INTELLIGENCE ACTIVE</span>`
        : '';

      // Format markdown-like bold and line breaks
      const formatted = escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

      bubble.innerHTML = `
        <div class="chat-text">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
            <span style="font-weight:800;font-size:12px;color:var(--primary-light);letter-spacing:0.5px;">GT JARVIS</span>
            <span style="font-size:10px;padding:1px 6px;border-radius:4px;background:rgba(91,91,214,0.2);color:var(--primary-light);">${state.mode.toUpperCase()}</span>
            ${offlineTag}
          </div>
          <p style="margin:0;">${formatted}</p>
          ${actionBadge}
        </div>`;
    }

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 10. 3D Animated JARVIS Core (Canvas Renderer)
  // ──────────────────────────────────────────────────────────────────────────
  function initCanvas3DCore() {
    const canvas = document.getElementById('jarvis-3d-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = 220;
    let height = canvas.height = 220;

    let angle = 0;
    let pulse = 0;

    canvas.style.cursor = 'pointer';
    canvas.onclick = (e) => {
      e.stopPropagation();
      toggleListening();
    };

    function render() {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!isReducedMotion) {
        if (state.status === 'PROCESSING') {
          angle += 0.045;
          pulse += 0.05;
        } else if (state.status === 'SPEAKING') {
          angle += 0.025;
          pulse += 0.08;
        } else if (state.status === 'LISTENING') {
          angle += 0.015;
          pulse += 0.05;
        } else {
          angle += 0.015;
          pulse += 0.035;
        }
      } else {
        angle = 0;
        pulse = 0;
      }

      const pulseFactor = isReducedMotion ? 0 : Math.sin(pulse) * 4;

      // Color scheme based on state (Cinematic Editorial Palette)
      let mainColor = '#38BDF8'; // Soft Cyan (IDLE)
      let glowColor = 'rgba(56, 189, 248, 0.35)';
      if (state.status === 'LISTENING') {
        mainColor = '#F59E0B'; // Amber
        glowColor = 'rgba(245, 158, 11, 0.6)';
      } else if (state.status === 'PROCESSING') {
        mainColor = '#818CF8'; // Muted Violet
        glowColor = 'rgba(129, 140, 248, 0.6)';
      } else if (state.status === 'SPEAKING') {
        mainColor = '#10B981'; // Emerald
        glowColor = 'rgba(16, 185, 129, 0.6)';
      } else if (state.status === 'ERROR') {
        mainColor = '#EF4444'; // Red
        glowColor = 'rgba(239, 68, 68, 0.6)';
      }

      // 1. Outer Ambient Glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 75 + pulseFactor);
      grad.addColorStop(0, glowColor);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 80 + pulseFactor, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Orbital Ring (Clockwise)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 8, 4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 64, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Middle Orbital Ring (Counter-Clockwise)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 1.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Live Waveform Bars (When Speaking or Listening)
      if (state.status === 'SPEAKING' || state.status === 'LISTENING') {
        const barCount = 24;
        for (let i = 0; i < barCount; i++) {
          const barAngle = (i / barCount) * Math.PI * 2 + angle;
          const waveHeight = (Math.sin(pulse * 2 + i) * 0.5 + 0.5) * 16 + 4;
          const x1 = cx + Math.cos(barAngle) * 36;
          const y1 = cy + Math.sin(barAngle) * 36;
          const x2 = cx + Math.cos(barAngle) * (36 + waveHeight);
          const y2 = cy + Math.sin(barAngle) * (36 + waveHeight);

          ctx.strokeStyle = mainColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // 5. Central Solid Glowing Core
      ctx.beginPath();
      ctx.arc(cx, cy, 24 + pulseFactor * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // 6. Core Inner Highlight
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 5, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();

      state.canvasAnimId = requestAnimationFrame(render);
    }

    render();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 11. UI Bindings
  // ──────────────────────────────────────────────────────────────────────────
  function initUIBindings() {
    // Mode switcher buttons
    const modeButtons = document.querySelectorAll('[id^="mentor-mode-"]');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.id.replace('mentor-mode-', '');
        setMode(id);
      });
    });

    // Mic button
    const micBtn = document.getElementById('jarvis-mic-btn');
    if (micBtn) {
      micBtn.addEventListener('click', toggleListening);
    }

    // Voice mute toggle
    const voiceToggle = document.getElementById('jarvis-voice-toggle');
    if (voiceToggle) {
      voiceToggle.addEventListener('click', () => {
        state.voiceEnabled = !state.voiceEnabled;
        if (!state.voiceEnabled) stopSpeaking();
        voiceToggle.innerHTML = state.voiceEnabled ? '🔊 Voice On' : '🔇 Muted';
        voiceToggle.classList.toggle('active', state.voiceEnabled);
      });
    }

    // Floating Orb click
    const floatingOrb = document.getElementById('jarvis-floating-orb');
    if (floatingOrb) {
      floatingOrb.addEventListener('click', () => {
        if (typeof window.navigateToView === 'function') {
          window.navigateToView('mentor');
        }
        toggleListening();
      });
    }
  }

  function setMode(modeKey) {
    if (!MODES[modeKey]) return;
    state.mode = modeKey;

    document.querySelectorAll('[id^="mentor-mode-"]').forEach(b => {
      b.classList.toggle('active', b.id === `mentor-mode-${modeKey}`);
    });

    const modeIndicator = document.getElementById('jarvis-active-mode-label');
    if (modeIndicator) {
      modeIndicator.textContent = `${MODES[modeKey].icon} ${MODES[modeKey].name}`;
    }

    console.log('[GT JARVIS] Switched to mode:', modeKey);
  }

  // Export global API
  window.GTJarvis = {
    init,
    handleUserInput,
    toggleListening,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setMode,
    getState: () => ({ ...state })
  };

  window.toggleJarvisVoice = toggleListening;

  // Connect global sendMessage
  window.sendMessage = function() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value;
    input.value = '';
    input.style.height = 'auto';
    handleUserInput(text, 'text');
  };

  // Connect global openChatWithContext
  window.openChatWithContext = function(prompt) {
    if (typeof window.navigateToView === 'function') {
      window.navigateToView('mentor');
    }
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = prompt;
      input.focus();
    }
  };

  // Connect global setMentorMode
  window.setMentorMode = function(mode) {
    setMode(mode);
  };

  // Connect Google Gemini API Key Configuration
  window.openJarvisKeyModal = function() {
    const currentKey = (typeof localStorage !== 'undefined') ? (localStorage.getItem('gt_gemini_api_key') || '') : '';
    const promptMsg = currentKey 
      ? `Google Gemini 1.5 Flash is currently CONNECTED! ✨\n\nEnter new key to update, or leave empty and press OK to clear and use the 100% offline knowledge base:`
      : `Configure Google Gemini AI Key (Gemini 1.5 Flash):\n\nEnter your personal Gemini API key for live AI answers.\n(Free key from: https://aistudio.google.com)\n\nLeave empty to use built-in offline CS knowledge engine:`;
    const newKey = prompt(promptMsg, currentKey);
    if (newKey !== null) {
      if (newKey.trim()) {
        localStorage.setItem('gt_gemini_api_key', newKey.trim());
        if (typeof showToast === 'function') showToast('✨ Google Gemini 1.5 Flash Connected!', 'success');
        const desc = document.getElementById('jarvis-status-desc');
        if (desc) desc.textContent = '✨ Gemini 1.5 Flash Active • Ask me anything!';
      } else {
        localStorage.removeItem('gt_gemini_api_key');
        if (typeof showToast === 'function') showToast('🧠 Switched to Local Offline Knowledge Engine', 'info');
        const desc = document.getElementById('jarvis-status-desc');
        if (desc) desc.textContent = '🧠 Local Knowledge Engine Active • 100% Offline Ready';
      }
    }
  };

  // Auto-init when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
