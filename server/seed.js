const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db } = require('./db/database');

async function seed() {
  console.log('🌱 Starting database seeding for VALPARAI RENTAL CARS...');

  // Clear existing demo tables in reverse dependency order
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DELETE FROM feedback;');
  db.exec('DELETE FROM payments;');
  db.exec('DELETE FROM maintenance;');
  db.exec('DELETE FROM bookings;');
  db.exec('DELETE FROM vehicles;');
  db.exec('DELETE FROM customers;');
  db.exec('DELETE FROM mechanics;');
  db.exec('DELETE FROM users;');
  db.exec('PRAGMA foreign_keys = ON;');

  const now = new Date().toISOString();
  const salt = await bcrypt.genSalt(10);
  const commonHash = await bcrypt.hash('password123', salt);
  const adminHash = await bcrypt.hash('admin123', salt);
  const mechanicHash = await bcrypt.hash('mechanic123', salt);
  const customerHash = await bcrypt.hash('customer123', salt);

  // 1. SEED USERS
  // Built-in Single Admin
  const adminId = 'usr_admin01';
  db.run(
    'INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [adminId, 'Valparai Chief Administrator', 'valparairentals13@gmail.com', '8667654134', adminHash, 'admin', now]
  );
  // Also provide admin@valparai.com alias for convenience
  db.run(
    'INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['usr_admin02', 'Valparai System Admin', 'admin@valparai.com', '9442410020', adminHash, 'admin', now]
  );

  // Mechanics
  const mechUser1 = 'usr_mech01';
  const mechId1 = 'mech_01';
  db.run(
    'INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [mechUser1, 'Muthu Vel (Hill Specialist)', 'mechanic@valparai.com', '+91 98422 11223', mechanicHash, 'mechanic', now]
  );
  db.run(
    'INSERT INTO mechanics (id, user_id, specialization, phone, status, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
    [mechId1, mechUser1, '4x4 Hill Terrain, Suspension & Steering', '+91 98422 11223', 'active', 7]
  );

  const mechUser2 = 'usr_mech02';
  const mechId2 = 'mech_02';
  db.run(
    'INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [mechUser2, 'Ramesh Kumar (Engine & Brakes)', 'ramesh.mech@valparai.com', '+91 97890 22334', mechanicHash, 'mechanic', now]
  );
  db.run(
    'INSERT INTO mechanics (id, user_id, specialization, phone, status, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
    [mechId2, mechUser2, 'Braking Systems & Engine Diagnostics', '+91 97890 22334', 'active', 5]
  );

  // Customers
  const custUser1 = 'usr_cust01';
  const custId1 = 'cust_01';
  db.run(
    'INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [custUser1, 'Ananya Sharma', 'customer@valparai.com', '+91 98765 43210', customerHash, 'customer', now]
  );
  db.run(
    'INSERT INTO customers (id, user_id, address, driving_license, emergency_contact) VALUES (?, ?, ?, ?, ?)',
    [custId1, custUser1, '14, Cross Cut Road, Coimbatore, Tamil Nadu', 'TN-38-2022-0049182', '+91 98765 00000']
  );

  const custUser2 = 'usr_cust02';
  const custId2 = 'cust_02';
  db.run(
    'INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [custUser2, 'Arun Kumar', 'arun.kumar@gmail.com', '+91 94432 18900', customerHash, 'customer', now]
  );
  db.run(
    'INSERT INTO customers (id, user_id, address, driving_license, emergency_contact) VALUES (?, ?, ?, ?, ?)',
    [custId2, custUser2, '82, Gandhi Road, Pollachi, Tamil Nadu', 'TN-41-2021-0081290', '+91 94432 00000']
  );

  // 2. SEED VEHICLES
  const vehicles = [
    {
      id: 'veh_etios',
      name: 'Toyota Etios Platinum',
      brand: 'Toyota',
      model: 'Etios',
      category: 'Sedan',
      reg: 'TN 41 AX 4201',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      seats: 5,
      fuel: 'Petrol',
      transmission: 'Manual',
      price: 1400,
      status: 'available',
      desc: 'Highly reliable sedan with supreme fuel efficiency and smooth hill climbing torque. Ideal for couple and small family tours in Valparai.',
      mileage: 24500
    },
    {
      id: 'veh_thar',
      name: 'Mahindra Thar 4x4 Hardtop',
      brand: 'Mahindra',
      model: 'Thar',
      category: 'SUV',
      reg: 'TN 38 BX 9901',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      seats: 4,
      fuel: 'Diesel',
      transmission: 'Manual',
      price: 3800,
      status: 'available',
      desc: 'Legendary off-roader built for tea plantation gravel trails, high-altitude viewpoints, and mist-laden forest hairpins.',
      mileage: 18200
    },
    {
      id: 'veh_innova',
      name: 'Toyota Innova Crysta ZX',
      brand: 'Toyota',
      model: 'Innova Crysta',
      category: 'MUV',
      reg: 'TN 41 CZ 5520',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      seats: 7,
      fuel: 'Diesel',
      transmission: 'Automatic',
      price: 3200,
      status: 'available',
      desc: 'The undisputed monarch of mountain highways. Unrivaled ride comfort, plush rear AC, and massive boot space for extended Valparai stays.',
      mileage: 31000
    },
    {
      id: 'veh_creta',
      name: 'Hyundai Creta SX Turbo',
      brand: 'Hyundai',
      model: 'Creta',
      category: 'SUV',
      reg: 'TN 38 DK 7741',
      image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
      seats: 5,
      fuel: 'Petrol',
      transmission: 'Automatic',
      price: 2600,
      status: 'available',
      desc: 'Panoramic sunroof opens up the lush Western Ghats canopy. Features hill assist, cruise control, and effortless paddle shifters.',
      mileage: 14000
    },
    {
      id: 'veh_swift',
      name: 'Maruti Suzuki Swift ZXi',
      brand: 'Maruti Suzuki',
      model: 'Swift',
      category: 'Hatchback',
      reg: 'TN 41 EM 1089',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      seats: 5,
      fuel: 'Petrol',
      transmission: 'Manual',
      price: 1200,
      status: 'available',
      desc: 'Compact, agile, and wonderfully easy to park near scenic roadside waterfalls and tea stalls across Valparai.',
      mileage: 22000
    },
    {
      id: 'veh_scorpio',
      name: 'Mahindra Scorpio-N Z8',
      brand: 'Mahindra',
      model: 'Scorpio-N',
      category: 'SUV',
      reg: 'TN 38 FA 3302',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
      seats: 7,
      fuel: 'Diesel',
      transmission: 'Automatic',
      price: 3400,
      status: 'available',
      desc: 'High muscular stance, commanding visibility over hairpin curves, and heavy-duty suspension for uneven mountain terrain.',
      mileage: 16500
    },
    {
      id: 'veh_city',
      name: 'Honda City ZX i-VTEC',
      brand: 'Honda',
      model: 'City',
      category: 'Sedan',
      reg: 'TN 41 GB 6614',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
      seats: 5,
      fuel: 'Petrol',
      transmission: 'Automatic',
      price: 2400,
      status: 'available',
      desc: 'Aerodynamic elegance, serene cabin insulation, and supple suspension delivering effortless gliding on winding roads.',
      mileage: 19800
    },
    {
      id: 'veh_nexon_ev',
      name: 'Tata Nexon.ev Max',
      brand: 'Tata',
      model: 'Nexon EV',
      category: 'SUV',
      reg: 'TN 38 EV 0055',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      seats: 5,
      fuel: 'Electric',
      transmission: 'Automatic',
      price: 2800,
      status: 'available',
      desc: 'Zero tailpipe emissions to keep Valparai rain forests pristine. Instant electric torque for quiet, thrilling hill climbs.',
      mileage: 9500
    },
    {
      id: 'veh_ertiga',
      name: 'Maruti Suzuki Ertiga Smart Hybrid',
      brand: 'Maruti Suzuki',
      model: 'Ertiga',
      category: 'MUV',
      reg: 'TN 41 HJ 9021',
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      seats: 7,
      fuel: 'Petrol',
      transmission: 'Manual',
      price: 2200,
      status: 'maintenance',
      desc: 'Popular 7-seater currently undergoing periodic brake-pad inspection by our workshop team.',
      mileage: 38000
    }
  ];

  for (const v of vehicles) {
    db.run(
      `INSERT INTO vehicles (
        id, vehicle_name, brand, model, category, registration_number, 
        image, seats, fuel_type, transmission, price_per_day, 
        availability_status, description, mileage, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.id, v.name, v.brand, v.model, v.category, v.reg, v.image, v.seats, v.fuel, v.transmission, v.price, v.status, v.desc, v.mileage, now]
    );
  }

  // 3. SEED BOOKINGS & PAYMENTS
  // Booking 1: Past completed booking for Ananya Sharma (Toyota Etios, 3 days = 4200)
  const bk1 = 'bk_001';
  db.run(
    `INSERT INTO bookings (
      id, customer_id, vehicle_id, pickup_location, pickup_date, return_date, 
      number_of_days, total_amount, booking_status, payment_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bk1, custId1, 'veh_etios', 'Valparai Bus Stand', '2026-09-20', '2026-09-23', 3, 4200, 'completed', 'paid', '2026-09-18T10:00:00.000Z']
  );
  db.run(
    `INSERT INTO payments (
      id, booking_id, customer_id, amount, payment_method, 
      payment_status, transaction_reference, payment_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pay_001', bk1, custId1, 4200, 'upi', 'success', 'VRC-UPI-782190-4421', '2026-09-18T10:05:00.000Z']
  );
  // Feedback for bk1
  db.run(
    `INSERT INTO feedback (id, customer_id, booking_id, rating, comments, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    ['fb_001', custId1, bk1, 5, 'The Toyota Etios handled all 40 hairpin bends like a dream! Pickup at Valparai town was punctual and courteous.', '2026-09-24T14:30:00.000Z']
  );

  // Booking 2: Active booking for Arun Kumar (Mahindra Thar, 2 days = 7600)
  const bk2 = 'bk_002';
  db.run(
    `INSERT INTO bookings (
      id, customer_id, vehicle_id, pickup_location, pickup_date, return_date, 
      number_of_days, total_amount, booking_status, payment_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bk2, custId2, 'veh_thar', 'Pollachi Junction', '2026-09-29', '2026-10-01', 2, 7600, 'active', 'paid', '2026-09-27T08:30:00.000Z']
  );
  db.run(
    `INSERT INTO payments (
      id, booking_id, customer_id, amount, payment_method, 
      payment_status, transaction_reference, payment_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pay_002', bk2, custId2, 7600, 'card', 'success', 'VRC-CARD-991204-5812', '2026-09-27T08:35:00.000Z']
  );

  // Booking 3: Upcoming confirmed booking for Ananya Sharma (Innova Crysta, 4 days = 12800)
  const bk3 = 'bk_003';
  db.run(
    `INSERT INTO bookings (
      id, customer_id, vehicle_id, pickup_location, pickup_date, return_date, 
      number_of_days, total_amount, booking_status, payment_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bk3, custId1, 'veh_innova', 'Coimbatore Airport (CJB)', '2026-10-05', '2026-10-09', 4, 12800, 'confirmed', 'paid', '2026-09-28T16:00:00.000Z']
  );
  db.run(
    `INSERT INTO payments (
      id, booking_id, customer_id, amount, payment_method, 
      payment_status, transaction_reference, payment_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pay_003', bk3, custId1, 12800, 'netbanking', 'success', 'VRC-NET-118204-3319', '2026-09-28T16:05:00.000Z']
  );

  // 4. SEED MAINTENANCE RECORDS
  // Active maintenance ticket on Ertiga assigned to Muthu Vel
  db.run(
    `INSERT INTO maintenance (
      id, vehicle_id, mechanic_id, issue, service_description, 
      service_cost, maintenance_status, scheduled_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'mnt_001',
      'veh_ertiga',
      mechId1,
      'Brake pad wear & mountain clutch calibration',
      'Inspecting front disc rotors and calibrating mountain grade clutch tension.',
      1850,
      'In Progress',
      '2026-09-28'
    ]
  );

  // Past completed maintenance ticket on Thar
  db.run(
    `INSERT INTO maintenance (
      id, vehicle_id, mechanic_id, issue, service_description, 
      service_cost, maintenance_status, scheduled_date, completed_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'mnt_002',
      'veh_thar',
      mechId1,
      '4x4 Transfer case oil check & underbody stone guard tightening',
      'Fluids topped up, stone guard torqued to OEM specification.',
      2400,
      'Completed',
      '2026-09-15',
      '2026-09-16'
    ]
  );

  // Scheduled maintenance ticket for Creta assigned to Ramesh Kumar
  db.run(
    `INSERT INTO maintenance (
      id, vehicle_id, mechanic_id, issue, service_description, 
      service_cost, maintenance_status, scheduled_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'mnt_003',
      'veh_creta',
      mechId2,
      '15,000 KM Periodic Service & AC pollen filter replacement',
      'Full synthetic engine oil replacement and AC mist freshener.',
      3200,
      'Scheduled',
      '2026-10-12'
    ]
  );

  // Additional Feedback
  db.run(
    `INSERT INTO feedback (id, customer_id, booking_id, rating, comments, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    ['fb_002', custId2, bk2, 5, 'Taking the Thar into the upper tea estates was exhilarating! The vehicle was squeaky clean and mechanics kept it in pristine condition.', '2026-09-29T12:00:00.000Z']
  );

  console.log('✅ Seeding completed successfully!');
  console.log(`
==================================================
🌟 VALPARAI RENTAL CARS - DEMO ACCOUNTS READY
==================================================
👑 ADMIN:
   Email:    admin@valparai.com
   Password: admin123

🔧 MECHANIC:
   Email:    mechanic@valparai.com
   Password: mechanic123

🚗 CUSTOMER:
   Email:    customer@valparai.com
   Password: customer123
==================================================
  `);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
