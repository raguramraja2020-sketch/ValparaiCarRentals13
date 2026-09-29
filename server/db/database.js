const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_DIR = __dirname;
const DB_PATH = path.join(DB_DIR, 'valparai.sqlite');

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const rawDb = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode for reliability
rawDb.exec('PRAGMA foreign_keys = ON;');
rawDb.exec('PRAGMA journal_mode = WAL;');

const db = {
  raw: rawDb,

  exec(sql) {
    return rawDb.exec(sql);
  },

  run(sql, params = []) {
    const sanitized = params.map(p => p === undefined ? null : p);
    const stmt = rawDb.prepare(sql);
    return stmt.run(...sanitized);
  },

  get(sql, params = []) {
    const sanitized = params.map(p => p === undefined ? null : p);
    const stmt = rawDb.prepare(sql);
    return stmt.get(...sanitized);
  },

  all(sql, params = []) {
    const sanitized = params.map(p => p === undefined ? null : p);
    const stmt = rawDb.prepare(sql);
    return stmt.all(...sanitized);
  },

  transaction(fn) {
    rawDb.exec('BEGIN TRANSACTION;');
    try {
      const result = fn();
      rawDb.exec('COMMIT;');
      return result;
    } catch (err) {
      rawDb.exec('ROLLBACK;');
      throw err;
    }
  }
};

function initSchema() {
  const schemaSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('customer', 'admin', 'mechanic')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      address TEXT,
      driving_license TEXT,
      emergency_contact TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mechanics (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      specialization TEXT,
      phone TEXT,
      status TEXT DEFAULT 'active',
      experience_years INTEGER DEFAULT 3,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      vehicle_name TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      registration_number TEXT UNIQUE NOT NULL,
      image TEXT NOT NULL,
      seats INTEGER NOT NULL,
      fuel_type TEXT NOT NULL,
      transmission TEXT NOT NULL,
      price_per_day REAL NOT NULL,
      availability_status TEXT NOT NULL DEFAULT 'available' CHECK(availability_status IN ('available', 'booked', 'maintenance', 'retired')),
      description TEXT,
      mileage INTEGER DEFAULT 18000,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      vehicle_id TEXT NOT NULL,
      pickup_location TEXT NOT NULL,
      pickup_date TEXT NOT NULL,
      return_date TEXT NOT NULL,
      number_of_days INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      booking_status TEXT NOT NULL DEFAULT 'pending' CHECK(booking_status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
      payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('upi', 'card', 'cash', 'netbanking')),
      payment_status TEXT NOT NULL CHECK(payment_status IN ('success', 'failed', 'pending')),
      transaction_reference TEXT UNIQUE NOT NULL,
      payment_date TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT NOT NULL,
      mechanic_id TEXT,
      issue TEXT NOT NULL,
      service_description TEXT,
      service_cost REAL DEFAULT 0.0,
      maintenance_status TEXT NOT NULL DEFAULT 'Scheduled' CHECK(maintenance_status IN ('Scheduled', 'In Progress', 'Completed', 'Urgent')),
      scheduled_date TEXT NOT NULL,
      completed_date TEXT,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
      FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      booking_id TEXT,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comments TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_dates ON bookings(vehicle_id, pickup_date, return_date);
    CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_feedback_vehicle ON feedback(booking_id);
  `;

  rawDb.exec(schemaSQL);
  console.log('✅ SQLite Schema initialized successfully.');
}

initSchema();

module.exports = { db, initSchema };
