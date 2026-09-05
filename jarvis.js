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
      console.warn('[GT JARVIS] Offline or server error, using resilient client fallback:', err);
      // Resilient client fallback
      const fallbackReply = generateClientFallback(cleanText, state.mode);
      appendChatMessage('assistant', fallbackReply.text, fallbackReply.action);
      if (state.voiceEnabled) speak(fallbackReply.spoken);
      if (fallbackReply.action) executeSafeAction(fallbackReply.action);
      setStatus('IDLE');
    }
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
    if (window.MistakeBookModule && typeof MistakeBookModule.getMistakes === 'function') {
      const list = MistakeBookModule.getMistakes();
      pendingMistakes = list.filter(m => !m.resolved).length;
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
      weakTopics: (prepState && Array.isArray(prepState.weakTopics)) ? prepState.weakTopics : [],
      todayTasks: (prepState && Array.isArray(prepState.todayTasks)) ? prepState.todayTasks : [],
      activeTrack: '90-Day Career Preparation OS',
      currentMode: state.mode
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Resilient Client Fallback (Zero Downtime)
  // ──────────────────────────────────────────────────────────────────────────
  function generateClientFallback(prompt, mode) {
    const lower = prompt.toLowerCase();
    const ctx = collectLocalStudentContext();

    if (/focus|study|timer/i.test(lower)) {
      return {
        text: "Starting a 45-minute focus session for you now. Maintain your flow and avoid interruptions!",
        spoken: "Starting a 45-minute focus session now.",
        action: { type: 'start_focus', params: { duration: 45, topic: 'Deep Focus Block' } }
      };
    }

    if (/dsa|code|algorithm/i.test(lower)) {
      return {
        text: "Opening your DSA practice workspace. Remember to verify time complexity and test edge cases before submitting.",
        spoken: "Opening your DSA practice workspace.",
        action: { type: 'open_dsa' }
      };
    }

    if (/revision|mistake/i.test(lower)) {
      return {
        text: "Navigating to your Smart Revision queue. Regular active recall prevents memory decay.",
        spoken: "Opening your Smart Revision queue.",
        action: { type: 'open_revision' }
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

    if (/weak|weakness|struggle/i.test(lower)) {
      return {
        text: "I don't have enough tracked practice or quiz data yet to identify a weak topic. Complete practice questions or a diagnostic quiz to build evidence.",
        spoken: "I don't have enough tracked data yet to identify a weak area. Start your first practice session to begin tracking.",
        action: null
      };
    }

    return {
      text: ctx.day === 0 
        ? `Welcome to Day 0! You can complete your onboarding setup, start your first focus session, or ask me any Computer Science question.`
        : `I've noted your question regarding "${prompt}". Ask me to start a focus session, explain a CS concept, or test a DSA problem!`,
      spoken: ctx.day === 0 ? "Welcome to Day 0. Let's get your preparation started." : "I'm ready to assist with your study plan, concepts, or focus sessions.",
      action: null
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. UI Chat Message Renderer
  // ──────────────────────────────────────────────────────────────────────────
  function appendChatMessage(role, text, action = null, intent = null) {
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

      // Format markdown-like bold and line breaks
      const formatted = escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

      bubble.innerHTML = `
        <div class="chat-text">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="font-weight:800;font-size:12px;color:var(--primary-light);letter-spacing:0.5px;">GT JARVIS</span>
            <span style="font-size:10px;padding:1px 6px;border-radius:4px;background:rgba(91,91,214,0.2);color:var(--primary-light);">${state.mode.toUpperCase()}</span>
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
    let width = canvas.width = 240;
    let height = canvas.height = 240;

    let angle = 0;
    let pulse = 0;

    function render() {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      angle += 0.02;
      pulse += 0.04;
      const pulseFactor = Math.sin(pulse) * 4;

      // Color scheme based on state
      let mainColor = '#5B5BD6';
      let glowColor = 'rgba(91, 91, 214, 0.4)';
      if (state.status === 'LISTENING') {
        mainColor = '#06B6D4';
        glowColor = 'rgba(6, 182, 212, 0.6)';
      } else if (state.status === 'PROCESSING') {
        mainColor = '#F59E0B';
        glowColor = 'rgba(245, 158, 11, 0.6)';
      } else if (state.status === 'SPEAKING') {
        mainColor = '#10B981';
        glowColor = 'rgba(16, 185, 129, 0.6)';
      } else if (state.status === 'ERROR') {
        mainColor = '#EF4444';
        glowColor = 'rgba(239, 68, 68, 0.6)';
      }

      // 1. Outer Ambient Glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 80 + pulseFactor);
      grad.addColorStop(0, glowColor);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 85 + pulseFactor, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Orbital Ring (Clockwise)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 8, 4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, Math.PI * 2);
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
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Live Waveform Bars (When Speaking or Listening)
      if (state.status === 'SPEAKING' || state.status === 'LISTENING') {
        const barCount = 24;
        for (let i = 0; i < barCount; i++) {
          const barAngle = (i / barCount) * Math.PI * 2 + angle;
          const waveHeight = (Math.sin(pulse * 2 + i) * 0.5 + 0.5) * 16 + 4;
          const x1 = cx + Math.cos(barAngle) * 38;
          const y1 = cy + Math.sin(barAngle) * 38;
          const x2 = cx + Math.cos(barAngle) * (38 + waveHeight);
          const y2 = cy + Math.sin(barAngle) * (38 + waveHeight);

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
      ctx.arc(cx, cy, 26 + pulseFactor * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // 6. Core Inner Highlight
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 6, 8, 0, Math.PI * 2);
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

  // Auto-init when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
