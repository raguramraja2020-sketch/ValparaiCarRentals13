const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// Process / Record Payment for a booking
router.post('/process', verifyToken, (req, res) => {
  try {
    const { booking_id, amount, payment_method, upi_id, card_last4 } = req.body;

    if (!booking_id || !payment_method) {
      return res.status(400).json({ success: false, message: 'Booking ID and payment method are required.' });
    }

    const booking = db.get('SELECT * FROM bookings WHERE id = ?', [booking_id]);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const paymentAmount = amount ? Number(amount) : booking.total_amount;
    const paymentId = 'pay_' + crypto.randomUUID().slice(0, 8);
    const txnRef = 'VRC-' + payment_method.toUpperCase() + '-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    db.transaction(() => {
      // Record payment
      db.run(
        `INSERT INTO payments (
          id, booking_id, customer_id, amount, payment_method, 
          payment_status, transaction_reference, payment_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [paymentId, booking_id, booking.customer_id, paymentAmount, payment_method, 'success', txnRef, now]
      );

      // Update booking payment status
      db.run("UPDATE bookings SET payment_status = 'paid' WHERE id = ?", [booking_id]);
    });

    const paymentRecord = db.get('SELECT * FROM payments WHERE id = ?', [paymentId]);

    return res.status(201).json({
      success: true,
      message: 'Payment processed successfully! Your booking is fully paid and confirmed.',
      payment: paymentRecord
    });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Customer: Get payment history
router.get('/my-payments', verifyToken, (req, res) => {
  try {
    let customerId = req.user.customerId;
    if (!customerId) {
      const cust = db.get('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (cust) customerId = cust.id;
    }

    if (!customerId) {
      return res.json({ success: true, count: 0, payments: [] });
    }

    const payments = db.all(
      `SELECT p.*, b.pickup_location, b.pickup_date, b.return_date,
              v.vehicle_name, v.brand, v.registration_number
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE p.customer_id = ?
       ORDER BY p.payment_date DESC`,
      [customerId]
    );

    return res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: View all payments
router.get('/', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const payments = db.all(`
      SELECT p.*, b.pickup_location, b.pickup_date, b.return_date,
             v.vehicle_name, v.brand, v.registration_number,
             u.name as customer_name, u.email as customer_email
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN customers c ON p.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY p.payment_date DESC
    `);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.payment_status === 'success' ? p.amount : 0), 0);

    return res.json({
      success: true,
      count: payments.length,
      total_revenue: totalRevenue,
      payments
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
