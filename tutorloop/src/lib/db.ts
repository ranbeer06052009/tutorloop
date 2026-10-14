import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "tutorloop.sqlite");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma("journal_mode = WAL");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  // Students table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grade_level TEXT,
      hourly_rate REAL NOT NULL DEFAULT 35.0,
      parent_name TEXT,
      parent_phone TEXT,
      parent_email TEXT,
      preferred_channel TEXT DEFAULT 'whatsapp',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      session_date TEXT NOT NULL,
      duration_hours REAL NOT NULL DEFAULT 1.0,
      hourly_rate REAL NOT NULL,
      total_amount REAL NOT NULL,
      raw_notes TEXT NOT NULL,
      recap_parent TEXT,
      homework_student TEXT,
      invoice_number TEXT,
      status TEXT DEFAULT 'sent',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      tutor_name TEXT DEFAULT 'Jordan Lee',
      tutor_email TEXT DEFAULT 'jordan.tutors@example.com',
      tutor_phone TEXT DEFAULT '+1 (555) 789-0123',
      payment_methods TEXT DEFAULT 'Venmo: @jordan-tutors | Zelle: jordan.tutors@example.com',
      currency_symbol TEXT DEFAULT '$',
      ollama_url TEXT DEFAULT 'http://localhost:11434',
      ollama_model TEXT DEFAULT 'gemma2:2b',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if settings row exists
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO settings (id, tutor_name, tutor_email, tutor_phone, payment_methods, currency_symbol, ollama_url, ollama_model)
      VALUES (1, 'Jordan Lee', 'jordan.tutors@example.com', '+1 (555) 789-0123', 'Venmo: @jordan-tutors | Zelle: jordan.tutors@example.com', '$', 'http://localhost:11434', 'gemma2:2b')
    `).run();
  }

  // Seed sample students and sessions if none exist
  const studentCount = db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number };
  if (studentCount.count === 0) {
    const insertStudent = db.prepare(`
      INSERT INTO students (name, grade_level, hourly_rate, parent_name, parent_phone, parent_email, preferred_channel, notes)
      VALUES (@name, @grade_level, @hourly_rate, @parent_name, @parent_phone, @parent_email, @preferred_channel, @notes)
    `);

    const s1 = insertStudent.run({
      name: "Marcus Vance",
      grade_level: "10th Grade — AP Pre-Calculus",
      hourly_rate: 45.0,
      parent_name: "Eleanor Vance",
      parent_phone: "+1 (555) 432-8765",
      parent_email: "eleanor.vance@example.com",
      preferred_channel: "whatsapp",
      notes: "Visual learner, struggles with polynomial long division, excels at graphing transformations."
    });

    const s2 = insertStudent.run({
      name: "Sophia Chen",
      grade_level: "8th Grade — Intro to Algebra & Physics",
      hourly_rate: 40.0,
      parent_name: "David Chen",
      parent_phone: "+1 (555) 987-1234",
      parent_email: "david.chen@example.com",
      preferred_channel: "email",
      notes: "Loves science context for math problems. Target: getting an A on next month's midterm."
    });

    const s3 = insertStudent.run({
      name: "Liam O'Connor",
      grade_level: "11th Grade — Chemistry & SAT Math",
      hourly_rate: 50.0,
      parent_name: "Claire O'Connor",
      parent_phone: "+1 (555) 345-6789",
      parent_email: "claire.oc@example.com",
      preferred_channel: "whatsapp",
      notes: "Needs confidence booster in stoichiometry. Very punctual."
    });

    // Seed one completed session for Marcus
    db.prepare(`
      INSERT INTO sessions (student_id, session_date, duration_hours, hourly_rate, total_amount, raw_notes, recap_parent, homework_student, invoice_number, status)
      VALUES (
        ?,
        date('now', '-2 days'),
        1.5,
        45.0,
        67.50,
        'Reviewed polynomial long division and remainder theorem. Marcus nailed the 3 practice problems on remainder theorem once we mapped out the steps visually! Got stuck on negative sign distribution in division steps 2 & 4. HW: textbook p114 #5-15 odd.',
        'Hi Eleanor! We had a fantastic 1.5-hour session with Marcus today focusing on AP Pre-Calculus. We made a major breakthrough on the Remainder Theorem — he solved 3 challenge problems independently once we color-coded the signs! We identified that distributing negative signs in polynomial division is where slight errors creep in, so we built a quick 3-step checklist he can reference. He has a short set of 6 practice problems to keep the momentum going before our next class.',
        '1. Complete textbook page 114, problems 5-15 (odd numbers only).\n2. Highlight every negative sign before distributing in step 2 of long division.\n3. Bring any questions on problem #13 to our next session.',
        'INV-2026-001',
        'paid'
      )
    `).run(s1.lastInsertRowid);

    // Seed one unpaid session for Sophia
    db.prepare(`
      INSERT INTO sessions (student_id, session_date, duration_hours, hourly_rate, total_amount, raw_notes, recap_parent, homework_student, invoice_number, status)
      VALUES (
        ?,
        date('now', '-1 days'),
        1.0,
        40.0,
        40.00,
        'Intro to velocity vs time graphs and slope as acceleration. Sophia connected the algebra slope concept (rise over run) to physical speed immediately. Left feeling confident for Friday quiz.',
        'Hi David! Sophia had an energetic 1-hour session today bridging Algebra and Physics. She immediately grasped how slope represents acceleration on velocity-time graphs. She is in great shape for Friday''s quiz! We assigned 4 quick conceptual graph sketching questions due by Thursday evening.',
        '1. Practice Worksheet: Sketch velocity-time graphs for problems 1 through 4.\n2. Review the definition of negative acceleration vs deceleration.',
        'INV-2026-002',
        'sent'
      )
    `).run(s2.lastInsertRowid);
  }
}

