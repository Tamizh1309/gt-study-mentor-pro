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
    keywords: ['normalization', 'normal form', 'bcnf', '3nf', '2nf', '1nf'],
    title: 'DBMS — Normalization & Normal Forms',
    notes: `• Normalization organizes relations to eliminate insertion, update, and deletion anomalies while minimizing redundant data.
• 1NF: All attribute values must be atomic (no multi-valued attributes or nested records).
• 2NF: In 1NF + Every non-prime attribute is fully functionally dependent on the candidate key (No partial dependencies).
• 3NF: In 2NF + No non-prime attribute depends transitively on the candidate key (For X → Y, either X is a superkey or Y is a prime attribute).
• BCNF (Boyce-Codd): For every non-trivial functional dependency X → Y, X must be a superkey. Guarantees zero redundancy but may not preserve dependencies.`,
    video: {
      title: 'Gate Smashers — Normalization in DBMS (1NF, 2NF, 3NF, BCNF)',
      channel: 'Gate Smashers',
      url: 'https://www.youtube.com/watch?v=5ds-_a_51W4'
    },
    practiceQuestions: [
      {
        q: 'If relation R(A, B, C, D) has functional dependencies AB → C, C → D, and D → A, what are the candidate keys and what is the highest normal form of R?',
        hint: 'Closures: (AB)+ = {A,B,C,D}, (BC)+ = {A,B,C,D}, (BD)+ = {A,B,C,D}. C → D has non-superkey LHS but D is prime. Hence 3NF.'
      },
      {
        q: 'Can a binary relation R(A, B) with only two attributes ever violate BCNF?',
        hint: 'No. Any non-trivial FD must be A → B or B → A, making the LHS a superkey.'
      },
      {
        q: 'Which normal form strictly eliminates all transitive dependencies on candidate keys?',
        hint: '3NF (Third Normal Form).'
      }
    ]
  },
  {
    keywords: ['deadlock', 'dead lock', 'banker'],
    title: 'Operating Systems — Deadlocks & Banker\'s Algorithm',
    notes: `• Deadlock is a permanent stalled state where a set of processes are blocked because each is holding a resource and waiting for another.
• 4 Necessary Coffman Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
• Handling Strategies:
  1. Prevention: Invalidate at least one Coffman condition (e.g. acquire all resources upfront).
  2. Avoidance: Dynamic validation using Banker\'s Algorithm (Safe State vs Unsafe State).
  3. Detection & Recovery: Wait-For-Graph cycle check + abort victim processes.
  4. Ostrich Algorithm: Ignore the problem if occurrence is rare (standard in general-purpose OS).`,
    video: {
      title: 'Gate Smashers — Deadlock in Operating System & Banker\'s Algorithm',
      channel: 'Gate Smashers',
      url: 'https://www.youtube.com/watch?v=UbhvPshcaQk'
    },
    practiceQuestions: [
      {
        q: 'If 3 processes each request 2 units of resource R, what is the minimum units of R to guarantee deadlock freedom?',
        hint: 'Formula: Total >= sum(Max_i - 1) + 1 = (2-1) + (2-1) + (2-1) + 1 = 4 units.'
      },
      {
        q: 'Is an unsafe state in Banker\'s Algorithm necessarily a deadlocked state?',
        hint: 'No. An unsafe state is not a deadlock, but it may lead to one if processes request their maximum claims.'
      },
      {
        q: 'Which condition is broken if resources are ordered numerically and requested in strictly increasing order?',
        hint: 'Circular Wait.'
      }
    ]
  },
  {
    keywords: ['binary search', 'search in sorted', 'divide and conquer search'],
    title: 'Data Structures & Algorithms — Binary Search',
    notes: `• Binary Search is a divide-and-conquer searching algorithm on monotonic/sorted sequences.
• Formula: mid = low + ((high - low) >> 1) to prevent 32-bit integer overflow.
• Comparison logic:
  - target === arr[mid]: Found at mid.
  - target < arr[mid]: search left half (high = mid - 1).
  - target > arr[mid]: search right half (low = mid + 1).
• Time Complexity: O(log N) — eliminates half the search space per iteration.
• Space Complexity: O(1) iterative, O(log N) recursive.`,
    video: {
      title: 'Abdul Bari — Binary Search Algorithm & Recurrence Relations',
      channel: 'Abdul Bari',
      url: 'https://www.youtube.com/watch?v=C2apEw9pgtw'
    },
    practiceQuestions: [
      {
        q: 'How many maximum comparisons does binary search take in a sorted array of 1,000,000 elements?',
        hint: 'ceil(log2(1,000,000)) = 20 comparisons.'
      },
      {
        q: 'How do you adapt binary search to find the lower bound (first index where arr[i] >= target)?',
        hint: 'When arr[mid] >= target, record ans = mid and move high = mid - 1.'
      }
    ]
  },
  {
    keywords: ['tcp', 'udp', 'transport layer'],
    title: 'Computer Networks — TCP vs UDP',
    notes: `• TCP (Transmission Control Protocol): Connection-oriented, reliable, byte-stream, 3-way handshake (SYN, SYN-ACK, ACK), sliding-window flow control, Reno/Cubic congestion control. Used for HTTP, SSH, FTP.
• UDP (User Datagram Protocol): Connectionless, unreliable datagrams, zero handshake, minimal 8-byte header, no flow/congestion control, ultra-low latency. Used for DNS, VoIP, gaming, live streaming.`,
    video: {
      title: 'Gate Smashers — TCP vs UDP Protocol Differences',
      channel: 'Gate Smashers',
      url: 'https://www.youtube.com/watch?v=uwoD5P0c1x0'
    },
    practiceQuestions: [
      {
        q: 'What is the header size of UDP vs minimum header size of TCP?',
        hint: 'UDP header is 8 bytes. TCP minimum header is 20 bytes (up to 60 bytes with options).'
      },
      {
        q: 'Why does DNS primarily use UDP over port 53 for standard lookups?',
        hint: 'A single query and response fits in one packet, avoiding the latency overhead of a 3-way handshake.'
      }
    ]
  },
  {
    keywords: ['polymorphism', 'oops', 'object oriented'],
    title: 'Software Engineering — Polymorphism',
    notes: `• Polymorphism allows a single interface or method identifier to execute different behaviors depending on data types or object instances.
• Compile-Time (Static): Function Overloading & Operator Overloading resolved by compiler signature matching.
• Run-Time (Dynamic): Method Overriding resolved via Virtual Method Tables (vtable) and dynamic dispatch.`,
    video: {
      title: 'Apna College — Object Oriented Programming & Polymorphism in C++/Java',
      channel: 'Apna College',
      url: 'https://www.youtube.com/watch?v=bSrm9RXwBaI'
    },
    practiceQuestions: [
      {
        q: 'In C++, what keyword is required in the base class to enable dynamic runtime polymorphism?',
        hint: 'The "virtual" keyword on member functions.'
      },
      {
        q: 'Can a private method in a Java base class be overridden in a subclass?',
        hint: 'No. Private methods are not visible to subclasses and cannot be overridden.'
      }
    ]
  },
  {
    keywords: ['operating system', 'os', 'kernel'],
    title: 'Operating Systems — Core Fundamentals',
    notes: `• An Operating System coordinates computer hardware and provides abstractions for user applications.
• Core pillars:
  1. Process & Thread Scheduling (Context switching, CFS, Round Robin).
  2. Memory Management (Virtual memory, demand paging, TLB, page replacement).
  3. Storage Architecture (Ext4, NTFS, inode structures, disk scheduling).
  4. Concurrency & Synchronization (Semaphores, mutexes, condition variables, spinlocks).`,
    video: {
      title: 'Gate Smashers — Introduction to Operating Systems',
      channel: 'Gate Smashers',
      url: 'https://www.youtube.com/watch?v=bkSWJJZNgf8'
    },
    practiceQuestions: [
      {
        q: 'What is the difference between a process and a thread?',
        hint: 'A process has its own address space; threads share the process heap, code, and global memory but have private call stacks.'
      },
      {
        q: 'What hardware mechanism allows the CPU to switch from User Mode to Kernel Mode?',
        hint: 'Interrupts, system calls (traps), and hardware exceptions.'
      }
    ]
  },
  {
    keywords: ['raft', 'consensus', 'distributed system', 'vortex'],
    title: 'Distributed Systems — Raft Consensus Protocol',
    notes: `• Raft decomposes distributed consensus into three independent sub-problems:
  1. Leader Election: Heartbeat timeouts trigger Candidate state; candidate with majority votes wins term.
  2. Log Replication: Leader appends client commands to local log and sends AppendEntries RPCs to followers.
  3. Safety: Leader completeness guarantee ensures any committed entry exists in all future leaders.
• Quorum requirement: Any write requires acknowledgment from ⌊N/2⌋ + 1 nodes.`,
    video: {
      title: 'MIT 6.824: Distributed Systems — Raft Consensus',
      channel: 'MIT OpenCourseWare',
      url: 'https://www.youtube.com/watch?v=R2-9bsKmEbo'
    },
    practiceQuestions: [
      {
        q: 'In a 5-node Raft cluster, how many nodes can fail while still committing new client writes?',
        hint: 'Majority of 5 is 3. Therefore, at most 2 nodes can fail (5 - 3 = 2).'
      },
      {
        q: 'How does Raft prevent split votes when multiple nodes start election simultaneously?',
        hint: 'Randomized election timeouts (typically 150ms–300ms).'
      }
    ]
  },
  {
    keywords: ['time complexity', 'big o', 'space complexity'],
    title: 'DSA — Asymptotic Complexity & Big-O Notation',
    notes: `• Big-O notation describes the asymptotic worst-case upper bound of runtime or auxiliary space:
  - O(1): Constant (hash map lookup, push/pop on stack).
  - O(log N): Logarithmic (binary search, divide-and-conquer).
  - O(N): Linear (array traversal, linear search).
  - O(N log N): Linearithmic (Merge Sort, Heap Sort, Quick Sort average).
  - O(N²): Quadratic (nested loops, Bubble Sort).
  - O(2ⁿ): Exponential (subsets, tower of Hanoi).`,
    video: {
      title: 'Abdul Bari — Analysis of Algorithms & Asymptotic Notations',
      channel: 'Abdul Bari',
      url: 'https://www.youtube.com/watch?v=9TlHvipP5yA'
    },
    practiceQuestions: [
      {
        q: 'What is the tightest Big-O time complexity of solving T(N) = 2T(N/2) + O(N) using Master Theorem?',
        hint: 'Case 2 of Master Theorem: a = 2, b = 2, f(N) = O(N^1). Since N^(log_2 2) = N^1, T(N) = O(N log N).'
      }
    ]
  },
  {
    keywords: ['recursion', 'recursive', 'base case'],
    title: 'DSA — Recursion & Stack Frames',
    notes: `• Recursion solves a problem by having a function invoke itself on smaller inputs.
• Two non-negotiable components:
  1. Base Case: Terminates recursive expansion to prevent call stack overflow.
  2. Recursive Transition: Progresses toward the base case while combining sub-solutions.
• Stack frame overhead: Auxiliary space equals maximum depth of the recursive call tree: O(Depth).`,
    video: {
      title: 'Striver — Recursion & Backtracking Masterclass',
      channel: 'take U forward',
      url: 'https://www.youtube.com/watch?v=yVdKa8dnKiE'
    },
    practiceQuestions: [
      {
        q: 'What is tail-call optimization and how does it optimize recursive space complexity?',
        hint: 'When the recursive call is the final operation in the function, compilers can reuse the existing stack frame, reducing space from O(N) to O(1).'
      }
    ]
  },
  {
    keywords: ['pointer', 'pointers', 'memory address', 'dereference'],
    title: 'Programming — Pointers & Dynamic Memory',
    notes: `• A pointer variable stores the virtual memory address of another variable.
• Address-of operator (&): Obtains memory address.
• Dereference operator (*): Accesses or mutates value at the referenced address.
• Enables manual heap allocation (malloc/free, new/delete), references, and linked data structures.`,
    video: {
      title: 'freeCodeCamp — Pointers in C / C++ Full Course',
      channel: 'freeCodeCamp',
      url: 'https://www.youtube.com/watch?v=zuegQmMdy8M'
    },
    practiceQuestions: [
      {
        q: 'What is a dangling pointer and how is it created?',
        hint: 'A pointer pointing to a memory location that has already been deallocated/freed.'
      }
    ]
  },
  {
    keywords: ['rest', 'rest api', 'http methods', 'restful'],
    title: 'Software Engineering — RESTful Architecture',
    notes: `• REST (Representational State Transfer) constraints:
  1. Stateless: Server stores no client session context across requests.
  2. Client-Server Separation: Frontend concerns isolated from persistent data storage.
  3. Standardized HTTP Verbs: GET (Read), POST (Create), PUT/PATCH (Update), DELETE (Remove).
  4. Cacheable responses with standard status codes (200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error).`,
    video: {
      title: 'Hussein Nasser — REST API Design Best Practices',
      channel: 'Hussein Nasser',
      url: 'https://www.youtube.com/watch?v=qbLc5a9jdXo'
    },
    practiceQuestions: [
      {
        q: 'What is the idempotency requirement of HTTP PUT vs HTTP POST?',
        hint: 'PUT is idempotent (repeating the same request yields identical state); POST is non-idempotent.'
      }
    ]
  }
];

function formatCuratedMentorResponse(item) {
  let out = `### 📝 Concept Notes: ${item.title}\n\n`;
  out += (item.notes || item.answer) + '\n\n';
  if (item.video) {
    out += `---\n\n### 📺 Curated Video Lesson\n`;
    out += `▶ **[${item.video.title}](${item.video.url})** *(${item.video.channel})*\n\n`;
  }
  if (item.practiceQuestions && item.practiceQuestions.length > 0) {
    out += `---\n\n### 🎯 Practice Questions to Test Understanding\n`;
    item.practiceQuestions.forEach((pq, idx) => {
      out += `**${idx + 1}. ${pq.q}**\n*💡 Hint:* ${pq.hint}\n\n`;
    });
    out += `*Reply with your answers or ask me for a step-by-step hint!*`;
  }
  return out;
}

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
      return formatCuratedMentorResponse(item);
    }
  }

  // 2. Weak area query check (Rule: Never invent fake weak areas)
  if (lower.includes('weak')) {
    if (!context.day || context.day === 0 || !context.weakTopics || context.weakTopics.length === 0) {
      return "No data yet. Complete 10 questions to identify weak spots. As you practice questions in the Practice Arena, recurring mistakes will be categorized into Red (<40%), Yellow (40–70%), and Green (>70%) proficiency levels!";
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
  LOCAL_KNOWLEDGE_BASE,
  formatCuratedMentorResponse
};
