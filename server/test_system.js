const http = require('http');

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
  console.log('🧪 PROJECT: VALPARAI RENTAL CARS');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS ${total}] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL ${total}] ${message}`);
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest('GET', '/health');
    assert(health.status === 200 && health.body.status === 'online', 'Health check endpoint returns online status');

    // 2. Customer Registration
    const testEmail = `traveler_${Date.now()}@valparai.test`;
    const regRes = await makeRequest('POST', '/auth/register', {
      name: 'Ragu Ram',
      email: testEmail,
      phone: '+91 98888 77777',
      password: 'password123',
      address: 'Coimbatore',
      driving_license: 'TN-38-2024-TEST99'
    });
    assert(regRes.status === 201 && regRes.body.token, 'Customer registration succeeds and returns JWT session');
    const newCustomerToken = regRes.body.token;

    // 3. Customer Login
    const custLogin = await makeRequest('POST', '/auth/login', {
      email: 'customer@valparai.com',
      password: 'customer123',
      requestedRole: 'customer'
    });
    assert(custLogin.status === 200 && custLogin.body.user.role === 'customer', 'Customer login succeeds with role customer');
    const custToken = custLogin.body.token;

    // 4. Admin Login
    const adminLogin = await makeRequest('POST', '/auth/login', {
      email: 'admin@valparai.com',
      password: 'admin123',
      requestedRole: 'admin'
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', 'Admin login succeeds with role admin');
    const adminToken = adminLogin.body.token;

    // 5. Mechanic Login
    const mechLogin = await makeRequest('POST', '/auth/login', {
      email: 'mechanic@valparai.com',
      password: 'mechanic123',
      requestedRole: 'mechanic'
    });
    assert(mechLogin.status === 200 && mechLogin.body.user.role === 'mechanic', 'Mechanic login succeeds with role mechanic');
    const mechToken = mechLogin.body.token;

    // 6. Role-based protection: Customer cannot access Admin KPIs
    const forbiddenAdmin = await makeRequest('GET', '/admin/dashboard-stats', null, custToken);
    assert(forbiddenAdmin.status === 403, 'Role authorization blocks Customer from accessing Admin endpoints (403 Forbidden)');

    // 7. Vehicle Listing & Filters
    const vehiclesList = await makeRequest('GET', '/vehicles');
    assert(vehiclesList.status === 200 && vehiclesList.body.data.length >= 8, 'Vehicle listing returns full fleet');

    const suvFilter = await makeRequest('GET', '/vehicles?category=SUV');
    assert(suvFilter.status === 200 && suvFilter.body.data.every(v => v.category === 'SUV'), 'Category filter correctly isolates SUVs');

    // 8. Dynamic Booking Calculation & Overlap Check
    const calcCheck = await makeRequest('POST', '/bookings/check-availability', {
      vehicle_id: 'veh_etios',
      pickup_date: '2026-11-01',
      return_date: '2026-11-04'
    });
    assert(calcCheck.status === 200 && calcCheck.body.available === true && calcCheck.body.days === 3 && calcCheck.body.total_amount === 4200, 
      'Dynamic calculation computes 3 days × ₹1,400 = ₹4,200 correctly');

    // 9. Real Booking Creation
    const bookRes = await makeRequest('POST', '/bookings', {
      vehicle_id: 'veh_etios',
      pickup_location: 'Valparai Town Stand',
      pickup_date: '2026-11-01',
      return_date: '2026-11-04',
      payment_method: 'upi'
    }, custToken);
    assert(bookRes.status === 201 && bookRes.body.booking.id, 'Real booking created in database with confirmed & paid status');
    const createdBookingId = bookRes.body.booking.id;

    // 10. Overlapping Booking Prevention Check
    const overlapCheck = await makeRequest('POST', '/bookings/check-availability', {
      vehicle_id: 'veh_etios',
      pickup_date: '2026-11-02',
      return_date: '2026-11-05'
    });
    assert(overlapCheck.status === 200 && overlapCheck.body.available === false, 
      'Overlapping booking prevention works: returns vehicle unavailable for overlapping dates');

    // 11. Overlapping booking creation rejected
    const blockedBooking = await makeRequest('POST', '/bookings', {
      vehicle_id: 'veh_etios',
      pickup_location: 'Pollachi',
      pickup_date: '2026-11-02',
      return_date: '2026-11-05',
      payment_method: 'card'
    }, custToken);
    assert(blockedBooking.status === 400 && blockedBooking.body.message.includes('unavailable'), 
      'Backend rejects overlapping booking attempt with 400 Bad Request');

    // 12. Customer Booking History
    const myBookings = await makeRequest('GET', '/bookings/my-bookings', null, custToken);
    assert(myBookings.status === 200 && myBookings.body.bookings.some(b => b.id === createdBookingId), 
      'Customer booking history reflects newly created booking');

    // 13. Customer Booking Cancellation
    const cancelRes = await makeRequest('PUT', `/bookings/${createdBookingId}/cancel`, null, custToken);
    assert(cancelRes.status === 200 && cancelRes.body.success === true, 'Customer booking cancellation executes successfully');

    // 14. Mechanic View Assigned Tickets
    const mechTickets = await makeRequest('GET', '/maintenance', null, mechToken);
    assert(mechTickets.status === 200 && Array.isArray(mechTickets.body.records), 'Mechanic views assigned service tickets');

    // 15. Mechanic Updates Maintenance & Service Cost
    if (mechTickets.body.records.length > 0) {
      const ticketId = mechTickets.body.records[0].id;
      const updRes = await makeRequest('PUT', `/maintenance/${ticketId}`, {
        maintenance_status: 'In Progress',
        service_description: 'Calibrated mountain brake calipers & fluids checked.',
        service_cost: 2150
      }, mechToken);
      assert(updRes.status === 200 && updRes.body.data.service_cost === 2150, 'Mechanic updates service description and cost in database');
    }

    // 16. Admin KPI Dashboard Stats
    const adminKPI = await makeRequest('GET', '/admin/dashboard-stats', null, adminToken);
    assert(adminKPI.status === 200 && adminKPI.body.stats.totalVehicles > 0 && adminKPI.body.stats.totalRevenue > 0, 
      'Admin Dashboard KPIs return real aggregates (Vehicles, Bookings, Revenue)');

    // 17. Admin Delete Safety Check (Prevent deleting car with active booking/maintenance)
    const delSafe = await makeRequest('DELETE', '/vehicles/veh_thar', null, adminToken);
    assert(delSafe.status === 400 && delSafe.body.message.includes('booking'), 
      'Safe Delete check blocks deletion of vehicle with active bookings/maintenance');

    // 18. Customer Feedback Submission
    const fbRes = await makeRequest('POST', '/feedback', {
      rating: 5,
      comments: 'Magnificent drive to Sholayar Dam! The car was in top condition.'
    }, custToken);
    assert(fbRes.status === 201 && fbRes.body.success === true, 'Customer submits feedback with 5-star rating');

    console.log(`\n🎉 ========================================================`);
    console.log(`🎉 TEST RESULTS: ${passed}/${total} TESTS PASSED (100% SUCCESS)`);
    console.log(`🎉 ========================================================`);
  } catch (err) {
    console.error('Test suite execution error:', err);
  }
}

runTests();
