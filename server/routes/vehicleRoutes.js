const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get all vehicles with optional filters & date-range availability check
router.get('/', (req, res) => {
  try {
    const { q, category, fuel_type, transmission, max_price, availability_status, pickup_date, return_date } = req.query;

    let sql = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];

    if (q) {
      sql += ' AND (vehicle_name LIKE ? OR brand LIKE ? OR model LIKE ? OR category LIKE ?)';
      const queryPattern = `%${q.trim()}%`;
      params.push(queryPattern, queryPattern, queryPattern, queryPattern);
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (fuel_type && fuel_type !== 'All') {
      sql += ' AND fuel_type = ?';
      params.push(fuel_type);
    }

    if (transmission && transmission !== 'All') {
      sql += ' AND transmission = ?';
      params.push(transmission);
    }

    if (max_price) {
      sql += ' AND price_per_day <= ?';
      params.push(Number(max_price));
    }

    if (availability_status && availability_status !== 'All') {
      sql += ' AND availability_status = ?';
      params.push(availability_status);
    }

    sql += ' ORDER BY price_per_day ASC';
    const vehicles = db.all(sql, params);

    // If pickup_date and return_date are provided, dynamically compute date availability
    // Check real-time booking and maintenance statuses for each vehicle
    const enrichedVehicles = vehicles.map(vehicle => {
      // Check if vehicle currently has an active or confirmed booking
      const activeBooking = db.get(
        `SELECT id, pickup_date, return_date, booking_status FROM bookings 
         WHERE vehicle_id = ? AND booking_status IN ('confirmed', 'active')`,
        [vehicle.id]
      );

      // Check if vehicle has an active maintenance
      const activeMaintenance = db.get(
        `SELECT id, maintenance_status FROM maintenance 
         WHERE vehicle_id = ? AND maintenance_status IN ('Scheduled', 'In Progress', 'Urgent')`,
        [vehicle.id]
      );

      let effectiveStatus = vehicle.availability_status;
      if (activeMaintenance) {
        effectiveStatus = 'maintenance';
      } else if (activeBooking || vehicle.availability_status === 'booked') {
        effectiveStatus = 'booked';
      }

      let isAvailableForDates = (effectiveStatus === 'available');

      if (isAvailableForDates && pickup_date && return_date) {
        // Check overlapping bookings
        const conflictingBooking = db.get(
          `SELECT id, pickup_date, return_date, booking_status 
           FROM bookings 
           WHERE vehicle_id = ? 
             AND booking_status IN ('confirmed', 'active', 'pending')
             AND (pickup_date < ? AND return_date > ?)`,
          [vehicle.id, return_date, pickup_date]
        );

        if (conflictingBooking) {
          isAvailableForDates = false;
          effectiveStatus = 'booked';
        }
      }

      return {
        ...vehicle,
        availability_status: effectiveStatus,
        is_available_for_dates: isAvailableForDates,
        has_active_maintenance: !!activeMaintenance,
        maintenance_info: activeMaintenance || null,
        active_booking: activeBooking || null
      };
    });

    return res.json({ success: true, count: enrichedVehicles.length, data: enrichedVehicles });
  } catch (error) {
    console.error('Fetch vehicles error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get single vehicle details
router.get('/:id', (req, res) => {
  try {
    const vehicle = db.get('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Get feedback & ratings
    const feedbacks = db.all(
      `SELECT f.*, u.name as customer_name 
       FROM feedback f 
       JOIN customers c ON f.customer_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN bookings b ON f.booking_id = b.id
       WHERE b.vehicle_id = ?
       ORDER BY f.created_at DESC`,
      [vehicle.id]
    );

    const avgRating = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 4.8; // default high initial rating for demo

    // Maintenance log
    const maintenanceRecords = db.all(
      `SELECT m.*, u.name as mechanic_name 
       FROM maintenance m 
       LEFT JOIN mechanics mech ON m.mechanic_id = mech.id
       LEFT JOIN users u ON mech.user_id = u.id
       WHERE m.vehicle_id = ?
       ORDER BY m.scheduled_date DESC`,
      [vehicle.id]
    );

    return res.json({
      success: true,
      data: {
        ...vehicle,
        feedbacks,
        average_rating: Number(avgRating),
        review_count: feedbacks.length,
        maintenance_history: maintenanceRecords
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add Vehicle
router.post('/', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const {
      vehicle_name,
      brand,
      model,
      category,
      registration_number,
      image,
      seats,
      fuel_type,
      transmission,
      price_per_day,
      description,
      mileage,
      availability_status
    } = req.body;

    if (!vehicle_name || !brand || !model || !registration_number || !price_per_day) {
      return res.status(400).json({ success: false, message: 'Missing required vehicle fields.' });
    }

    const regNum = registration_number.trim().toUpperCase();
    const existing = db.get('SELECT id FROM vehicles WHERE registration_number = ?', [regNum]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'A vehicle with this registration number already exists.' });
    }

    const id = 'veh_' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO vehicles (
        id, vehicle_name, brand, model, category, registration_number, 
        image, seats, fuel_type, transmission, price_per_day, 
        availability_status, description, mileage, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        vehicle_name.trim(),
        brand.trim(),
        model.trim(),
        category || 'SUV',
        regNum,
        image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        Number(seats) || 5,
        fuel_type || 'Diesel',
        transmission || 'Manual',
        Number(price_per_day),
        availability_status || 'available',
        description || 'Comfortable ride for Valparai hill roads.',
        Number(mileage) || 15000,
        now
      ]
    );

    const newVehicle = db.get('SELECT * FROM vehicles WHERE id = ?', [id]);
    return res.status(201).json({ success: true, message: 'Vehicle added successfully.', data: newVehicle });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Edit Vehicle
router.put('/:id', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = db.get('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const {
      vehicle_name,
      brand,
      model,
      category,
      registration_number,
      image,
      seats,
      fuel_type,
      transmission,
      price_per_day,
      description,
      mileage,
      availability_status
    } = req.body;

    const regNum = registration_number ? registration_number.trim().toUpperCase() : vehicle.registration_number;

    // Check duplicate reg
    if (regNum !== vehicle.registration_number) {
      const existing = db.get('SELECT id FROM vehicles WHERE registration_number = ? AND id != ?', [regNum, id]);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Registration number already in use by another vehicle.' });
      }
    }

    db.run(
      `UPDATE vehicles SET 
        vehicle_name = ?, brand = ?, model = ?, category = ?, registration_number = ?,
        image = ?, seats = ?, fuel_type = ?, transmission = ?, price_per_day = ?,
        description = ?, mileage = ?, availability_status = ?
       WHERE id = ?`,
      [
        vehicle_name || vehicle.vehicle_name,
        brand || vehicle.brand,
        model || vehicle.model,
        category || vehicle.category,
        regNum,
        image || vehicle.image,
        seats ? Number(seats) : vehicle.seats,
        fuel_type || vehicle.fuel_type,
        transmission || vehicle.transmission,
        price_per_day ? Number(price_per_day) : vehicle.price_per_day,
        description !== undefined ? description : vehicle.description,
        mileage ? Number(mileage) : vehicle.mileage,
        availability_status || vehicle.availability_status,
        id
      ]
    );

    const updated = db.get('SELECT * FROM vehicles WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Vehicle updated successfully.', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete Vehicle (with safety checks for active bookings & maintenance)
router.delete('/:id', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = db.get('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Safety Check 1: Active or confirmed bookings
    const activeBookings = db.get(
      "SELECT COUNT(*) as count FROM bookings WHERE vehicle_id = ? AND booking_status IN ('confirmed', 'active', 'pending')",
      [id]
    );
    if (activeBookings && activeBookings.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vehicle. It has ${activeBookings.count} active or pending booking(s). Please complete or cancel those bookings first.`
      });
    }

    // Safety Check 2: Ongoing maintenance
    const activeMaintenance = db.get(
      "SELECT COUNT(*) as count FROM maintenance WHERE vehicle_id = ? AND maintenance_status IN ('Scheduled', 'In Progress', 'Urgent')",
      [id]
    );
    if (activeMaintenance && activeMaintenance.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vehicle. It is currently assigned to active maintenance. Resolve the maintenance record first.`
      });
    }

    // Delete associated past records if any or delete vehicle
    db.run('DELETE FROM vehicles WHERE id = ?', [id]);

    return res.json({ success: true, message: `Vehicle '${vehicle.vehicle_name}' (${vehicle.registration_number}) deleted successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
