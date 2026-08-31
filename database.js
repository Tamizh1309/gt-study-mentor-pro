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

// Export a function to trigger daily sync manually
module.exports = {
  db,
  syncDailyData: seedPlacements
};
