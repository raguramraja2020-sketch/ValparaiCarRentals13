const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get maintenance records (Admin sees all, Mechanic sees assigned)
router.get('/', verifyToken, (req, res) => {
  try {
    const { status, vehicle_id } = req.query;
    let sql = `
      SELECT m.*, 
             v.vehicle_name, v.brand, v.model, v.registration_number, v.image, v.availability_status as vehicle_status,
             u.name as mechanic_name, u.email as mechanic_email, mech.specialization, mech.phone as mechanic_phone
      FROM maintenance m
      JOIN vehicles v ON m.vehicle_id = v.id
      LEFT JOIN mechanics mech ON m.mechanic_id = mech.id
      LEFT JOIN users u ON mech.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // If logged in as mechanic, only show records assigned to this mechanic
    if (req.user.role === 'mechanic') {
      let mechanicId = req.user.mechanicId;
      if (!mechanicId) {
        const mech = db.get('SELECT id FROM mechanics WHERE user_id = ?', [req.user.id]);
        if (mech) mechanicId = mech.id;
      }
      sql += ' AND m.mechanic_id = ?';
      params.push(mechanicId);
    }

    if (status && status !== 'All') {
      sql += ' AND m.maintenance_status = ?';
      params.push(status);
    }

    if (vehicle_id) {
      sql += ' AND m.vehicle_id = ?';
      params.push(vehicle_id);
    }

    sql += ' ORDER BY m.scheduled_date DESC';
    const records = db.all(sql, params);

    return res.json({ success: true, count: records.length, records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Assign vehicle to mechanic / Schedule maintenance
router.post('/schedule', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const { vehicle_id, mechanic_id, issue, service_description, scheduled_date, priority } = req.body;

    if (!vehicle_id || !issue || !scheduled_date) {
      return res.status(400).json({ success: false, message: 'Vehicle, issue description, and scheduled date are required.' });
    }

    const vehicle = db.get('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const maintenanceId = 'mnt_' + crypto.randomUUID().slice(0, 8);
    const status = priority === 'Urgent' ? 'Urgent' : 'Scheduled';

    db.transaction(() => {
      // Create maintenance record
      db.run(
        `INSERT INTO maintenance (
          id, vehicle_id, mechanic_id, issue, service_description, 
          service_cost, maintenance_status, scheduled_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [maintenanceId, vehicle_id, mechanic_id || null, issue.trim(), service_description || '', 0, status, scheduled_date]
      );

      // Update vehicle status to maintenance so customers cannot book
      db.run("UPDATE vehicles SET availability_status = 'maintenance' WHERE id = ?", [vehicle_id]);
    });

    const newRecord = db.get('SELECT * FROM maintenance WHERE id = ?', [maintenanceId]);
    return res.status(201).json({ success: true, message: 'Maintenance scheduled successfully.', data: newRecord });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mechanic or Admin: Update maintenance progress / add cost / complete
router.put('/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { maintenance_status, service_description, service_cost, completed_date, issue } = req.body;

    const record = db.get('SELECT * FROM maintenance WHERE id = ?', [id]);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }

    // Role check: if mechanic, ensure it is assigned to this mechanic or admin
    if (req.user.role === 'mechanic') {
      let mechanicId = req.user.mechanicId;
      if (!mechanicId) {
        const mech = db.get('SELECT id FROM mechanics WHERE user_id = ?', [req.user.id]);
        if (mech) mechanicId = mech.id;
      }

      if (record.mechanic_id && record.mechanic_id !== mechanicId) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this service ticket.' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const newStatus = maintenance_status || record.maintenance_status;
    const isCompleted = newStatus === 'Completed';
    const compDate = isCompleted ? (completed_date || new Date().toISOString().split('T')[0]) : record.completed_date;

    db.transaction(() => {
      db.run(
        `UPDATE maintenance SET 
          maintenance_status = ?, 
          service_description = COALESCE(?, service_description),
          service_cost = COALESCE(?, service_cost),
          completed_date = ?,
          issue = COALESCE(?, issue)
         WHERE id = ?`,
        [newStatus, service_description, service_cost !== undefined ? Number(service_cost) : record.service_cost, compDate, issue, id]
      );

      // If marked completed, check if any other active maintenance exists for this vehicle
      if (isCompleted) {
        const otherActive = db.get(
          "SELECT id FROM maintenance WHERE vehicle_id = ? AND id != ? AND maintenance_status IN ('Scheduled', 'In Progress', 'Urgent')",
          [record.vehicle_id, id]
        );
        if (!otherActive) {
          // Re-enable vehicle availability!
          db.run("UPDATE vehicles SET availability_status = 'available' WHERE id = ?", [record.vehicle_id]);
        }
      } else {
        // Still under repair / scheduled
        db.run("UPDATE vehicles SET availability_status = 'maintenance' WHERE id = ?", [record.vehicle_id]);
      }
    });

    const updated = db.get('SELECT * FROM maintenance WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Maintenance status updated successfully.', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mechanic: Report a new issue directly from inspection
router.post('/report-issue', verifyToken, requireRole('mechanic'), (req, res) => {
  try {
    const { vehicle_id, issue, priority, estimated_cost } = req.body;

    if (!vehicle_id || !issue) {
      return res.status(400).json({ success: false, message: 'Vehicle and issue description required.' });
    }

    let mechanicId = req.user.mechanicId;
    if (!mechanicId) {
      const mech = db.get('SELECT id FROM mechanics WHERE user_id = ?', [req.user.id]);
      if (mech) mechanicId = mech.id;
    }

    const id = 'mnt_' + crypto.randomUUID().slice(0, 8);
    const status = priority === 'Urgent' ? 'Urgent' : 'In Progress';
    const now = new Date().toISOString().split('T')[0];

    db.transaction(() => {
      db.run(
        `INSERT INTO maintenance (
          id, vehicle_id, mechanic_id, issue, service_description, 
          service_cost, maintenance_status, scheduled_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, vehicle_id, mechanicId, issue.trim(), 'Initial inspection reported by mechanic.', estimated_cost ? Number(estimated_cost) : 0, status, now]
      );

      db.run("UPDATE vehicles SET availability_status = 'maintenance' WHERE id = ?", [vehicle_id]);
    });

    return res.status(201).json({ success: true, message: 'Issue reported and maintenance ticket opened.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
