# 🎙️ GT JARVIS Voice Assistant — Beginner's Guide & Manual

> **"Don’t ask what to study. Ask JARVIS."**  
> Welcome to **GT JARVIS**, the personal AI voice assistant built directly into **GT Study Mentor Pro** (90-Day Career Preparation OS for GATE 2027, Placements, SWE, and Internships).

This guide is specially written for **beginners**. You do not need any prior knowledge of complex AI systems, WebSockets, or cloud setups. Everything is explained step-by-step with practical examples!

---

## 📑 Table of Contents
1. [What is GT JARVIS?](#1-what-is-gt-jarvis)
2. [Folder Structure & What Each File Does](#2-folder-structure--what-each-file-does)
3. [How the Frontend Communicates with the Backend](#3-how-the-frontend-communicates-with-the-backend)
4. [Where API Keys Are Stored (Security First)](#4-where-api-keys-are-stored-security-first)
5. [How Voice Input and Output Work](#5-how-voice-input-and-output-work)
6. [How to Run JARVIS Locally (Step-by-Step)](#6-how-to-run-jarvis-locally-step-by-step)
7. [How to Test JARVIS (Voice & Text Examples)](#7-how-to-test-jarvis-voice--text-examples)
8. [Common Errors & How to Fix Them](#8-common-errors--how-to-fix-them)
9. [Supported Modes & Application Actions](#9-supported-modes--application-actions)

---

## 1. What is GT JARVIS?

Unlike an ordinary chatbot that only gives generic text replies, **GT JARVIS** acts like a real personal study coach:
- **It listens to your voice** through your laptop or phone microphone.
- **It knows your actual preparation state** (your Day 27 progress, pending mistakes in the Mistake Book, and readiness scores across GATE, Placements, and SWE).
- **It answers general technical questions** (Operating Systems, Deadlocks, Binary Search, TCP vs UDP, Big-O, etc.).
- **It executes safe actions inside the app** (starting focus timers, opening DSA practice boards, launching mock interviews, loading company blueprints).
- **It speaks the answer back to you** with a glowing 3D animated core that pulses to the audio!

---

## 2. Folder Structure & What Each File Does

We organized the code so that **each file has only one clear job**:

```text
assistant_ai/
│
├── backend/
│   └── jarvis/
│       ├── aiProvider.js            # Talks to Google Gemini Cloud OR uses Offline Local CSE Intelligence
│       ├── intentEngine.js          # Understands what you want (Command vs Question vs Plan)
│       ├── actionEngine.js          # Prepares safe actions (like starting a 45m focus session)
│       ├── contextEngine.js         # Collects your real study data (never invents fake metrics)
│       ├── recommendationEngine.js  # Recommends your Next Best Action
│       ├── memoryService.js         # Remembers recent questions in your conversation
│       ├── voiceService.js          # Cleans text so JARVIS speaks naturally without robotic symbols
│       └── jarvisController.js      # The central Express router handling /api/jarvis/chat
│
├── jarvis.js                        # Frontend voice engine (Microphone, Speech, 3D Core Canvas)
├── server.js                        # The main Node.js web server that runs on your computer
├── index.html                       # The main webpage containing the JARVIS HUD & floating orb
├── style.css                        # 3D styling, glassmorphism, and Poppins font typography
└── .env.example                     # Example file showing where to put API keys
```

### Explanation of Backend Files:
1. **`backend/jarvis/aiProvider.js`**:
   - *What it does*: Answers student questions.
   - *Why it exists*: If you add a Google Gemini API key, it connects to Gemini. If you don't have an API key or the internet goes down, it **automatically uses built-in high-yield Computer Science knowledge** so JARVIS never crashes.
2. **`backend/jarvis/intentEngine.js`**:
   - *What it does*: Translates natural language into instructions.
   - *Why it exists*: Students can say "Let's study", "Start 45 mins", or "Begin a focus session". This file recognizes that all three mean `START_FOCUS`!
3. **`backend/jarvis/actionEngine.js`**:
   - *What it does*: Validates safe actions and prevents dangerous code from running.
   - *Why it exists*: It guarantees that JARVIS can only do safe things (e.g. open pages or start timers with safe durations between 15 and 120 minutes).
4. **`backend/jarvis/contextEngine.js`**:
   - *What it does*: Gathers your current milestone (Day 27 / 90), your real readiness scores (GATE 76%, SWE 81%), and pending mistakes.
   - *Why it exists*: Personalization! JARVIS speaks directly to your real situation.
5. **`backend/jarvis/recommendationEngine.js`**:
   - *What it does*: Proactively alerts you if you have due revision items or if a topic needs reinforcement.
6. **`backend/jarvis/memoryService.js`**:
   - *What it does*: Remembers the last few messages in your conversation.
   - *Why it exists*: If you say "Explain binary search" and then "Give me a practice problem", JARVIS knows that "practice problem" is about binary search.
7. **`backend/jarvis/voiceService.js`**:
   - *What it does*: Cleans up markdown formatting (`**`, `###`, code blocks) before sending text to the speech synthesizer.
8. **`backend/jarvis/jarvisController.js`**:
   - *What it does*: The API bridge. It accepts requests from your browser (`POST /api/jarvis/chat`) and returns the final answer, spoken text, and action.

---

## 3. How the Frontend Communicates with the Backend

Whenever you speak into the microphone or type a question:
1. **Speech-to-Text**: Your browser converts your voice into text words.
2. **HTTP POST Request**: Your browser sends that text to your local Node.js server via `fetch('/api/jarvis/chat', { method: 'POST', body: ... })`.
3. **Backend Processing**: The server identifies your intent, checks your study state, generates an answer, and prepares any action.
4. **JSON Response**: The server sends back a structured package:
   ```json
   {
     "reply": "Starting a 45-minute focus session on OS Deadlocks.",
     "spokenText": "Starting a 45-minute focus session on OS Deadlocks.",
     "action": {
       "type": "start_focus",
       "params": { "duration": 45, "topic": "Operating Systems & Deadlocks" }
     }
   }
   ```
5. **Action & Speech**: The browser executes the action (opening the Focus Timer) and speaks the answer aloud using Text-to-Speech while the 3D Core animates.

---

## 4. Where API Keys Are Stored (Security First)

**Rule:** Never put API keys inside frontend JavaScript (`jarvis.js` or `index.html`) or push them to public GitHub!

API keys are stored safely on your backend in a file named `.env`:
1. Look at `.env.example` in the project root.
2. Make a copy of `.env.example` and name it `.env`:
   ```env
   PORT=3000
   JARVIS_API_KEY=your_actual_key_here
   JARVIS_MODEL=gemini-1.5-flash
   JARVIS_PROVIDER=gemini
   ```
3. When you run `node server.js`, the backend reads this file.
4. **Note:** If you do not have an API key right now, **don't worry!** JARVIS works completely out-of-the-box using the built-in offline CSE intelligence engine.

---

## 5. How Voice Input and Output Work

JARVIS uses the standard **Web Speech API** built into modern web browsers (Google Chrome, Microsoft Edge, Brave, Opera):
- **Input (Hearing)**: Uses `SpeechRecognition`. It listens to your microphone and delivers a text transcript.
- **Output (Speaking)**: Uses `SpeechSynthesis`. It takes clean text and speaks it through your speakers or headphones using natural voice accents.
- **Mute Button**: In the top right corner of the JARVIS HUD, you can click **"🔊 Voice On"** anytime to switch to **"🔇 Muted"** if you are studying in a quiet room or library.

---

## 6. How to Run JARVIS Locally (Step-by-Step)

Follow these exact steps:

### Step 1: Open Terminal in your project folder
Open your terminal (PowerShell, Command Prompt, or VS Code Terminal) in `f:\assistant_ai`.

### Step 2: Start the server
Run:
```bash
node server.js
```
You should see:
```text
GT Mentor Pro Backend running on http://localhost:3000
```

### Step 3: Open your browser
Open Google Chrome or Microsoft Edge and navigate to:
```text
http://localhost:3000
```

### Step 4: Open JARVIS
- Click **"GT AI Mentor"** in the left sidebar, OR
- Click the floating **🎙️ 3D Orb** in the bottom-right corner of your screen!

### Step 5: Allow Microphone
When the browser prompts:  
*"http://localhost:3000 wants to use your microphone"*  
Click **Allow**.

---

## 7. How to Test JARVIS (Voice & Text Examples)

Try asking or typing these exact prompts:

### Test 1: Daily Planning Request
> **You:** "What should I study today?"  
> **JARVIS:** Analyzes your Day 27 status and recommends your scheduled DSA and Operating System Deadlock tasks.

### Test 2: Core CS Knowledge Question
> **You:** "Explain deadlock in simple terms."  
> **JARVIS:** Explains the 4 Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) and Banker's Algorithm avoidance.

### Test 3: Safe Application Action (Focus Session)
> **You:** "Start a 45-minute focus session on Deadlocks."  
> **JARVIS:** Says *"Starting a 45-minute focus session on Operating Systems & Deadlocks. Let's make every minute count!"* and **automatically opens the Focus Mode timer**!

### Test 4: DSA Socratic Guidance
> **You:** "How do I find a cycle in a directed graph?"  
> **JARVIS:** Gives you a Socratic hint about using DFS with recursion stack tracking or Kahn's algorithm (indegree BFS).

### Test 5: Career & Resume
> **You:** "Check my resume ATS score."  
> **JARVIS:** Opens the SDE ATS Resume Readiness Checklist.

---

## 8. Common Errors & How to Fix Them

| Problem | Cause | How to Fix |
| :--- | :--- | :--- |
| **"Microphone access blocked"** | You clicked "Block" on the browser popup. | Click the camera/microphone icon on the left side of your browser URL address bar, change permission to **Allow**, and refresh the page. |
| **"Voice input is not supported in this browser"** | You are using a browser without Web Speech API support (e.g., Firefox). | Use **Google Chrome**, **Microsoft Edge**, or Brave. Full text typing works on all browsers! |
| **"Port 3000 in use"** | Another program or previous terminal is using port 3000. | Close the previous terminal or run `npx kill-port 3000`. |
| **"Cannot find module"** | A required dependency is missing. | Run `npm install` in your terminal. |
| **Speech synthesis sounds too fast/slow** | Default system voice rate. | The voice rate is pre-calibrated to a natural 1.05x speed. You can mute voice anytime with the **🔊 Voice On** button. |

---

## 9. Supported Modes & Application Actions

### Dedicated Modes:
- 📋 **Study**: Daily study planning & roadmap guidance.
- 🎓 **GATE**: GATE 2027 PYQ strategy & core subject weightage.
- 💻 **DSA Socratic**: Data structures, algorithms, and hint-first problem solving.
- 🏢 **Placement**: Campus hiring, aptitude, and company rounds.
- ⚙️ **SWE**: System design, Git, backend, databases, and APIs.
- 🌟 **Internship**: Skill gap closure & first-job roadmap.
- 🎙️ **Interview**: Technical mock interview questions & critique.
- 📄 **Resume**: ATS checklist & Google X-Y-Z formula bullets.
- ⚡ **Focus**: Pomodoro session launcher & tracking.

### Application Actions JARVIS Can Execute:
- `start_focus({ duration, topic })` — Opens the live countdown focus timer.
- `open_dsa()` — Opens the DSA problem practice board.
- `open_pyq()` — Opens GATE 2027 preparation view.
- `open_revision()` — Opens the Smart Revision spaced repetition flashcards.
- `show_progress()` — Opens the Readiness factor breakdown.
- `open_resume()` — Opens ATS resume checklist.
- `open_company({ company })` — Opens 7-day company preparation sprint.
- `start_mock_interview()` — Launches AI mock interview modal.
- `open_cse_lab()` — Opens CSE Labs and simulation tools.
- `open_dashboard()` — Returns to the 90-day Home Command Center.

---

💡 **Tip:** You can ask JARVIS general questions anytime without memorizing rigid keywords. Speak naturally, ask for help when you're stuck, and let JARVIS guide your 90-day journey!
