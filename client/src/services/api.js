const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('vrc_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Vehicles
  getVehicles: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        query.append(k, v);
      }
    });
    const qs = query.toString();
    return request(`/vehicles${qs ? `?${qs}` : ''}`);
  },
  getVehicleById: (id) => request(`/vehicles/${id}`),
  createVehicle: (body) => request('/vehicles', { method: 'POST', body: JSON.stringify(body) }),
  updateVehicle: (id, body) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  // Bookings
  checkAvailability: (body) => request('/bookings/check-availability', { method: 'POST', body: JSON.stringify(body) }),
  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request('/bookings/my-bookings'),
  getBookingById: (id) => request(`/bookings/${id}`),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),
  getAllBookings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/bookings${qs ? `?${qs}` : ''}`);
  },
  updateBookingStatus: (id, body) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),

  // Payments
  processPayment: (body) => request('/payments/process', { method: 'POST', body: JSON.stringify(body) }),
  getMyPayments: () => request('/payments/my-payments'),
  getAllPayments: () => request('/payments'),

  // Maintenance
  getMaintenance: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/maintenance${qs ? `?${qs}` : ''}`);
  },
  scheduleMaintenance: (body) => request('/maintenance/schedule', { method: 'POST', body: JSON.stringify(body) }),
  updateMaintenance: (id, body) => request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  reportIssue: (body) => request('/maintenance/report-issue', { method: 'POST', body: JSON.stringify(body) }),

  // Feedback
  getPublicFeedback: () => request('/feedback/public'),
  submitFeedback: (body) => request('/feedback', { method: 'POST', body: JSON.stringify(body) }),
  getAllFeedback: () => request('/feedback'),

  // Admin
  getDashboardStats: () => request('/admin/dashboard-stats'),
  getAdminCustomers: () => request('/admin/customers'),
  getAdminMechanics: () => request('/admin/mechanics'),
  createMechanic: (body) => request('/admin/mechanics', { method: 'POST', body: JSON.stringify(body) }),
};
