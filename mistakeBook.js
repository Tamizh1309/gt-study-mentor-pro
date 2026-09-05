// ??????????????????????????????????????????????????????????????
// GT Study Mentor Pro v3.0 ? mistakeBook.js
// Pipeline: Wrong answer ? category ? correction ? Smart Revision ? reattempt ? mastered
// User-Facing Area: Smart Revision (Powered by spaced repetition)
// ??????????????????????????????????????????????????????????????

const MistakeBookModule = (function () {
  const MISTAKES_STORAGE_KEY = 'gt_mentor_mistakes_v3';
  const SMART_REV_STORAGE_KEY = 'gt_mentor_smart_revision_v3';

  const MISTAKE_CATEGORIES = [
    'Misconception',
    'Concept gap',
    'Calculation',
    'Careless',
    'Time pressure',
    'Misread',
    'Wrong approach',
    'Logic error',
    'Formula error'
  ];

  let mistakes = [];
  let smartRevisionCards = [];

  function load() {
    try {
      const savedM = localStorage.getItem(MISTAKES_STORAGE_KEY);
      if (savedM) {
        const parsedM = JSON.parse(savedM);
        // If old build with hardcoded mstk-1, reset to clean state
        if (Array.isArray(parsedM) && parsedM.some(m => m.id === 'mstk-1' && m.dateAdded === '2026-08-28')) {
          console.info('[MistakeBook] Migrating legacy sample mistakes to clean Day 0 state');
          mistakes = [];
          save();
        } else {
          mistakes = parsedM;
        }
      }
      const savedS = localStorage.getItem(SMART_REV_STORAGE_KEY);
      if (savedS) {
        const parsedS = JSON.parse(savedS);
        if (Array.isArray(parsedS) && parsedS.some(s => s.id === 'srev-1')) {
          smartRevisionCards = [];
          save();
        } else {
          smartRevisionCards = parsedS;
        }
      }
    } catch (e) {
      console.warn('Error loading mistake book from storage', e);
      mistakes = [];
      smartRevisionCards = [];
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

    getMisconceptionsCount: function () {
      return mistakes.filter(m => !m.resolved && m.mistakeType === 'Misconception').length;
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
    },

    resetToZeroState: function () {
      mistakes = [];
      smartRevisionCards = [];
      save();
      localStorage.removeItem(MISTAKES_STORAGE_KEY);
      localStorage.removeItem(SMART_REV_STORAGE_KEY);
    }
  };
})();

if (typeof window !== 'undefined') {
  window.MistakeBookModule = MistakeBookModule;
}
