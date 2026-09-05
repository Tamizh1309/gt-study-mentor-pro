/**
 * ============================================================================
 * GT JARVIS — AI Provider (Provider-Agnostic Engine)
 * File: backend/jarvis/aiProvider.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * This module is responsible for generating intelligent answers for the student.
 * It is "provider-agnostic", meaning you can connect it to Google Gemini,
 * OpenAI, or use the built-in Local CSE Intelligence.
 * 
 * WHY IT EXISTS:
 * 1. Security: API keys stay safe on the backend (never exposed in the browser).
 * 2. Reliability: If the internet drops or no API key is set, the built-in
 *    Local CSE Intelligence takes over with ZERO downtime or crashes!
 * 3. Simplicity: Uses Node.js native `fetch`, so no complex external SDKs are needed.
 */

// Local high-yield CSE intelligence database for instant offline answering
const LOCAL_KNOWLEDGE_BASE = [
  {
    keywords: ['deadlock', 'dead lock', 'banker'],
    title: 'Operating Systems — Deadlock',
    answer: "A deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process. The four necessary Coffman conditions are:\n1. Mutual Exclusion (non-shareable resources)\n2. Hold and Wait (holding one resource while waiting for another)\n3. No Preemption (resources cannot be forcibly taken)\n4. Circular Wait (a circular chain of waiting exists).\n\nTo prevent deadlocks, we break at least one of these conditions, or use Banker's Algorithm for avoidance."
  },
  {
    keywords: ['binary search', 'search in sorted', 'divide and conquer search'],
    title: 'Data Structures & Algorithms — Binary Search',
    answer: "Binary Search is a divide-and-conquer searching algorithm for sorted arrays. Instead of scanning linearly (O(N)), it compares the target with the middle element (mid = low + (high - low) / 2):\n• If target === arr[mid], return mid.\n• If target < arr[mid], narrow search to left half (high = mid - 1).\n• If target > arr[mid], narrow search to right half (low = mid + 1).\n\nTime Complexity: O(log N) — eliminates half the remaining elements each step.\nSpace Complexity: O(1) iterative, O(log N) recursive."
  },
  {
    keywords: ['tcp', 'udp', 'transport layer'],
    title: 'Computer Networks — TCP vs UDP',
    answer: "TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are transport layer protocols:\n• TCP is connection-oriented, reliable, guarantees in-order delivery using 3-way handshakes, sequence numbers, and ACKs. It handles flow control and congestion control. (Used for HTTP/HTTPS, SSH, File transfers).\n• UDP is connectionless, lightweight, and does not guarantee packet delivery or order. There are no ACKs or retransmissions, resulting in ultra-low latency. (Used for DNS, live video streaming, multiplayer gaming, VoIP)."
  },
  {
    keywords: ['polymorphism', 'oops', 'object oriented'],
    title: 'Software Engineering — Polymorphism',
    answer: "Polymorphism (meaning 'many forms') allows an entity (like a function or object) to take on multiple forms in Object-Oriented Programming:\n1. Compile-Time (Static) Polymorphism: Achieved via Method Overloading or Operator Overloading. Resolved at compile time.\n2. Run-Time (Dynamic) Polymorphism: Achieved via Method Overriding using inheritance and virtual functions/interfaces. The method called is determined at runtime based on the actual object instance."
  },
  {
    keywords: ['operating system', 'os', 'kernel'],
    title: 'Operating Systems — Core Fundamentals',
    answer: "An Operating System (OS) is system software that acts as an intermediary between computer hardware and user applications. Its primary responsibilities include:\n1. Process Management (scheduling, CPU allocation, context switching)\n2. Memory Management (virtual memory, paging, segmentation)\n3. Storage & File Management (file systems, disk scheduling)\n4. I/O Device Management (device drivers, buffering, interrupts)\n5. Protection & Security (user modes vs kernel mode)."
  },
  {
    keywords: ['raft', 'consensus', 'distributed system', 'vortex'],
    title: 'Distributed Systems — Raft Consensus Protocol',
    answer: "Raft is a distributed consensus algorithm designed to be easily understood and implemented. It manages a replicated log across a cluster of nodes:\n• Leader Election: Nodes start as Followers. If they don't receive heartbeats within a randomized election timeout, they become Candidates and request votes. A Candidate with a majority of votes becomes Leader.\n• Log Replication: The Leader receives client writes, writes to its log, and broadcasts AppendEntries to followers.\n• Quorum: A write is committed only after a majority (⌊N/2⌋ + 1) of nodes acknowledge it, guaranteeing consistency even during network partitions."
  },
  {
    keywords: ['time complexity', 'big o', 'space complexity'],
    title: 'DSA — Asymptotic Notation & Big-O',
    answer: "Big-O notation describes the upper bound of an algorithm's execution time or memory consumption as the input size N grows toward infinity:\n• O(1): Constant time (hash map lookup, array index access)\n• O(log N): Logarithmic (binary search, balanced BST operations)\n• O(N): Linear (single loop, array traversal)\n• O(N log N): Linearithmic (Merge Sort, Heap Sort, efficient Quick Sort)\n• O(N²): Quadratic (nested loops, Bubble/Insertion sort)\n• O(2ⁿ): Exponential (naive recursive Fibonacci, subsets generation)"
  }
];

/**
 * Generates an answer based on user query and preparation context
 * @param {string} prompt - User's question or message
 * @param {object} context - Student's preparation context
 * @param {string} mode - Active JARVIS mode (study, gate, dsa, placement, etc.)
 * @returns {Promise<{ text: string, source: string }>}
 */
async function generateResponse(prompt, context = {}, mode = 'study') {
  const apiKey = process.env.JARVIS_API_KEY || process.env.GEMINI_API_KEY;
  const provider = (process.env.JARVIS_PROVIDER || (apiKey ? 'gemini' : 'local')).toLowerCase();

  // If an API key is configured, attempt the cloud AI provider
  if (apiKey && provider === 'gemini') {
    try {
      const response = await callGeminiAPI(prompt, context, mode, apiKey);
      if (response && response.trim().length > 0) {
        return { text: response.trim(), source: 'gemini-cloud' };
      }
    } catch (err) {
      console.warn('[JARVIS AI Provider] Cloud provider failed or rate-limited. Falling back gracefully to Local CSE Intelligence.', err.message);
    }
  }

  // Fallback / Default: Fast, reliable, offline-ready Local CSE Intelligence
  return {
    text: generateLocalCSEAnswer(prompt, context, mode),
    source: 'local-intelligence'
  };
}

/**
 * Calls Google Gemini REST API using native fetch
 */
async function callGeminiAPI(prompt, context, mode, apiKey) {
  const model = process.env.JARVIS_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Build a concise system prompt with student context
  const currentDay = context.day ?? 0;
  const systemInstruction = `You are JARVIS, an intelligent, calm, concise, and highly supportive personal study and career AI assistant inside GT Study Mentor Pro for a Computer Science student preparing for GATE 2027, Placements, SWE, and Internships.
Current Mode: ${mode.toUpperCase()}
Student Context:
- Active Day: Day ${currentDay} / 90 (${context.phase || (currentDay === 0 ? 'Day 0: Setup & Orientation' : `Phase 1: Foundation (Day ${currentDay})`)})
- Readiness Scores: GATE ${context.readinessScores?.gate ?? 0}%, Placements ${context.readinessScores?.placement ?? 0}%, SWE ${context.readinessScores?.swe ?? 0}%, Internship ${context.readinessScores?.internship ?? 0}%
- Pending Mistakes in Mistake Book: ${context.pendingMistakes ?? 0}
- Target: ${context.targetRole || 'Not configured yet'}

Personality & Rules:
1. Speak naturally, professionally, and concisely (2-4 paragraphs max).
2. Answer the user's actual question directly from first principles.
3. If Day is 0 or no study history exists, do NOT invent fake progress, weak topics, or past scores. State honestly that they are at Day 0 and guide them to begin.
4. If in DSA mode and the user is solving a problem, offer Socratic hints before the full solution.
5. If appropriate, recommend a safe next action inside the app (e.g. "Shall I start a 45-minute focus session?").
6. Never invent fake metrics or selection probabilities.`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemInstruction}\n\nStudent asks: "${prompt}"` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 600
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000); // 9-second timeout

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || null;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Built-in high-yield Local CSE Intelligence Engine
 */
function generateLocalCSEAnswer(prompt, context = {}, mode = 'study') {
  const lower = prompt.toLowerCase();

  // 1. Check curated CSE knowledge base
  for (const item of LOCAL_KNOWLEDGE_BASE) {
    if (item.keywords.some(k => lower.includes(k))) {
      return `**${item.title}**\n\n${item.answer}\n\n*Would you like me to start a focused practice session or explore a practice question on this topic?*`;
    }
  }

  // 2. Weak area query check (Rule: Never invent fake weak areas)
  if (lower.includes('weak')) {
    if (!context.day || context.day === 0 || !context.weakTopics || context.weakTopics.length === 0) {
      return "I don't have enough tracked data yet to identify a weak area. As you practice DSA, attempt quizzes, and complete focus sessions, any recurring errors will be tracked in your Mistake Book!";
    }
    return `Based on your tracked activity, your current areas requiring reinforcement are: ${context.weakTopics.join(', ')}. Would you like to start a focused practice session on one of them?`;
  }

  // 3. Day 0 Planning guidance
  if (!context.day || context.day === 0) {
    if (lower.includes('what should i study') || lower.includes('what to do') || lower.includes('plan') || lower.includes('today')) {
      return "Welcome to Day 0 of your 90-Day Career Preparation OS! Your first step is completing your Day 0 onboarding setup. Once configured, we will launch Day 1 with your foundational DSA and Core CS study blocks. Click 'Begin Day 0' on your dashboard to get started!";
    }
  }

  // 4. Mode-specific contextual answers
  if (mode === 'dsa' || lower.includes('dsa') || lower.includes('algorithm') || lower.includes('code')) {
    return "In DSA problem solving, always start with: 1) Identify input constraints & edge cases, 2) State the brute-force approach and its Big-O, 3) Optimize using standard patterns (Two-pointers, Sliding window, Frequency hashing, or DP).\n\nShall I open today's DSA practice board or test a problem together?";
  }

  if (mode === 'gate' || lower.includes('gate')) {
    const gateScore = context.readinessScores?.gate ?? 0;
    return `For GATE CS preparation, foundational weightage lies in Operating Systems (Deadlocks, Virtual Memory), DBMS (Normalization, Transactions), Computer Networks (Subnetting, TCP/IP), and Theory of Computation (Regular Expressions, Decidability).\n\nYour tracked GATE readiness is currently ${gateScore}%. Start your foundational syllabus blocks to begin building your score!`;
  }

  if (mode === 'interview' || lower.includes('interview')) {
    return "In technical interviews, interviewers evaluate 4 distinct vectors: 1) Problem Comprehension & Clarifying Questions, 2) Structural Architecture & Trade-offs, 3) Clean, Idiomatic Code, 4) Testing Edge Cases (null, negative, duplicates).\n\nWould you like to launch a simulated AI technical mock interview now?";
  }

  if (mode === 'resume' || lower.includes('resume') || lower.includes('ats')) {
    return "To make your resume ATS-ready: 1) Frame achievements using Google's X-Y-Z formula: 'Accomplished [X], as measured by [Y], by doing [Z]'. 2) Include quantifiable metrics (latency reduction, QPS, memory footprint). 3) Highlight systems projects like distributed consensus clusters or high-throughput servers.\n\nI can open the Resume ATS scanner for you.";
  }

  // 5. Default friendly contextual guidance
  const day = context.day ?? 0;
  return `I'm tracking your preparation journey across GATE 2027, Placements, SWE, and Internships. You are currently at Day ${day} of 90. You can ask me any technical CS concept, request Socratic hints for a problem, or ask me to "Start a focus session" anytime!`;
}

module.exports = {
  generateResponse,
  LOCAL_KNOWLEDGE_BASE
};
