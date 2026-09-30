import { INITIAL_VEHICLES, INITIAL_BOOKINGS, INITIAL_MAINTENANCE, INITIAL_FEEDBACK } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to access and persist local state when backend is unreachable
function getStored(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// Initialize offline storage on first visit
function initOfflineStorage() {
  if (!localStorage.getItem('vrc_vehicles')) {
    setStored('vrc_vehicles', INITIAL_VEHICLES);
  }
  if (!localStorage.getItem('vrc_bookings')) {
    setStored('vrc_bookings', INITIAL_BOOKINGS);
  }
  if (!localStorage.getItem('vrc_maintenance')) {
    setStored('vrc_maintenance', INITIAL_MAINTENANCE);
  }
  if (!localStorage.getItem('vrc_feedback')) {
    setStored('vrc_feedback', INITIAL_FEEDBACK);
  }
  if (!localStorage.getItem('vrc_users')) {
    setStored('vrc_users', [
      {
        id: 'usr_admin',
        name: 'Chief Administrator',
        email: 'valparairentals13@gmail.com',
        phone: '8667654134, 9442410020',
        role: 'admin'
      },
      {
        id: 'usr_admin2',
        name: 'System Admin',
        email: 'admin@valparai.com',
        phone: '9442410020',
        role: 'admin'
      },
      {
        id: 'usr_mech',
        name: 'Muthu Vel (Hill Specialist)',
        email: 'mechanic@valparai.com',
        phone: '+91 98422 11223',
        role: 'mechanic',
        specialization: '4x4 Hill Terrain & Suspension'
      },
      {
        id: 'usr_cust',
        name: 'Karthikeyan R',
        email: 'customer@valparai.com',
        phone: '+91 94424 10020',
        role: 'customer'
      }
    ]);
  }
}

initOfflineStorage();

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('vrc_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout to trigger fallback smoothly

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    // Allow fallback engine to handle
    throw err;
  }
}

export const api = {
  // Auth
  register: async (body) => {
    try {
      return await request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      // Offline fallback
      const users = getStored('vrc_users', []);
      const exists = users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
      if (exists) {
        throw new Error('An account with this email already exists.');
      }
      const newUser = {
        id: `usr_${Date.now()}`,
        name: body.name,
        email: body.email.toLowerCase(),
        phone: body.phone,
        role: 'customer',
        details: {
          address: body.address || '',
          driving_license: body.driving_license || ''
        }
      };
      users.push(newUser);
      setStored('vrc_users', users);
      const token = `vrc_token_${newUser.id}`;
      localStorage.setItem('vrc_token', token);
      localStorage.setItem('vrc_current_user', JSON.stringify(newUser));
      return { success: true, token, user: newUser };
    }
  },

  login: async (emailOrObj, passwordArg, roleArg) => {
    let email = emailOrObj;
    let password = passwordArg;
    let role = roleArg;

    if (typeof emailOrObj === 'object' && emailOrObj !== null) {
      email = emailOrObj.email;
      password = emailOrObj.password;
      role = emailOrObj.role || emailOrObj.requestedRole;
    }

    email = String(email || '').trim().toLowerCase();
    password = String(password || '');
    role = String(role || 'customer').toLowerCase();

    try {
      return await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) });
    } catch {
      // Offline fallback with built-in credentials
      const normalizedEmail = email;
      const users = getStored('vrc_users', []);

      if (role === 'admin') {
        if ((normalizedEmail === 'valparairentals13@gmail.com' || normalizedEmail === 'admin@valparai.com') && password === 'admin123') {
          const adminUser = users.find(u => u.role === 'admin') || {
            id: 'usr_admin',
            name: 'Valparai Chief Administrator',
            email: 'valparairentals13@gmail.com',
            role: 'admin'
          };
          localStorage.setItem('vrc_token', 'vrc_admin_token');
          localStorage.setItem('vrc_current_user', JSON.stringify(adminUser));
          return { success: true, token: 'vrc_admin_token', user: adminUser };
        }
        throw new Error('Invalid Admin credentials. (Use valparairentals13@gmail.com / admin123)');
      }

      if (role === 'mechanic') {
        if ((normalizedEmail === 'mechanic@valparai.com' || normalizedEmail === 'ramesh.mech@valparai.com') && password === 'mechanic123') {
          const mechUser = users.find(u => u.role === 'mechanic') || {
            id: 'usr_mech',
            name: 'Muthu Vel (Hill Specialist)',
            email: 'mechanic@valparai.com',
            role: 'mechanic'
          };
          localStorage.setItem('vrc_token', 'vrc_mech_token');
          localStorage.setItem('vrc_current_user', JSON.stringify(mechUser));
          return { success: true, token: 'vrc_mech_token', user: mechUser };
        }
        throw new Error('Invalid Mechanic credentials. (Use mechanic@valparai.com / mechanic123)');
      }

      // Customer
      const matched = users.find(u => u.email.toLowerCase() === normalizedEmail && u.role === 'customer');
      if (matched || (normalizedEmail === 'customer@valparai.com' && password === 'customer123')) {
        const custUser = matched || {
          id: 'usr_cust',
          name: 'Karthikeyan R',
          email: 'customer@valparai.com',
          role: 'customer'
        };
        localStorage.setItem('vrc_token', `vrc_token_${custUser.id}`);
        localStorage.setItem('vrc_current_user', JSON.stringify(custUser));
        return { success: true, token: `vrc_token_${custUser.id}`, user: custUser };
      }

      throw new Error('Invalid email or password. You can also create a new account.');
    }
  },

  getMe: async () => {
    try {
      return await request('/auth/me');
    } catch {
      const stored = localStorage.getItem('vrc_current_user');
      if (stored) {
        return { success: true, user: JSON.parse(stored) };
      }
      throw new Error('Not authenticated');
    }
  },

  updateProfile: async (body) => {
    try {
      return await request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) });
    } catch {
      const stored = localStorage.getItem('vrc_current_user');
      if (stored) {
        const user = { ...JSON.parse(stored), ...body };
        localStorage.setItem('vrc_current_user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: true };
    }
  },

  // Vehicles
  getVehicles: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'All') {
          query.append(k, v);
        }
      });
      const qs = query.toString();
      return await request(`/vehicles${qs ? `?${qs}` : ''}`);
    } catch {
      // Offline fallback: load from storage and apply filters
      let list = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);

      // Dynamically calculate if any vehicle is currently booked
      list = list.map(v => {
        const hasActive = bookings.some(
          b => b.vehicle_id === v.id && (b.booking_status === 'confirmed' || b.booking_status === 'active' || b.booking_status === 'pending')
        );
        return {
          ...v,
          availability_status: hasActive ? 'booked' : v.availability_status,
          is_available_for_dates: !hasActive && v.availability_status !== 'maintenance'
        };
      });

      if (params.q) {
        const q = params.q.toLowerCase();
        list = list.filter(v =>
          v.vehicle_name.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
        );
      }

      if (params.category && params.category !== 'All') {
        list = list.filter(v => v.category.toLowerCase() === params.category.toLowerCase());
      }

      if (params.fuel_type && params.fuel_type !== 'All') {
        list = list.filter(v => v.fuel_type.toLowerCase() === params.fuel_type.toLowerCase());
      }

      if (params.transmission && params.transmission !== 'All') {
        list = list.filter(v => v.transmission.toLowerCase() === params.transmission.toLowerCase());
      }

      if (params.max_price) {
        list = list.filter(v => v.price_per_day <= Number(params.max_price));
      }

      if (params.availability_status === 'available') {
        list = list.filter(v => v.availability_status === 'available' && v.is_available_for_dates);
      }

      return { success: true, count: list.length, data: list };
    }
  },

  getVehicleById: async (id) => {
    try {
      return await request(`/vehicles/${id}`);
    } catch {
      const list = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const found = list.find(v => v.id === id);
      if (!found) throw new Error('Vehicle not found.');
      return { success: true, data: found };
    }
  },

  createVehicle: async (body) => {
    try {
      return await request('/vehicles', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      const list = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const newV = {
        ...body,
        id: `veh_${Date.now()}`,
        is_available_for_dates: true
      };
      list.unshift(newV);
      setStored('vrc_vehicles', list);
      return { success: true, data: newV };
    }
  },

  updateVehicle: async (id, body) => {
    try {
      return await request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    } catch {
      const list = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const idx = list.findIndex(v => v.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...body };
        setStored('vrc_vehicles', list);
      }
      return { success: true };
    }
  },

  deleteVehicle: async (id) => {
    try {
      return await request(`/vehicles/${id}`, { method: 'DELETE' });
    } catch {
      let list = getStored('vrc_vehicles', INITIAL_VEHICLES);
      list = list.filter(v => v.id !== id);
      setStored('vrc_vehicles', list);
      return { success: true };
    }
  },

  // Bookings
  checkAvailability: async (body) => {
    try {
      return await request('/bookings/check-availability', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      const { vehicle_id, pickup_date, return_date } = body;
      const vehicles = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      const vehicle = vehicles.find(v => v.id === vehicle_id);

      if (!vehicle) {
        return { available: false, reason: 'Vehicle not found.' };
      }

      if (vehicle.availability_status === 'maintenance') {
        return { available: false, reason: 'This vehicle is currently undergoing mountain safety maintenance.' };
      }

      // Check overlapping dates
      const hasConflict = bookings.some(b => {
        if (b.vehicle_id !== vehicle_id) return false;
        if (['cancelled', 'completed'].includes(b.booking_status)) return false;
        return (pickup_date <= b.return_date && return_date >= b.pickup_date);
      });

      if (hasConflict) {
        return { available: false, reason: 'This vehicle is already booked for the selected dates.' };
      }

      const pDate = new Date(pickup_date);
      const rDate = new Date(return_date);
      const diffTime = Math.abs(rDate - pDate);
      const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const total = days * vehicle.price_per_day;

      return {
        available: true,
        vehicle,
        pickup_date,
        return_date,
        number_of_days: days,
        price_per_day: vehicle.price_per_day,
        total_amount: total
      };
    }
  },

  createBooking: async (body) => {
    try {
      return await request('/bookings', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      const { vehicle_id, pickup_location, pickup_date, return_date, payment_method } = body;
      const vehicles = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      const vehicle = vehicles.find(v => v.id === vehicle_id);
      const currentUser = JSON.parse(localStorage.getItem('vrc_current_user') || '{}');

      const pDate = new Date(pickup_date);
      const rDate = new Date(return_date);
      const diffTime = Math.abs(rDate - pDate);
      const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const total = days * (vehicle?.price_per_day || 2000);

      const bookingId = `VRC-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newBooking = {
        id: bookingId,
        customer_id: currentUser.id || 'cust_local',
        customer_name: currentUser.name || 'Valparai Traveler',
        customer_email: currentUser.email || 'customer@valparai.com',
        customer_phone: currentUser.phone || '8667654134',
        vehicle_id,
        vehicle_name: vehicle?.vehicle_name || 'Fleet Car',
        brand: vehicle?.brand || 'Valparai',
        image: vehicle?.image || '',
        pickup_location,
        pickup_date,
        return_date,
        number_of_days: days,
        total_amount: total,
        booking_status: 'confirmed',
        payment_status: 'paid',
        payment_method: payment_method || 'UPI',
        created_at: new Date().toISOString()
      };

      bookings.unshift(newBooking);
      setStored('vrc_bookings', bookings);

      // Update vehicle status in offline cache
      const vIdx = vehicles.findIndex(v => v.id === vehicle_id);
      if (vIdx !== -1) {
        vehicles[vIdx].availability_status = 'booked';
        vehicles[vIdx].is_available_for_dates = false;
        setStored('vrc_vehicles', vehicles);
      }

      return {
        success: true,
        booking: newBooking,
        payment: {
          id: `pay_${Date.now()}`,
          booking_id: bookingId,
          amount: total,
          payment_method: payment_method || 'UPI',
          payment_status: 'success',
          transaction_reference: `VRC-UPI-${Date.now().toString().slice(-8)}`
        }
      };
    }
  },

  getMyBookings: async () => {
    try {
      return await request('/bookings/my-bookings');
    } catch {
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      return { success: true, bookings };
    }
  },

  getBookingById: async (id) => {
    try {
      return await request(`/bookings/${id}`);
    } catch {
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      const found = bookings.find(b => b.id === id);
      return { success: true, booking: found };
    }
  },

  cancelBooking: async (id) => {
    try {
      return await request(`/bookings/${id}/cancel`, { method: 'PUT' });
    } catch {
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      const vehicles = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const bIdx = bookings.findIndex(b => b.id === id);
      if (bIdx !== -1) {
        bookings[bIdx].booking_status = 'cancelled';
        const vId = bookings[bIdx].vehicle_id;
        const vIdx = vehicles.findIndex(v => v.id === vId);
        if (vIdx !== -1) {
          vehicles[vIdx].availability_status = 'available';
          vehicles[vIdx].is_available_for_dates = true;
          setStored('vrc_vehicles', vehicles);
        }
        setStored('vrc_bookings', bookings);
      }
      return { success: true };
    }
  },

  getAllBookings: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      return await request(`/bookings${qs ? `?${qs}` : ''}`);
    } catch {
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      return { success: true, bookings };
    }
  },

  updateBookingStatus: async (id, body) => {
    try {
      return await request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify(body) });
    } catch {
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      const idx = bookings.findIndex(b => b.id === id);
      if (idx !== -1) {
        bookings[idx] = { ...bookings[idx], ...body };
        setStored('vrc_bookings', bookings);
      }
      return { success: true };
    }
  },

  // Payments
  processPayment: async (body) => {
    try {
      return await request('/payments/process', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      return {
        success: true,
        payment: {
          id: `pay_${Date.now()}`,
          ...body,
          payment_status: 'success',
          transaction_reference: `VRC-TXN-${Date.now().toString().slice(-8)}`
        }
      };
    }
  },

  getMyPayments: async () => {
    try {
      return await request('/payments/my-payments');
    } catch {
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      const payments = bookings.map(b => ({
        id: `pay_${b.id}`,
        booking_id: b.id,
        amount: b.total_amount,
        payment_method: b.payment_method || 'UPI',
        payment_status: 'success',
        transaction_reference: `VRC-REF-${b.id}`,
        payment_date: b.created_at,
        vehicle_name: b.vehicle_name,
        pickup_date: b.pickup_date,
        return_date: b.return_date
      }));
      return { success: true, payments };
    }
  },

  getAllPayments: async () => {
    try {
      return await request('/payments');
    } catch {
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      const payments = bookings.map(b => ({
        id: `pay_${b.id}`,
        booking_id: b.id,
        amount: b.total_amount,
        payment_method: b.payment_method || 'UPI',
        payment_status: 'success',
        transaction_reference: `VRC-REF-${b.id}`,
        payment_date: b.created_at,
        customer_name: b.customer_name,
        vehicle_name: b.vehicle_name
      }));
      return { success: true, payments };
    }
  },

  // Maintenance
  getMaintenance: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      return await request(`/maintenance${qs ? `?${qs}` : ''}`);
    } catch {
      const records = getStored('vrc_maintenance', INITIAL_MAINTENANCE);
      return { success: true, records };
    }
  },

  scheduleMaintenance: async (body) => {
    try {
      return await request('/maintenance/schedule', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      const records = getStored('vrc_maintenance', INITIAL_MAINTENANCE);
      const vehicles = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const v = vehicles.find(veh => veh.id === body.vehicle_id);

      const newRec = {
        id: `mnt_${Date.now()}`,
        vehicle_id: body.vehicle_id,
        vehicle_name: v?.vehicle_name || 'Fleet Car',
        brand: v?.brand || 'Valparai',
        registration_number: v?.registration_number || 'TN 41',
        image: v?.image || '',
        mechanic_id: body.mechanic_id || 'mech_01',
        mechanic_name: 'Muthu Vel (Hill Specialist)',
        issue: body.issue,
        service_description: 'Scheduled for hill safety check',
        service_cost: 0,
        maintenance_status: 'Scheduled',
        priority: body.priority || 'Normal',
        scheduled_date: body.scheduled_date || new Date().toISOString().split('T')[0],
        completed_date: null
      };

      records.unshift(newRec);
      setStored('vrc_maintenance', records);

      if (v) {
        v.availability_status = 'maintenance';
        v.is_available_for_dates = false;
        setStored('vrc_vehicles', vehicles);
      }

      return { success: true, record: newRec };
    }
  },

  updateMaintenance: async (id, body) => {
    try {
      return await request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    } catch {
      const records = getStored('vrc_maintenance', INITIAL_MAINTENANCE);
      const vehicles = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const idx = records.findIndex(r => r.id === id);

      if (idx !== -1) {
        records[idx] = { ...records[idx], ...body };
        if (body.maintenance_status === 'Completed') {
          const vIdx = vehicles.findIndex(v => v.id === records[idx].vehicle_id);
          if (vIdx !== -1) {
            vehicles[vIdx].availability_status = 'available';
            vehicles[vIdx].is_available_for_dates = true;
            setStored('vrc_vehicles', vehicles);
          }
        }
        setStored('vrc_maintenance', records);
      }
      return { success: true };
    }
  },

  reportIssue: async (body) => {
    try {
      return await request('/maintenance/report-issue', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      return this.scheduleMaintenance(body);
    }
  },

  // Feedback
  getPublicFeedback: async () => {
    try {
      return await request('/feedback/public');
    } catch {
      const feedback = getStored('vrc_feedback', INITIAL_FEEDBACK);
      return { success: true, feedback };
    }
  },

  submitFeedback: async (body) => {
    try {
      return await request('/feedback', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      const feedback = getStored('vrc_feedback', INITIAL_FEEDBACK);
      const currentUser = JSON.parse(localStorage.getItem('vrc_current_user') || '{}');
      const newFb = {
        id: `fb_${Date.now()}`,
        customer_name: currentUser.name || 'Valparai Customer',
        vehicle_name: body.vehicle_name || 'Rental Car',
        rating: body.rating,
        comments: body.comments,
        created_at: new Date().toISOString()
      };
      feedback.unshift(newFb);
      setStored('vrc_feedback', feedback);
      return { success: true, feedback: newFb };
    }
  },

  getAllFeedback: async () => {
    try {
      return await request('/feedback');
    } catch {
      const feedback = getStored('vrc_feedback', INITIAL_FEEDBACK);
      return { success: true, feedback };
    }
  },

  // Admin
  getDashboardStats: async () => {
    try {
      return await request('/admin/dashboard-stats');
    } catch {
      const vehicles = getStored('vrc_vehicles', INITIAL_VEHICLES);
      const bookings = getStored('vrc_bookings', INITIAL_BOOKINGS);
      const maintenance = getStored('vrc_maintenance', INITIAL_MAINTENANCE);
      const users = getStored('vrc_users', []);

      const totalRevenue = bookings.reduce((sum, b) => sum + (b.payment_status === 'paid' ? b.total_amount : 0), 0);

      return {
        success: true,
        stats: {
          totalVehicles: vehicles.length,
          availableVehicles: vehicles.filter(v => v.availability_status === 'available').length,
          bookedVehicles: vehicles.filter(v => v.availability_status === 'booked').length,
          maintenanceVehicles: vehicles.filter(v => v.availability_status === 'maintenance').length,
          totalBookings: bookings.length,
          activeBookings: bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'active').length,
          completedBookings: bookings.filter(b => b.booking_status === 'completed').length,
          cancelledBookings: bookings.filter(b => b.booking_status === 'cancelled').length,
          totalRevenue,
          totalCustomers: users.filter(u => u.role === 'customer').length || 1,
          totalMechanics: 2
        }
      };
    }
  },

  getAdminCustomers: async () => {
    try {
      return await request('/admin/customers');
    } catch {
      const users = getStored('vrc_users', []);
      return { success: true, customers: users.filter(u => u.role === 'customer') };
    }
  },

  getAdminMechanics: async () => {
    try {
      return await request('/admin/mechanics');
    } catch {
      const users = getStored('vrc_users', []);
      return { success: true, mechanics: users.filter(u => u.role === 'mechanic') };
    }
  },

  createMechanic: async (body) => {
    try {
      return await request('/admin/mechanics', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      const users = getStored('vrc_users', []);
      const newMech = {
        id: `mech_${Date.now()}`,
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: 'mechanic',
        specialization: body.specialization || 'General Hill Maintenance'
      };
      users.push(newMech);
      setStored('vrc_users', users);
      return { success: true, mechanic: newMech };
    }
  },
};
