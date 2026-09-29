const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public top testimonials for Homepage
router.get('/public', (req, res) => {
  try {
    const feedbackList = db.all(`
      SELECT f.*, u.name as customer_name, v.vehicle_name, v.brand
      FROM feedback f
      JOIN customers c ON f.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN bookings b ON f.booking_id = b.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE f.rating >= 4
      ORDER BY f.created_at DESC
      LIMIT 8
    `);

    return res.json({ success: true, count: feedbackList.length, feedback: feedbackList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Customer: Submit feedback
router.post('/', verifyToken, (req, res) => {
  try {
    const { booking_id, rating, comments } = req.body;

    if (!rating || !comments) {
      return res.status(400).json({ success: false, message: 'Rating and comments are required.' });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    let customerId = req.user.customerId;
    if (!customerId) {
      const cust = db.get('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (cust) customerId = cust.id;
    }

    // Check if feedback already submitted for this booking
    if (booking_id) {
      const existing = db.get('SELECT id FROM feedback WHERE booking_id = ?', [booking_id]);
      if (existing) {
        db.run('UPDATE feedback SET rating = ?, comments = ? WHERE id = ?', [numRating, comments.trim(), existing.id]);
        return res.json({ success: true, message: 'Feedback updated successfully!' });
      }
    }

    const id = 'fb_' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    db.run(
      'INSERT INTO feedback (id, customer_id, booking_id, rating, comments, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, customerId, booking_id || null, numRating, comments.trim(), now]
    );

    return res.status(201).json({ success: true, message: 'Thank you for your valuable feedback!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: View all feedback
router.get('/', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const feedbackList = db.all(`
      SELECT f.*, u.name as customer_name, u.email as customer_email,
             v.vehicle_name, v.brand, b.pickup_location, b.pickup_date
      FROM feedback f
      JOIN customers c ON f.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN bookings b ON f.booking_id = b.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY f.created_at DESC
    `);

    return res.json({ success: true, count: feedbackList.length, feedback: feedbackList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
