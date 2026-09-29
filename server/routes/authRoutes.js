const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db } = require('../db/database');
const { generateToken, verifyToken } = require('../middleware/auth');

// Register Customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, address, driving_license } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    // Admin is strictly built-in; registration is restricted to customers
    if (req.body.role && req.body.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Administrator account is built-in. New administrator registration is disabled.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userId = 'usr_' + crypto.randomUUID().slice(0, 8);
    const customerId = 'cust_' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    db.transaction(() => {
      db.run(
        'INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, name.trim(), normalizedEmail, phone || '', password_hash, 'customer', now]
      );

      db.run(
        'INSERT INTO customers (id, user_id, address, driving_license, emergency_contact) VALUES (?, ?, ?, ?, ?)',
        [customerId, userId, address || '', driving_license || '', '']
      );
    });

    const token = generateToken({
      id: userId,
      customerId,
      email: normalizedEmail,
      name: name.trim(),
      role: 'customer'
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Valparai Rental Cars.',
      token,
      user: {
        id: userId,
        customerId,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || '',
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration. ' + error.message });
  }
});

// Login for Customer, Admin, or Mechanic
router.post('/login', async (req, res) => {
  try {
    const { email, password, requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role check if specifically requested from a dedicated role portal (Admin or Mechanic)
    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({
        success: false,
        message: `Account exists as role '${user.role.toUpperCase()}', but you tried logging into the ${requestedRole.toUpperCase()} portal.`
      });
    }

    let customerId = null;
    let mechanicId = null;

    if (user.role === 'customer') {
      const cust = db.get('SELECT id FROM customers WHERE user_id = ?', [user.id]);
      if (cust) customerId = cust.id;
    } else if (user.role === 'mechanic') {
      const mech = db.get('SELECT id FROM mechanics WHERE user_id = ?', [user.id]);
      if (mech) mechanicId = mech.id;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerId,
      mechanicId
    });

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        customerId,
        mechanicId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login. ' + error.message });
  }
});

// Current User Profile
router.get('/me', verifyToken, (req, res) => {
  try {
    const user = db.get('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let details = {};
    if (user.role === 'customer') {
      details = db.get('SELECT * FROM customers WHERE user_id = ?', [user.id]) || {};
    } else if (user.role === 'mechanic') {
      details = db.get('SELECT * FROM mechanics WHERE user_id = ?', [user.id]) || {};
    }

    return res.json({
      success: true,
      user: {
        ...user,
        details
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update Profile
router.put('/profile', verifyToken, (req, res) => {
  try {
    const { name, phone, address, driving_license, emergency_contact, specialization, experience_years } = req.body;

    if (name) {
      db.run('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name.trim(), phone || '', req.user.id]);
    }

    if (req.user.role === 'customer') {
      db.run(
        'UPDATE customers SET address = ?, driving_license = ?, emergency_contact = ? WHERE user_id = ?',
        [address || '', driving_license || '', emergency_contact || '', req.user.id]
      );
    } else if (req.user.role === 'mechanic') {
      db.run(
        'UPDATE mechanics SET specialization = ?, experience_years = ? WHERE user_id = ?',
        [specialization || '', experience_years || 3, req.user.id]
      );
    }

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
