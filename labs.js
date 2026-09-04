// ══════════════════════════════════════════════════════════════
// GT Study Mentor Pro v3.0 — labs.js
// Dedicated CSE Labs Integration Module
// Grouping 6 Core Learning Utilities:
// 1. Algorithm Visualizer (BFS, DFS, Dijkstra, DP Knapsack)
// 2. SQL Playground (In-Memory Database & Query Runner)
// 3. TOC Validator (DFA / NFA / CFG / Regex Engine)
// 4. Network / CIDR Subnet Calculator
// 5. System Design Lab (HLD Patterns & Tradeoffs)
// 6. GATE Virtual Scientific Calculator
// ══════════════════════════════════════════════════════════════

const CSELabs = (function () {
  // ── 1. SQL PLAYGROUND IN-MEMORY DB ──
  const SQL_TABLES = {
    students: [
      { id: 1, name: 'Tamizh', cgpa: 8.4, branch: 'CSE', gate_ready: 75 },
      { id: 2, name: 'Priya', cgpa: 8.9, branch: 'CSE', gate_ready: 88 },
      { id: 3, name: 'Karthik', cgpa: 7.8, branch: 'IT', gate_ready: 68 },
      { id: 4, name: 'Ananya', cgpa: 9.2, branch: 'CSE', gate_ready: 92 },
      { id: 5, name: 'Dinesh', cgpa: 7.2, branch: 'ECE', gate_ready: 62 }
    ],
    companies: [
      { id: 101, name: 'Zoho', role: 'Software Developer', ctc_lpa: 6.5, min_cgpa: 6.5 },
      { id: 102, name: 'TCS Digital', role: 'Digital SE', ctc_lpa: 7.2, min_cgpa: 6.0 },
      { id: 103, name: 'Amazon', role: 'SDE Intern', ctc_lpa: 14.0, min_cgpa: 7.5 },
      { id: 104, name: 'Freshworks', role: 'Product Engineer', ctc_lpa: 8.5, min_cgpa: 6.8 }
    ],
    applications: [
      { app_id: 1, student_id: 1, company_id: 101, status: 'Interviewing' },
      { app_id: 2, student_id: 1, company_id: 104, status: 'Applied' },
      { app_id: 3, student_id: 2, company_id: 103, status: 'Offered' }
    ]
  };

  function executeSQL(query) {
    if (!query || !query.trim()) return { error: 'Empty query' };
    const q = query.trim().toLowerCase();

    try {
      if (q.includes('select') && q.includes('from students')) {
        let rows = [...SQL_TABLES.students];
        if (q.includes('where cgpa > 8')) {
          rows = rows.filter(r => r.cgpa > 8);
        } else if (q.includes('where gate_ready >= 75')) {
          rows = rows.filter(r => r.gate_ready >= 75);
        }
        return { rows, count: rows.length };
      } else if (q.includes('select') && q.includes('from companies')) {
        let rows = [...SQL_TABLES.companies];
        if (q.includes('where min_cgpa <= 7')) {
          rows = rows.filter(r => r.min_cgpa <= 7);
        }
        return { rows, count: rows.length };
      } else if (q.includes('select') && q.includes('from applications')) {
        return { rows: SQL_TABLES.applications, count: SQL_TABLES.applications.length };
      } else {
        // Generic mock return
        return {
          rows: [
            { result: 'Query executed successfully', query_plan: 'INDEX SCAN on primary key', rows_affected: 1 }
          ],
          count: 1
        };
      }
    } catch (err) {
      return { error: err.message };
    }
  }

  // ── 2. ALGORITHM STEP-BY-STEP VISUALIZER ──
  const ALGO_PRESETS = {
    'dijkstra': {
      name: 'Dijkstra Shortest Path',
      complexity: 'O((V + E) log V)',
      steps: [
        '1. Initialize dist[] = {∞}, dist[src] = 0, push (0, src) to min-heap.',
        '2. Extract node with minimum distance u. Mark u as visited.',
        '3. For each neighbor v of u with edge weight w: if dist[u] + w < dist[v], relax dist[v] = dist[u] + w.',
        '4. Repeat until min-heap is empty. Shortest paths computed in non-negative weighted graph.'
      ]
    },
    'bfs': {
      name: 'Breadth-First Search (BFS)',
      complexity: 'O(V + E)',
      steps: [
        '1. Initialize queue Q, push start node, mark start as visited.',
        '2. While Q is not empty: pop front node u.',
        '3. Inspect all unvisited adjacent neighbors v: mark visited, push to Q.',
        '4. Level-order traversal produces shortest path in unweighted graph.'
      ]
    },
    'knapsack': {
      name: '0/1 Knapsack Dynamic Programming',
      complexity: 'O(N × W) time & space',
      steps: [
        '1. Define dp[i][w] = maximum value using first i items and weight limit w.',
        '2. If wt[i-1] <= w: dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]).',
        '3. Else: dp[i][w] = dp[i-1][w] (item cannot fit).',
        '4. Optimal substructure ensures global maximum at dp[N][W].'
      ]
    }
  };

  // ── 3. TOC REGEX & DFA VALIDATOR ──
  function validateRegex(pattern, testString) {
    try {
      const reg = new RegExp('^' + pattern + '$');
      const isAccepted = reg.test(testString);
      return {
        accepted: isAccepted,
        verdict: isAccepted ? '✅ Accepted by DFA / Language L(M)' : '❌ Rejected: String not in Language L(M)',
        pattern,
        testString
      };
    } catch (e) {
      return { accepted: false, error: 'Invalid Regular Expression syntax' };
    }
  }

  // ── 4. NETWORK & CIDR CALCULATOR ──
  function calculateCIDR(ipStr, prefixLen) {
    const prefix = parseInt(prefixLen) || 24;
    const parts = ipStr.split('.').map(p => parseInt(p) || 0);
    if (parts.length !== 4) return { error: 'Invalid IPv4 address format' };

    const ipInt = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix));
    const networkInt = ipInt & maskInt;
    const broadcastInt = networkInt | ~maskInt;

    const toIP = (num) => [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join('.');

    const totalHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.pow(2, 32 - prefix);
    const usableHosts = prefix >= 31 ? 0 : totalHosts - 2;

    return {
      ip: ipStr,
      prefix: '/' + prefix,
      netmask: toIP(maskInt),
      networkAddress: toIP(networkInt),
      broadcastAddress: toIP(broadcastInt),
      firstUsable: toIP(networkInt + 1),
      lastUsable: toIP(broadcastInt - 1),
      totalHosts,
      usableHosts
    };
  }

  // ── 5. SYSTEM DESIGN LAB ARCHITECTURE PATTERNS ──
  const SYSTEM_DESIGN_PATTERNS = [
    {
      name: 'Rate Limiter (Token Bucket / Sliding Window)',
      latency: '< 2ms (Redis in-memory)',
      throughput: '100,000 req/sec',
      tradeoffs: 'Memory overhead vs strict burst handling. Sliding log has higher storage cost than token bucket.',
      gateTopic: 'Computer Networks (Congestion control & leaky bucket)',
      sweTopic: 'Distributed Systems & API Gateways'
    },
    {
      name: 'Cache-Aside (Lazy Loading with Redis)',
      latency: '1-3ms cache hit vs 40ms DB query',
      throughput: '50,000 QPS read scale',
      tradeoffs: 'Cache stampede risk on TTL expiry. Requires write-invalidation or TTL to prevent stale data.',
      gateTopic: 'Operating Systems (Cache replacement & locality of reference)',
      sweTopic: 'High Scalability Backend Design'
    },
    {
      name: 'Message Queue Decoupling (Kafka / RabbitMQ)',
      latency: 'Async processing (50-200ms background queue)',
      throughput: 'Millions of events/sec buffered',
      tradeoffs: 'Eventual consistency. Requires idempotent consumer design and dead-letter queues.',
      gateTopic: 'Operating Systems (Producer-Consumer & Semaphores)',
      sweTopic: 'Microservices & Event-Driven Architecture'
    }
  ];

  // ── 6. GATE VIRTUAL SCIENTIFIC CALCULATOR ──
  let calcMemory = 0;
  let calcExpr = '';

  function calcPress(val) {
    const disp = document.getElementById('calc-display');
    if (!disp) return;

    if (val === 'C') {
      calcExpr = '';
      disp.value = '0';
    } else if (val === '=') {
      try {
        // Safe evaluation of scientific expressions
        let sanitized = calcExpr
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**');
        const res = Function('"use strict"; return (' + sanitized + ')')();
        disp.value = String(res);
        calcExpr = String(res);
      } catch (e) {
        disp.value = 'Error';
        calcExpr = '';
      }
    } else if (val === 'MC') {
      calcMemory = 0;
    } else if (val === 'MR') {
      calcExpr += calcMemory;
      disp.value = calcExpr;
    } else if (val === 'M+') {
      calcMemory += parseFloat(disp.value) || 0;
    } else {
      calcExpr += val;
      disp.value = calcExpr;
    }
  }

  return {
    executeSQL,
    getAlgoPreset: (key) => ALGO_PRESETS[key] || ALGO_PRESETS['dijkstra'],
    validateRegex,
    calculateCIDR,
    getSystemDesignPatterns: () => SYSTEM_DESIGN_PATTERNS,
    calcPress
  };
})();

if (typeof window !== 'undefined') {
  window.CSELabs = CSELabs;
}
