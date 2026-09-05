const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // Progress Table
    db.run(`
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE,
        dsa_count INTEGER DEFAULT 0,
        gate_chapters INTEGER DEFAULT 0,
        projects_completed INTEGER DEFAULT 0,
        placement_prep_hours INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        mood TEXT
      )
    `);
    
    // TN Placements Table
    db.run(`
      CREATE TABLE IF NOT EXISTS placements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT,
        role TEXT,
        city TEXT,
        date TEXT,
        lat REAL,
        lng REAL,
        type TEXT
      )
    `);

    // User Profile & Day 0 Preparation State Table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY DEFAULT 1,
        name TEXT DEFAULT 'Student',
        target_role TEXT DEFAULT 'GATE 2027 & Software Engineering',
        skill_level TEXT DEFAULT 'Beginner',
        daily_study_hours REAL DEFAULT 2.0,
        preferred_focus_mins INTEGER DEFAULT 45,
        start_date TEXT,
        status TEXT DEFAULT 'NOT_STARTED',
        current_day INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0
      )
    `);

    // Ensure default Day 0 row exists
    db.run(`
      INSERT OR IGNORE INTO user_profile (id, name, status, current_day, xp, streak)
      VALUES (1, 'Student', 'NOT_STARTED', 0, 0, 0)
    `);

    // User Readiness Scores Table (Starts at 0%)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_readiness (
        id INTEGER PRIMARY KEY DEFAULT 1,
        gate INTEGER DEFAULT 0,
        placement INTEGER DEFAULT 0,
        swe INTEGER DEFAULT 0,
        internship INTEGER DEFAULT 0
      )
    `);
    db.run(`
      INSERT OR IGNORE INTO user_readiness (id, gate, placement, swe, internship)
      VALUES (1, 0, 0, 0, 0)
    `);

    // Dynamic Daily Tasks Table
    db.run(`
      CREATE TABLE IF NOT EXISTS daily_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day INTEGER DEFAULT 0,
        title TEXT,
        duration INTEGER DEFAULT 45,
        track TEXT,
        status TEXT DEFAULT 'pending',
        completed_at TEXT
      )
    `);

    // Focus Logs Table
    db.run(`
      CREATE TABLE IF NOT EXISTS focus_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT,
        duration INTEGER DEFAULT 45,
        completed_at TEXT
      )
    `);

    // Seed mock placement data if empty
    db.get("SELECT COUNT(*) as count FROM placements", (err, row) => {
      if (row && row.count === 0) {
        seedPlacements();
      }
    });
  });
}

function seedPlacements() {
  const companies = ['Zoho', 'Amazon', 'TCS', 'Freshworks', 'Tech Mahindra', 'Soliton', 'HCLTech', 'Infosys', 'Cognizant', 'Wipro', 'Accenture', 'IBM', 'L&T', 'Thoughtworks', 'Mr. Cooper', 'Chargebee', 'Kissflow', 'Mad Street Den', 'Paypal', 'Ford', 'Hyundai'];
  const roles = [
    { title: 'Frontend Developer', type: 'Placement' }, { title: 'Backend Developer', type: 'Placement' },
    { title: 'Full Stack Engineer', type: 'Placement' }, { title: 'Data Scientist', type: 'Placement' },
    { title: 'DevOps Engineer', type: 'Placement' }, { title: 'QA Tester', type: 'Placement' },
    { title: 'UI/UX Designer', type: 'Placement' }, { title: 'SDE Intern', type: 'Internship' },
    { title: 'Frontend Intern', type: 'Internship' }, { title: 'React.js Intern', type: 'Internship' },
    { title: 'Node.js Intern', type: 'Internship' }, { title: 'Cloud Trainee', type: 'Internship' },
    { title: 'Cybersecurity Analyst', type: 'Placement' }, { title: 'AI/ML Engineer', type: 'Placement' }
  ];
  const cities = [
    { name: 'Chennai', lat: 12.9716, lng: 80.2464 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
    { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
    { name: 'Trichy', lat: 10.7905, lng: 78.7047 },
    { name: 'Salem', lat: 11.6643, lng: 78.1460 },
    { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
    { name: 'Vellore', lat: 12.9165, lng: 79.1325 },
    { name: 'Erode', lat: 11.3410, lng: 77.7172 }
  ];

  db.run("DELETE FROM placements", () => {
    const stmt = db.prepare("INSERT INTO placements (company, role, city, date, lat, lng, type) VALUES (?, ?, ?, date('now', '+3 days'), ?, ?, ?)");
    
    // Generate 40 random opportunities across TN
    for (let i = 0; i < 40; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const roleObj = roles[Math.floor(Math.random() * roles.length)];
      const cityObj = cities[Math.floor(Math.random() * cities.length)];
      
      // Slight coordinate randomization so pins don't overlap exactly
      const latMod = cityObj.lat + (Math.random() - 0.5) * 0.1;
      const lngMod = cityObj.lng + (Math.random() - 0.5) * 0.1;

      stmt.run(company, roleObj.title, cityObj.name, latMod, lngMod, roleObj.type);
    }
    stmt.finalize();
    console.log('Seeded 40 fresh mock placement & internship data points.');
  });
}

// Export functions for Day 0 and Preparation State Management
function getPreparationState(callback) {
  db.get("SELECT * FROM user_profile WHERE id = 1", [], (err, profile) => {
    if (err) return callback(err);

    db.get("SELECT * FROM user_readiness WHERE id = 1", [], (err2, readiness) => {
      if (err2) return callback(err2);

      db.all("SELECT * FROM daily_tasks WHERE day = ? ORDER BY id ASC", [profile?.current_day || 0], (err3, tasks) => {
        if (err3) return callback(err3);

        callback(null, {
          profile: profile || { current_day: 0, status: 'NOT_STARTED', xp: 0, streak: 0 },
          currentDay: profile?.current_day || 0,
          status: profile?.status || 'NOT_STARTED',
          readiness: readiness || { gate: 0, placement: 0, swe: 0, internship: 0 },
          tasks: tasks || []
        });
      });
    });
  });
}

function completeOnboarding(data, callback) {
  const { name = 'Student', targetRole = 'GATE 2027 & Software Engineering', skillLevel = 'Beginner', dailyStudyHours = 2.0, preferredFocusMins = 45, startDate = new Date().toISOString().split('T')[0] } = data;

  db.serialize(() => {
    // 1. Update Profile to Day 1 Active
    db.run(`
      UPDATE user_profile SET
        name = ?,
        target_role = ?,
        skill_level = ?,
        daily_study_hours = ?,
        preferred_focus_mins = ?,
        start_date = ?,
        status = 'ACTIVE',
        current_day = 1,
        xp = 50,
        streak = 1
      WHERE id = 1
    `, [name, targetRole, skillLevel, dailyStudyHours, preferredFocusMins, startDate]);

    // 2. Clear old tasks and seed realistic Day 1 starter foundation tasks
    db.run("DELETE FROM daily_tasks");
    const stmt = db.prepare("INSERT INTO daily_tasks (day, title, duration, track, status) VALUES (?, ?, ?, ?, 'pending')");
    stmt.run(1, 'Orientation: Understand 90-Day Roadmap & Core Subjects', 30, 'Foundation');
    stmt.run(1, 'DSA Foundation: Time Complexity & Big-O Fundamentals', 45, 'SWE');
    stmt.run(1, 'Core CS: Operating System Types & Process State Transitions', 45, 'GATE');
    stmt.finalize();

    // 3. Set baseline readiness scores (small realistic starter baseline based on Day 1 start)
    db.run("UPDATE user_readiness SET gate = 2, placement = 2, swe = 3, internship = 1 WHERE id = 1");

    getPreparationState(callback);
  });
}

function resetPreparationJourney(callback) {
  db.serialize(() => {
    // Reset Profile to Day 0 NOT_STARTED
    db.run(`
      UPDATE user_profile SET
        status = 'NOT_STARTED',
        current_day = 0,
        xp = 0,
        streak = 0,
        start_date = NULL
      WHERE id = 1
    `);

    // Reset Readiness to 0% across all tracks
    db.run("UPDATE user_readiness SET gate = 0, placement = 0, swe = 0, internship = 0 WHERE id = 1");

    // Clear personal activity logs
    db.run("DELETE FROM daily_tasks");
    db.run("DELETE FROM focus_logs");
    db.run("DELETE FROM progress");

    getPreparationState(callback);
  });
}

// Export functions
module.exports = {
  db,
  syncDailyData: seedPlacements,
  getPreparationState,
  completeOnboarding,
  resetPreparationJourney
};
