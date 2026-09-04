// ??????????????????????????????????????????????????????????????
// GT Study Mentor Pro v3.0 ? mistakeBook.js
// Pipeline: Wrong answer ? category ? correction ? Smart Revision ? reattempt ? mastered
// User-Facing Area: Smart Revision (Powered by spaced repetition)
// ??????????????????????????????????????????????????????????????

const MistakeBookModule = (function () {
  const MISTAKES_STORAGE_KEY = 'gt_mentor_mistakes_v3';
  const SMART_REV_STORAGE_KEY = 'gt_mentor_smart_revision_v3';

  const MISTAKE_CATEGORIES = [
    'Concept gap',
    'Calculation',
    'Careless',
    'Time pressure',
    'Misread',
    'Wrong approach'
  ];

  let mistakes = [
    {
      id: 'mstk-1',
      question: "In Banker's Algorithm, if Allocation = [1, 2, 2] and Max = [3, 3, 2], what is the Need vector?",
      subject: 'Operating Systems',
      topic: 'Deadlocks',
      userWrongAnswer: 'Need = [4, 5, 4] (Added instead of subtracted)',
      correctAnswer: 'Need = Max - Allocation = [2, 1, 0]',
      concept: "Need matrix in Banker's Algorithm is strictly calculated as Max[i][j] - Allocation[i][j].",
      mistakeType: 'Calculation',
      stage: 'Smart Revision', // Wrong answer ? category ? correction ? Smart Revision ? reattempt ? mastered
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
      mistakeType: 'Concept gap',
      stage: 'Reattempt',
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
      mistakeType: 'Misread',
      stage: 'Mastered',
      dateAdded: '2026-08-30',
      attempts: 2,
      resolved: true
    },
    {
      id: 'mstk-4',
      question: 'In Bellman-Ford algorithm, why is relaxing edges V-1 times sufficient for graphs without negative cycles?',
      subject: 'Algorithms',
      topic: 'Graph Shortest Paths',
      userWrongAnswer: 'Relaxing V times guarantees finding negative cycles immediately.',
      correctAnswer: 'A simple shortest path in a graph with V vertices can have at most V-1 edges. Each iteration guarantees the correct distance for paths with one more edge.',
      concept: 'Relaxation propagates shortest path distances along path lengths. Any update on the V-th round proves existence of a reachable negative-weight cycle.',
      mistakeType: 'Wrong approach',
      stage: 'Smart Revision',
      dateAdded: '2026-09-02',
      attempts: 1,
      resolved: false
    }
  ];

  let smartRevisionCards = [
    {
      id: 'srev-1',
      topic: 'Operating Systems ? Deadlocks',
      question: 'What are the 4 Coffman conditions required simultaneously for Deadlock to hold?',
      answer: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
      stability: 3.2,
      difficulty: 4.8,
      dueDays: 0,
      repetitions: 2,
      lapses: 0,
      status: 'Due Today'
    },
    {
      id: 'srev-2',
      topic: 'DSA ? Dynamic Programming',
      question: 'What is the state transition formula for 0/1 Knapsack (item i with weight w[i], value v[i], capacity W)?',
      answer: 'dp[i][W] = max(dp[i-1][W], dp[i-1][W - w[i]] + v[i]) if w[i] <= W else dp[i-1][W]',
      stability: 2.1,
      difficulty: 6.4,
      dueDays: 0,
      repetitions: 1,
      lapses: 1,
      status: 'Due Today'
    },
    {
      id: 'srev-3',
      topic: 'DBMS ? Transactions',
      question: 'What are the four ACID properties in DBMS, and which subsystem guarantees Durability?',
      answer: 'Atomicity, Consistency, Isolation, Durability.\nDurability is guaranteed by the Recovery Management / Write-Ahead Logging (WAL) subsystem.',
      stability: 5.5,
      difficulty: 3.5,
      dueDays: 3,
      repetitions: 4,
      lapses: 0,
      status: 'Mastered'
    }
  ];

  function load() {
    try {
      const savedM = localStorage.getItem(MISTAKES_STORAGE_KEY);
      if (savedM) mistakes = JSON.parse(savedM);
      const savedS = localStorage.getItem(SMART_REV_STORAGE_KEY);
      if (savedS) smartRevisionCards = JSON.parse(savedS);
    } catch (e) {
      console.warn('Error loading mistake book from storage', e);
    }
  }

  function save() {
    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(mistakes));
      localStorage.setItem(SMART_REV_STORAGE_KEY, JSON.stringify(smartRevisionCards));
    } catch (e) {
      console.warn('Error saving mistake book to storage', e);
    }
  }

  load();

  return {
    getCategories: () => MISTAKE_CATEGORIES,

    getMistakes: function (filterType) {
      if (!filterType || filterType === 'all') return mistakes;
      return mistakes.filter(m => m.mistakeType === filterType || m.stage === filterType);
    },

    getUnresolvedMistakesCount: function () {
      return mistakes.filter(m => !m.resolved).length;
    },

    // Step 1 & 2: Log Wrong Answer & Category
    recordMistake: function (question, subject, topic, userWrongAnswer, correctAnswer, concept, mistakeType) {
      const validCategory = MISTAKE_CATEGORIES.includes(mistakeType) ? mistakeType : 'Concept gap';
      const newMistake = {
        id: 'mstk-' + Date.now(),
        question: question.trim(),
        subject: subject || 'Computer Science',
        topic: topic || 'General',
        userWrongAnswer: userWrongAnswer || 'Incorrect choice',
        correctAnswer: correctAnswer || 'Refer to concept notes',
        concept: concept || 'Core concept review needed',
        mistakeType: validCategory,
        stage: 'Smart Revision', // Automatically enrolled in Smart Revision
        dateAdded: new Date().toISOString().split('T')[0],
        attempts: 1,
        resolved: false
      };
      mistakes.unshift(newMistake);

      // Create matching Smart Revision card
      smartRevisionCards.unshift({
        id: 'srev-' + Date.now(),
        mistakeId: newMistake.id,
        topic: (subject || '') + ' ? ' + (topic || ''),
        question: newMistake.question,
        answer: newMistake.correctAnswer + '\n\n?? Key Concept: ' + newMistake.concept,
        stability: 1.5,
        difficulty: 5.0,
        dueDays: 0,
        repetitions: 0,
        lapses: 0,
        status: 'Due Today'
      });

      save();
      return newMistake;
    },

    // Step 3: Send to Smart Revision
    sendToSmartRevision: function (id) {
      const item = mistakes.find(m => m.id === id);
      if (item) {
        item.stage = 'Smart Revision';
        save();
      }
      return item;
    },

    // Step 4: Reattempt
    reattemptMistake: function (id, answerGiven, isCorrect) {
      const item = mistakes.find(m => m.id === id);
      if (!item) return null;
      item.attempts += 1;
      if (isCorrect) {
        item.stage = 'Mastered';
        item.resolved = true;
      } else {
        item.stage = 'Smart Revision';
        item.resolved = false;
        item.userWrongAnswer = answerGiven || item.userWrongAnswer;
      }
      save();
      return item;
    },

    // Step 5: Mark Mastered
    resolveMistake: function (id) {
      const item = mistakes.find(m => m.id === id);
      if (item) {
        item.resolved = true;
        item.stage = 'Mastered';
        save();
      }
      return item;
    },

    deleteMistake: function (id) {
      mistakes = mistakes.filter(m => m.id !== id);
      smartRevisionCards = smartRevisionCards.filter(c => c.mistakeId !== id);
      save();
    },

    // ?? Smart Revision (Spaced Repetition) ??
    getDueSmartRevisionCards: function () {
      return smartRevisionCards.filter(c => c.dueDays <= 0);
    },

    getAllSmartRevisionCards: function () {
      return smartRevisionCards;
    },

    // Backward-compat aliases for older references
    getDueFSRSCards: function () { return this.getDueSmartRevisionCards(); },
    getAllFSRSCards: function () { return this.getAllSmartRevisionCards(); },

    rateSmartRevisionCard: function (cardId, rating) {
      // rating: 'Again', 'Hard', 'Good', 'Easy'
      const card = smartRevisionCards.find(c => c.id === cardId);
      if (!card) return null;

      if (rating === 'Again') {
        card.stability = Math.max(1.0, card.stability * 0.6);
        card.difficulty = Math.min(10.0, card.difficulty + 1.2);
        card.dueDays = 0;
        card.lapses += 1;
        card.status = 'Due Today';
      } else if (rating === 'Hard') {
        card.stability = card.stability * 1.2;
        card.difficulty = Math.min(10.0, card.difficulty + 0.4);
        card.dueDays = 1;
        card.repetitions += 1;
        card.status = 'Learning';
      } else if (rating === 'Good') {
        card.stability = card.stability * 2.0;
        card.difficulty = Math.max(1.0, card.difficulty - 0.2);
        card.dueDays = Math.max(2, Math.round(card.stability * 2));
        card.repetitions += 1;
        card.status = 'Reviewing';
      } else if (rating === 'Easy') {
        card.stability = card.stability * 3.2;
        card.difficulty = Math.max(1.0, card.difficulty - 0.8);
        card.dueDays = Math.max(5, Math.round(card.stability * 3.5));
        card.repetitions += 1;
        card.status = 'Mastered';
      }

      save();
      return card;
    },

    rateFSRSCard: function (cardId, rating) {
      return this.rateSmartRevisionCard(cardId, rating);
    }
  };
})();

if (typeof window !== 'undefined') {
  window.MistakeBookModule = MistakeBookModule;
}
