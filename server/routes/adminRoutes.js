const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db } = require('../db/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// All routes require Admin role
router.use(verifyToken, requireRole('admin'));

// Admin Dashboard Summary KPIs
router.get('/dashboard-stats', (req, res) => {
  try {
    const totalCustomers = db.get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").count;
    const totalVehicles = db.get("SELECT COUNT(*) as count FROM vehicles").count;
    const availableVehicles = db.get("SELECT COUNT(*) as count FROM vehicles WHERE availability_status = 'available'").count;
    const maintenanceVehicles = db.get("SELECT COUNT(*) as count FROM vehicles WHERE availability_status = 'maintenance'").count;

    const activeBookings = db.get("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'active' OR booking_status = 'confirmed'").count;
    const pendingBookings = db.get("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'pending'").count;
    const completedBookings = db.get("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'completed'").count;
    const cancelledBookings = db.get("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'cancelled'").count;

    const revenueResult = db.get("SELECT SUM(amount) as total FROM payments WHERE payment_status = 'success'");
    const totalRevenue = revenueResult.total || 0;

    const recentBookings = db.all(`
      SELECT b.*, v.vehicle_name, v.brand, u.name as customer_name, u.email as customer_email
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN customers c ON b.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 6
    `);

    const categoryBreakdown = db.all(`
      SELECT category, COUNT(*) as count 
      FROM vehicles 
      GROUP BY category
    `);

    const mechanicStats = db.all(`
      SELECT mech.id, u.name, mech.specialization,
             (SELECT COUNT(*) FROM maintenance WHERE mechanic_id = mech.id AND maintenance_status IN ('Scheduled', 'In Progress', 'Urgent')) as active_tickets
      FROM mechanics mech
      JOIN users u ON mech.user_id = u.id
    `);

    return res.json({
      success: true,
      stats: {
        totalCustomers,
        totalVehicles,
        availableVehicles,
        maintenanceVehicles,
        activeBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue
      },
      recentBookings,
      categoryBreakdown,
      mechanicStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Manage Customers
router.get('/customers', (req, res) => {
  try {
    const customers = db.all(`
      SELECT u.id as user_id, c.id as customer_id, u.name, u.email, u.phone, u.created_at,
             c.address, c.driving_license,
             (SELECT COUNT(*) FROM bookings WHERE customer_id = c.id) as total_bookings,
             (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE customer_id = c.id AND payment_status = 'success') as total_spent
      FROM customers c
      JOIN users u ON c.user_id = u.id
      ORDER BY u.created_at DESC
    `);

    return res.json({ success: true, count: customers.length, customers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Manage Mechanics
router.get('/mechanics', (req, res) => {
  try {
    const mechanics = db.all(`
      SELECT u.id as user_id, m.id as mechanic_id, u.name, u.email, m.phone, m.specialization, m.status, m.experience_years,
             (SELECT COUNT(*) FROM maintenance WHERE mechanic_id = m.id AND maintenance_status = 'Completed') as completed_repairs,
             (SELECT COUNT(*) FROM maintenance WHERE mechanic_id = m.id AND maintenance_status IN ('Scheduled', 'In Progress', 'Urgent')) as pending_repairs
      FROM mechanics m
      JOIN users u ON m.user_id = u.id
      ORDER BY u.name ASC
    `);

    return res.json({ success: true, count: mechanics.length, mechanics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Add Mechanic
router.post('/mechanics', async (req, res) => {
  try {
    const { name, email, phone, password, specialization, experience_years } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userId = 'usr_' + crypto.randomUUID().slice(0, 8);
    const mechanicId = 'mech_' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    db.transaction(() => {
      db.run(
        'INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, name.trim(), normalizedEmail, phone || '', password_hash, 'mechanic', now]
      );

      db.run(
        'INSERT INTO mechanics (id, user_id, specialization, phone, status, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
        [mechanicId, userId, specialization || 'General Service', phone || '', 'active', Number(experience_years) || 4]
      );
    });

    return res.status(201).json({ success: true, message: 'Mechanic account created successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
