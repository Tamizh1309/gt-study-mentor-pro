/**
 * ============================================================================
 * GT JARVIS — AI Provider & Multi-Model Execution Engine
 * File: backend/jarvis/aiProvider.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Implements the multi-model execution layer specified in the Blueprint:
 * - FreeLLMAPI (Local gateway)
 * - OmniRouter (Multi-model routing layer)
 * - GLM (High-yield reasoning provider)
 * - Kimi (Long-context document & resume provider)
 * - DeepSeek (Algorithmic reasoning & coding provider)
 * - Google Gemini (Cloud assistant fallback)
 * - Local High-Yield CSE Intelligence (100% resilient offline fallback)
 * 
 * Observes provider health via circuit breaker and verifies technical output.
 */

const { routeTask } = require('./modelRouter');
const { isAvailable, recordSuccess, recordFailure } = require('./providerHealth');
const { verifyResponse } = require('./verifier');

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
  },
  {
    keywords: ['recursion', 'recursive', 'base case'],
    title: 'DSA — Recursion & Stack Frames',
    answer: "Recursion occurs when a function calls itself to solve a smaller instance of the same problem. Every recursive solution requires:\n1. Base Case: The condition that terminates recursion to prevent stack overflow.\n2. Recursive Step: Dividing the problem and calling itself with a smaller input toward the base case.\n\nUnder the hood, each recursive call pushes a new stack frame onto the Call Stack storing local variables and return addresses. Space complexity is proportional to the maximum recursion tree depth: O(Depth)."
  },
  {
    keywords: ['normalization', 'normal form', 'bcnf', '3nf', '2nf', '1nf'],
    title: 'DBMS — Normalization & Functional Dependencies',
    answer: "Normalization organizes database tables to minimize redundancy and prevent insertion, update, and deletion anomalies:\n• 1NF: Atomic column values (no multi-valued attributes or repeating groups).\n• 2NF: In 1NF + No partial dependency (every non-key attribute fully functionally dependent on primary key).\n• 3NF: In 2NF + No transitive dependency (non-prime attributes depend only on candidate keys).\n• BCNF: Stricter 3NF where for every functional dependency X → Y, X must be a super key."
  },
  {
    keywords: ['pointer', 'pointers', 'memory address', 'dereference'],
    title: 'Programming — Pointers & Memory Management',
    answer: "A pointer is a variable that stores the memory address of another variable rather than storing a direct value:\n• Address-of operator (&x): Retrieves the physical memory address of variable x.\n• Dereference operator (*p): Accesses or modifies the value stored at the memory address pointed to by p.\n• Pointers enable dynamic memory allocation (heap via malloc/new), efficient pass-by-reference without cloning large structs, and linked data structure implementations (linked lists, trees, graphs)."
  },
  {
    keywords: ['rest', 'rest api', 'http methods', 'restful'],
    title: 'Software Engineering — RESTful Architecture',
    answer: "REST (Representational State Transfer) is an architectural style for networked distributed systems adhering to 6 core constraints:\n1. Stateless: Every request contains all information needed to process it; server stores no client session context.\n2. Client-Server Separation: UI concerns separated from data storage.\n3. Uniform Interface: Standardized HTTP verbs (GET: read, POST: create, PUT/PATCH: update, DELETE: remove) and URI resources.\n4. Cacheable: Responses explicitly define whether they can be cached.\n5. Layered System: Client cannot tell whether it is connected directly to end server or proxy/load balancer."
  }
];

/**
 * Builds standard system prompt for student context
 */
function buildSystemPrompt(context = {}, mode = 'study') {
  const currentDay = context.day ?? 0;
  return `You are GT JARVIS, the intelligent, calm, concise AI career preparation mentor inside GT Study Mentor Pro for a Computer Science student preparing for GATE 2027, Placements, SWE, and Internships.
Current Mode: ${mode.toUpperCase()}
Student State:
- Day: Day ${currentDay} / 90
- Readiness Scores: GATE ${context.readinessScores?.gate ?? 0}%, Placements ${context.readinessScores?.placement ?? 0}%, SWE ${context.readinessScores?.swe ?? 0}%, Internship ${context.readinessScores?.internship ?? 0}%
- Pending Mistakes: ${context.pendingMistakes ?? 0}
- Target Goal: ${context.targetRole || 'GATE 2027 + SWE'}

Operational Rules:
1. Speak professionally, calmly, and concisely (2-3 structured paragraphs max).
2. Answer the student's actual question directly from first principles.
3. If Day is 0, do not fabricate prior tests or metrics; guide them in orientation.
4. If in DSA mode, offer Socratic conceptual hints before the full implementation.
5. Never invent fake metrics or guaranteed admission claims.`;
}

/**
 * Executes a call to any OpenAI-compatible endpoint (DeepSeek, Kimi, GLM, OmniRouter, FreeLLMAPI)
 */
async function callOpenAICompatible(providerKey, endpointUrl, apiKey, modelName, prompt, context, mode) {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey || 'bearer-token'}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: buildSystemPrompt(context, mode) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 700
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Provider ${providerKey} returned status ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply || !reply.trim()) {
      throw new Error(`Empty response from ${providerKey}`);
    }

    recordSuccess(providerKey, Date.now() - startTime);
    return reply.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    recordFailure(providerKey, err);
    throw err;
  }
}

/**
 * Calls Google Gemini API if configured
 */
async function callGemini(apiKey, modelName, prompt, context, mode) {
  const startTime = Date.now();
  const model = modelName || process.env.JARVIS_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${buildSystemPrompt(context, mode)}\n\nStudent asks: "${prompt}"` }]
      }
    ],
    generationConfig: { temperature: 0.4, maxOutputTokens: 600 }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty candidate from Gemini');

    recordSuccess('gemini', Date.now() - startTime);
    return text.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    recordFailure('gemini', err);
    throw err;
  }
}

/**
 * Master response generator with task-based routing, circuit breaking, and response verification
 * @param {string} prompt - Student message
 * @param {Object} context - Preparation context
 * @param {string} mode - Active JARVIS mode
 * @returns {Promise<{ text: string, source: string, routing: Object, verified: boolean }>}
 */
async function generateResponse(prompt, context = {}, mode = 'study') {
  // 1. Get task-based routing decision
  const routing = routeTask(prompt, context, mode);
  const candidates = [routing.provider, ...routing.fallbacks];

  let rawResultText = null;
  let usedSource = 'local-intelligence';

  // 2. Iterate through candidate chain based on availability & configuration
  for (const provider of candidates) {
    if (!isAvailable(provider)) continue;

    try {
      if (provider === 'deepseek' && (process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_URL)) {
        const url = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
        rawResultText = await callOpenAICompatible('deepseek', url, process.env.DEEPSEEK_API_KEY, routing.model, prompt, context, mode);
        usedSource = 'deepseek';
        break;
      }

      if (provider === 'kimi' && (process.env.KIMI_API_KEY || process.env.KIMI_API_URL)) {
        const url = process.env.KIMI_API_URL || 'https://api.moonshot.cn/v1/chat/completions';
        rawResultText = await callOpenAICompatible('kimi', url, process.env.KIMI_API_KEY, routing.model, prompt, context, mode);
        usedSource = 'kimi';
        break;
      }

      if (provider === 'glm' && (process.env.GLM_API_KEY || process.env.GLM_API_URL)) {
        const url = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        rawResultText = await callOpenAICompatible('glm', url, process.env.GLM_API_KEY, routing.model, prompt, context, mode);
        usedSource = 'glm';
        break;
      }

      if (provider === 'omnirouter' && (process.env.OMNIROUTER_API_KEY || process.env.OMNIROUTER_BASE_URL)) {
        const url = process.env.OMNIROUTER_BASE_URL || 'https://omnirouter.li/v1/chat/completions';
        rawResultText = await callOpenAICompatible('omnirouter', url, process.env.OMNIROUTER_API_KEY, routing.model, prompt, context, mode);
        usedSource = 'omnirouter';
        break;
      }

      if (provider === 'freellmapi' && (process.env.JARVIS_API_URL || process.env.FREELLMAPI_URL)) {
        const url = process.env.FREELLMAPI_URL || process.env.JARVIS_API_URL || 'http://127.0.0.1:3001/v1/chat/completions';
        rawResultText = await callOpenAICompatible('freellmapi', url, process.env.JARVIS_API_KEY || 'local-key', routing.model, prompt, context, mode);
        usedSource = 'freellmapi';
        break;
      }

      if (provider === 'gemini' && (process.env.JARVIS_API_KEY || process.env.GEMINI_API_KEY)) {
        const key = process.env.JARVIS_API_KEY || process.env.GEMINI_API_KEY;
        rawResultText = await callGemini(key, routing.model, prompt, context, mode);
        usedSource = 'gemini-cloud';
        break;
      }

      if (provider === 'local') {
        rawResultText = generateLocalCSEAnswer(prompt, context, mode);
        usedSource = 'local-intelligence';
        recordSuccess('local', 5);
        break;
      }
    } catch (err) {
      console.warn(`[JARVIS Router] Provider ${provider} failed, trying next fallback:`, err.message);
    }
  }

  // 3. Absolute fallback to local intelligence if all else failed
  if (!rawResultText) {
    rawResultText = generateLocalCSEAnswer(prompt, context, mode);
    usedSource = 'local-intelligence';
    recordSuccess('local', 5);
  }

  // 4. Response Verification & Consensus Guard
  const verification = verifyResponse(rawResultText, routing.taskType, context);

  return {
    text: verification.verifiedText || rawResultText,
    source: usedSource,
    routing: {
      taskType: routing.taskType,
      selectedProvider: usedSource,
      intendedProvider: routing.provider,
      reason: routing.reason
    },
    verified: verification.verified,
    verificationNotes: verification.notes
  };
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
