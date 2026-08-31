/**
 * prepService.js
 * Free Preparation Resources Hub (Aptitude, Core CS MCQs, Coding Challenges & Guides)
 */

const APTITUDE_QUIZZES = [
  {
    id: 'apt_1',
    category: 'Quantitative Aptitude',
    question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
    options: ['65 seconds', '89 seconds', '100 seconds', '150 seconds'],
    answer: 1, // 89 seconds
    explanation: 'Speed of train = 240 m / 24 s = 10 m/s. Total distance to pass platform = 240 + 650 = 890 m. Time taken = 890 / 10 = 89 seconds.'
  },
  {
    id: 'apt_2',
    category: 'Logical Reasoning',
    question: 'In a code language, if "ENGINEER" is coded as "FOIKOFFS", how will "SOFTWARE" be coded in the same language?',
    options: ['TPGUXBSE', 'TOHUXASE', 'TPGTYASF', 'SPGTWBSE'],
    answer: 0, // TPGUXBSE
    explanation: 'Each letter is shifted forward by +1 (+1, +1, +1...). S->T, O->P, F->G, T->U, W->X, A->B, R->S, E->F -> TPGUXBSE.'
  },
  {
    id: 'apt_3',
    category: 'Quantitative Aptitude',
    question: 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are opened together, the time taken to fill the tank is:',
    options: ['50 minutes', '12 minutes', '25 minutes', '15 minutes'],
    answer: 1, // 12 minutes
    explanation: 'Part filled in 1 min = 1/20 + 1/30 = (3+2)/60 = 5/60 = 1/12. Hence the tank fills in 12 minutes.'
  }
];

const TECHNICAL_MCQS = [
  {
    id: 'tech_1',
    category: 'Operating Systems',
    question: 'Which of the following conditions is NOT a necessary condition for a deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait'],
    answer: 2, // Preemption
    explanation: 'The Coffman conditions for deadlock are: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. Preemption actually PREVENTS deadlock!'
  },
  {
    id: 'tech_2',
    category: 'DBMS',
    question: 'In relational database normalization, a table is in BCNF (Boyce-Codd Normal Form) if and only if for every functional dependency X -> Y:',
    options: ['Y is a prime attribute', 'X is a super key', 'X is a candidate key or Y is prime', 'Y is a subset of X only'],
    answer: 1, // X is a super key
    explanation: 'For BCNF, every non-trivial functional dependency X -> Y must have X as a super key.'
  },
  {
    id: 'tech_3',
    category: 'Computer Networks',
    question: 'What is the network address and broadcast address of the IP 192.168.10.74/26?',
    options: [
      'Network: 192.168.10.0, Broadcast: 192.168.10.63',
      'Network: 192.168.10.64, Broadcast: 192.168.10.127',
      'Network: 192.168.10.64, Broadcast: 192.168.10.255',
      'Network: 192.168.10.32, Broadcast: 192.168.10.95'
    ],
    answer: 1, // Network: 192.168.10.64, Broadcast: 192.168.10.127
    explanation: 'For /26 mask (255.255.255.192), block size is 256 - 192 = 64. Subnets: 0, 64, 128, 192. 74 falls in [64 - 127]. Network is .64, Broadcast is .127.'
  },
  {
    id: 'tech_4',
    category: 'Data Structures & Algorithms',
    question: 'What is the average and worst-case time complexity of searching in an AVL Tree containing N nodes?',
    options: ['Average O(log N), Worst O(N)', 'Average O(log N), Worst O(log N)', 'Average O(1), Worst O(log N)', 'Average O(N), Worst O(N log N)'],
    answer: 1, // Average O(log N), Worst O(log N)
    explanation: 'An AVL tree strictly maintains a balance factor between -1 and +1, guaranteeing strict O(log N) height in both average and worst cases.'
  }
];

const CODING_CHALLENGES = [
  {
    id: 'code_1',
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    tags: ['Hash Table', 'Array'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution.',
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1, 2]' }
    ]
  },
  {
    id: 'code_2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['Stack', 'String'],
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    starterCode: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
    testCases: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ]
  }
];

const COMPANY_GUIDES = [
  {
    company: 'Zoho Corporation',
    rounds: ['Basic C/Java Round', 'Advanced Programming (Railway/Sudoku)', 'Design Round', 'Technical HR'],
    focusTopics: ['OOPs in C/Java', 'Recursion & Backtracking', 'Matrix Manipulations', 'Data Modeling'],
    tips: 'Practice without IDE auto-complete. Write modular, clean code with descriptive variable names.'
  },
  {
    company: 'Amazon / SDE-1',
    rounds: ['Online Assessment (2 Coding + Work Style)', 'Technical Interview 1 (DSA)', 'Technical Interview 2 (System/Tree/Graph)', 'Bar Raiser (STAR Leadership Principles)'],
    focusTopics: ['Trees, Graphs & DFS/BFS', 'Dynamic Programming', 'Amazon 16 Leadership Principles (Customer Obsession, Ownership)', 'Concurrency'],
    tips: 'Always communicate your thought process out loud. Formulate brute force before jumping to optimal O(N) solutions.'
  }
];

module.exports = {
  getQuizzes: (category) => {
    let all = [...APTITUDE_QUIZZES, ...TECHNICAL_MCQS];
    if (category && category !== 'all') {
      all = all.filter(q => q.category.toLowerCase().includes(category.toLowerCase()));
    }
    return all;
  },
  getCodingChallenges: () => CODING_CHALLENGES,
  getCompanyGuides: () => COMPANY_GUIDES
};
