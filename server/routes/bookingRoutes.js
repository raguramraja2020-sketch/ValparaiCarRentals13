const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// Helper to compute days
function calculateDays(pickupStr, returnStr) {
  const start = new Date(pickupStr);
  const end = new Date(returnStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

// Check availability endpoint
router.post('/check-availability', (req, res) => {
  try {
    const { vehicle_id, pickup_date, return_date } = req.body;

    if (!vehicle_id || !pickup_date || !return_date) {
      return res.status(400).json({ success: false, message: 'Vehicle ID, pickup date, and return date are required.' });
    }

    const vehicle = db.get('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Check maintenance
    const activeMaintenance = db.get(
      `SELECT * FROM maintenance 
       WHERE vehicle_id = ? AND maintenance_status IN ('Scheduled', 'In Progress', 'Urgent')`,
      [vehicle_id]
    );

    if (activeMaintenance) {
      return res.json({
        success: true,
        available: false,
        reason: 'Vehicle is currently scheduled or undergoing technical maintenance in workshop.'
      });
    }

    // Check if vehicle is already booked
    const activeBooking = db.get(
      `SELECT id, pickup_date, return_date FROM bookings 
       WHERE vehicle_id = ? AND booking_status IN ('confirmed', 'active')`,
      [vehicle_id]
    );

    if (activeBooking || vehicle.availability_status === 'booked') {
      return res.json({
        success: true,
        available: false,
        reason: 'This vehicle is currently booked and unavailable.'
      });
    }

    // Check overlapping bookings
    const overlap = db.get(
      `SELECT id, pickup_date, return_date FROM bookings 
       WHERE vehicle_id = ? 
         AND booking_status IN ('confirmed', 'active', 'pending')
         AND (pickup_date < ? AND return_date > ?)`,
      [vehicle_id, return_date, pickup_date]
    );

    if (overlap) {
      return res.json({
        success: true,
        available: false,
        reason: 'This vehicle is unavailable for the selected dates.'
      });
    }

    const days = calculateDays(pickup_date, return_date);
    const totalAmount = days * vehicle.price_per_day;

    return res.json({
      success: true,
      available: true,
      days,
      price_per_day: vehicle.price_per_day,
      total_amount: totalAmount,
      vehicle
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create new booking (Customer only)
router.post('/', verifyToken, (req, res) => {
  try {
    const { vehicle_id, pickup_location, pickup_date, return_date, payment_method } = req.body;

    if (!vehicle_id || !pickup_location || !pickup_date || !return_date) {
      return res.status(400).json({ success: false, message: 'Please provide all booking details.' });
    }

    // Determine customer ID
    let customerId = req.user.customerId;
    if (!customerId) {
      const cust = db.get('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (cust) customerId = cust.id;
    }

    if (!customerId) {
      // Create customer record if missing
      customerId = 'cust_' + crypto.randomUUID().slice(0, 8);
      db.run('INSERT INTO customers (id, user_id, address) VALUES (?, ?, ?)', [customerId, req.user.id, 'Valparai']);
    }

    const vehicle = db.get('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Maintenance check
    const activeMaintenance = db.get(
      `SELECT id FROM maintenance 
       WHERE vehicle_id = ? AND maintenance_status IN ('Scheduled', 'In Progress', 'Urgent')`,
      [vehicle_id]
    );
    if (activeMaintenance) {
      return res.status(400).json({
        success: false,
        message: 'This vehicle is currently under maintenance and cannot be booked.'
      });
    }

    // Check if vehicle is currently booked
    const activeBooking = db.get(
      `SELECT id, pickup_date, return_date FROM bookings 
       WHERE vehicle_id = ? AND booking_status IN ('confirmed', 'active')`,
      [vehicle_id]
    );

    if (activeBooking || vehicle.availability_status === 'booked') {
      return res.status(400).json({
        success: false,
        message: 'This vehicle is currently booked by another customer and is unavailable.'
      });
    }

    // Overlapping booking check
    const overlap = db.get(
      `SELECT id FROM bookings 
       WHERE vehicle_id = ? 
         AND booking_status IN ('confirmed', 'active', 'pending')
         AND (pickup_date < ? AND return_date > ?)`,
      [vehicle_id, return_date, pickup_date]
    );

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: 'This vehicle is unavailable for the selected dates.'
      });
    }

    const numberOfDays = calculateDays(pickup_date, return_date);
    const totalAmount = numberOfDays * vehicle.price_per_day;

    const bookingId = 'bk_' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    const bookingStatus = 'confirmed';
    const paymentStatus = payment_method ? 'paid' : 'pending';

    db.transaction(() => {
      // Insert booking
      db.run(
        `INSERT INTO bookings (
          id, customer_id, vehicle_id, pickup_location, pickup_date, 
          return_date, number_of_days, total_amount, booking_status, payment_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          customerId,
          vehicle_id,
          pickup_location.trim(),
          pickup_date,
          return_date,
          numberOfDays,
          totalAmount,
          bookingStatus,
          paymentStatus,
          now
        ]
      );

      // Update vehicle status to booked so other users immediately see it as unavailable
      db.run("UPDATE vehicles SET availability_status = 'booked' WHERE id = ?", [vehicle_id]);

      // If payment method provided, record payment immediately
      if (payment_method) {
        const paymentId = 'pay_' + crypto.randomUUID().slice(0, 8);
        const txnRef = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        db.run(
          `INSERT INTO payments (
            id, booking_id, customer_id, amount, payment_method, 
            payment_status, transaction_reference, payment_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [paymentId, bookingId, customerId, totalAmount, payment_method, 'success', txnRef, now]
        );
      }
    });

    const createdBooking = db.get(
      `SELECT b.*, v.vehicle_name, v.brand, v.model, v.image, v.registration_number, v.price_per_day,
              u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       JOIN customers c ON b.customer_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE b.id = ?`,
      [bookingId]
    );

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      booking: createdBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get customer bookings
router.get('/my-bookings', verifyToken, (req, res) => {
  try {
    let customerId = req.user.customerId;
    if (!customerId) {
      const cust = db.get('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (cust) customerId = cust.id;
    }

    if (!customerId) {
      return res.json({ success: true, count: 0, bookings: [] });
    }

    const bookings = db.all(
      `SELECT b.*, v.vehicle_name, v.brand, v.model, v.image, v.category, v.registration_number, v.fuel_type, v.transmission,
              (SELECT rating FROM feedback WHERE booking_id = b.id) as user_rating,
              (SELECT comments FROM feedback WHERE booking_id = b.id) as user_feedback
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`,
      [customerId]
    );

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get single booking details
router.get('/:id', verifyToken, (req, res) => {
  try {
    const booking = db.get(
      `SELECT b.*, v.vehicle_name, v.brand, v.model, v.image, v.category, v.registration_number, 
              v.fuel_type, v.transmission, v.price_per_day, v.seats,
              u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       JOIN customers c ON b.customer_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Role check: customer can only view their own booking; admin can view all
    if (req.user.role === 'customer' && booking.customer_email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
    }

    const payments = db.all('SELECT * FROM payments WHERE booking_id = ? ORDER BY payment_date DESC', [booking.id]);
    const feedback = db.get('SELECT * FROM feedback WHERE booking_id = ?', [booking.id]);

    return res.json({
      success: true,
      booking: {
        ...booking,
        payments,
        feedback: feedback || null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel Booking
router.put('/:id/cancel', verifyToken, (req, res) => {
  try {
    const booking = db.get(
      `SELECT b.*, u.email as customer_email FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Ensure authorization
    if (req.user.role === 'customer' && booking.customer_email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking.' });
    }

    if (booking.booking_status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    if (booking.booking_status === 'completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be cancelled.' });
    }

    db.transaction(() => {
      db.run("UPDATE bookings SET booking_status = 'cancelled' WHERE id = ?", [booking.id]);

      // If no other active booking exists, restore vehicle availability
      const otherActive = db.get(
        "SELECT id FROM bookings WHERE vehicle_id = ? AND id != ? AND booking_status IN ('confirmed', 'active')",
        [booking.vehicle_id, booking.id]
      );
      if (!otherActive) {
        db.run("UPDATE vehicles SET availability_status = 'available' WHERE id = ?", [booking.vehicle_id]);
      }
    });

    return res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all bookings
router.get('/', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const { status, vehicle_id } = req.query;
    let sql = `
      SELECT b.*, v.vehicle_name, v.brand, v.model, v.registration_number,
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN customers c ON b.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      sql += ' AND b.booking_status = ?';
      params.push(status);
    }

    if (vehicle_id) {
      sql += ' AND b.vehicle_id = ?';
      params.push(vehicle_id);
    }

    sql += ' ORDER BY b.created_at DESC';
    const bookings = db.all(sql, params);

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update booking status
router.put('/:id/status', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const { status, payment_status } = req.body;
    const { id } = req.params;

    const booking = db.get('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    db.transaction(() => {
      if (status) {
        db.run('UPDATE bookings SET booking_status = ? WHERE id = ?', [status, id]);

        if (status === 'completed' || status === 'cancelled') {
          const otherActive = db.get(
            "SELECT id FROM bookings WHERE vehicle_id = ? AND id != ? AND booking_status IN ('confirmed', 'active')",
            [booking.vehicle_id, id]
          );
          if (!otherActive) {
            db.run("UPDATE vehicles SET availability_status = 'available' WHERE id = ?", [booking.vehicle_id]);
          }
        } else if (status === 'confirmed' || status === 'active') {
          db.run("UPDATE vehicles SET availability_status = 'booked' WHERE id = ?", [booking.vehicle_id]);
        }
      }

      if (payment_status) {
        db.run('UPDATE bookings SET payment_status = ? WHERE id = ?', [payment_status, id]);
      }
    });

    return res.json({ success: true, message: `Booking status updated to '${status || booking.booking_status}' successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
