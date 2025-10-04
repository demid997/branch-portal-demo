const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname,'data.sqlite'));

const sql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT,
  specialty TEXT,
  phone TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT,
  duration_minutes INTEGER,
  price REAL
);

CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  doctor_id TEXT,
  date TEXT,
  start_time TEXT,
  end_time TEXT,
  FOREIGN KEY(doctor_id) REFERENCES doctors(id)
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  birth_date TEXT,
  phone TEXT,
  email TEXT,
  doc_number TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  doctor_id TEXT,
  service_id TEXT,
  scheduled_at TEXT,
  status TEXT,
  queue_number INTEGER,
  created_at TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(id),
  FOREIGN KEY(doctor_id) REFERENCES doctors(id),
  FOREIGN KEY(service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY,
  event TEXT,
  meta TEXT,
  created_at TEXT
);
`;

db.exec(sql, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Migration done.');
  db.close();
});
