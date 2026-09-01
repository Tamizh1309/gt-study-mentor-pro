// ══════════════════════════════════════════════════════════════
// GT Study Mentor Pro 2.0 — Mistake Book & FSRS Spaced Repetition
// ══════════════════════════════════════════════════════════════

const MistakeBookModule = (function () {
  const MISTAKES_STORAGE_KEY = 'gt_mentor_mistakes_v2';
  const FSRS_STORAGE_KEY = 'gt_mentor_fsrs_cards_v2';

  let mistakes = [
    {
      id: 'mstk-1',
      question: 'In Banker\'s Algorithm, if Allocation = [1, 2, 2] and Max = [3, 3, 2], what is the Need vector?',
      subject: 'Operating Systems',
      topic: 'Deadlocks',
      userWrongAnswer: 'Need = [4, 5, 4] (Added instead of subtracted)',
      correctAnswer: 'Need = Max - Allocation = [2, 1, 0]',
      concept: 'Need matrix in Banker\'s Algorithm is strictly calculated as Max[i][j] - Allocation[i][j].',
      mistakeType: 'Calculation Error',
      dateAdded: '2026-08-28',
      attempts: 2,
      resolved: false
    },
    {
      id: 'mstk-2',
      question: 'What is the time complexity of building a heap from an unsorted array of N elements?',
      subject: 'Data Structures & Algorithms',
      topic: 'Heaps & Priority Queues',
      userWrongAnswer: 'O(N log N) (Confused repeated insertion with bottom-up heapify)',
      correctAnswer: 'O(N)',
      concept: 'Bottom-up heapify (BuildHeap) sums heights of subtrees, resulting in a convergent geometric progression bounded by O(N).',
      mistakeType: 'Concept Gap',
      dateAdded: '2026-08-29',
      attempts: 1,
      resolved: false
    },
    {
      id: 'mstk-3',
      question: 'A box contains 5 red and 3 green balls. Two balls are drawn at random without replacement. Find P(both red).',
      subject: 'Quantitative Aptitude',
      topic: 'Probability',
      userWrongAnswer: '25/64 (Treated with replacement)',
      correctAnswer: '(5/8) * (4/7) = 20/56 = 5/14',
      concept: 'Without replacement alters the sample space on the second draw (7 remaining total, 4 red remaining).',
      mistakeType: 'Misread Question',
      dateAdded: '2026-08-30',
      attempts: 2,
      resolved: false
    }
  ];

  let fsrsCards = [
    {
      id: 'fsrs-1',
      topic: 'Operating Systems — Deadlocks',
      question: 'What are the 4 Coffman conditions required simultaneously for Deadlock to hold?',
      answer: '1. Mutual Exclusion\\n2. Hold and Wait\\n3. No Preemption\\n4. Circular Wait',
      stability: 3.2,
      difficulty: 4.8,
      dueDays: 1,
      repetitions: 2,
      lapses: 0,
      state: 'learning'
    },
    {
      id: 'fsrs-2',
      topic: 'DSA — Dynamic Programming',
      question: 'What is the state transition formula for 0/1 Knapsack (item i with weight w[i], value v[i], capacity W)?',
      answer: 'dp[i][W] = max(dp[i-1][W], dp[i-1][W - w[i]] + v[i]) if w[i] <= W else dp[i-1][W]',
      stability: 2.1,
      difficulty: 6.4,
      dueDays: 0,
      repetitions: 1,
      lapses: 1,
      state: 'review'
    },
    {
      id: 'fsrs-3',
      topic: 'DBMS — Transactions',
      question: 'What are the four ACID properties in DBMS, and which subsystem guarantees Durability?',
      answer: 'Atomicity, Consistency, Isolation, Durability.\\nDurability is guaranteed by the Recovery Management / Write-Ahead Logging (WAL) subsystem.',
      stability: 5.5,
      difficulty: 3.5,
      dueDays: 3,
      repetitions: 4,
      lapses: 0,
      state: 'mastered'
    }
  ];

  function load() {
    try {
      const savedMstk = localStorage.getItem(MISTAKES_STORAGE_KEY);
      if (savedMstk) mistakes = JSON.parse(savedMstk);
      const savedFsrs = localStorage.getItem(FSRS_STORAGE_KEY);
      if (savedFsrs) fsrsCards = JSON.parse(savedFsrs);
    } catch (e) {
      console.warn('Error loading mistake book from localStorage', e);
    }
  }

  function save() {
    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(mistakes));
      localStorage.setItem(FSRS_STORAGE_KEY, JSON.stringify(fsrsCards));
    } catch (e) {
      console.warn('Error saving mistake book to localStorage', e);
    }
  }

  load();

  return {
    getMistakes: function (filterType) {
      if (!filterType || filterType === 'all') return mistakes;
      return mistakes.filter(m => m.mistakeType === filterType);
    },

    getUnresolvedMistakesCount: function () {
      return mistakes.filter(m => !m.resolved).length;
    },

    recordMistake: function (question, subject, topic, userWrongAnswer, correctAnswer, concept, mistakeType) {
      const newMistake = {
        id: 'mstk-' + Date.now(),
        question: question.trim(),
        subject: subject || 'General CS',
        topic: topic || 'General',
        userWrongAnswer: userWrongAnswer || 'Incorrect choice',
        correctAnswer: correctAnswer || 'Refer to concept',
        concept: concept || 'Review underlying theory',
        mistakeType: mistakeType || 'Concept Gap',
        dateAdded: new Date().toISOString().split('T')[0],
        attempts: 1,
        resolved: false
      };
      mistakes.unshift(newMistake);
      save();
      return newMistake;
    },

    resolveMistake: function (id) {
      const item = mistakes.find(m => m.id === id);
      if (item) {
        item.resolved = true;
        save();
      }
      return item;
    },

    deleteMistake: function (id) {
      mistakes = mistakes.filter(m => m.id !== id);
      save();
    },

    // ── FSRS Review Methods ──
    getDueFSRSCards: function () {
      return fsrsCards.filter(c => c.dueDays <= 0);
    },

    getAllFSRSCards: function () {
      return fsrsCards;
    },

    rateFSRSCard: function (cardId, rating) {
      // rating: 'Again', 'Hard', 'Good', 'Easy'
      const card = fsrsCards.find(c => c.id === cardId);
      if (!card) return null;

      if (rating === 'Again') {
        card.stability = Math.max(1.0, card.stability * 0.6);
        card.difficulty = Math.min(10.0, card.difficulty + 1.2);
        card.dueDays = 1;
        card.lapses += 1;
        card.state = 'learning';
      } else if (rating === 'Hard') {
        card.stability = card.stability * 1.2;
        card.difficulty = Math.min(10.0, card.difficulty + 0.4);
        card.dueDays = 2;
        card.repetitions += 1;
      } else if (rating === 'Good') {
        card.stability = card.stability * 2.0;
        card.difficulty = Math.max(1.0, card.difficulty - 0.2);
        card.dueDays = Math.round(card.stability * 2);
        card.repetitions += 1;
        card.state = 'review';
      } else if (rating === 'Easy') {
        card.stability = card.stability * 3.2;
        card.difficulty = Math.max(1.0, card.difficulty - 0.8);
        card.dueDays = Math.round(card.stability * 3.5);
        card.repetitions += 1;
        card.state = 'mastered';
      }

      save();
      return card;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.MistakeBookModule = MistakeBookModule;
}
