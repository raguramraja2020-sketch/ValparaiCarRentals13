import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Car, 
  Users, 
  Calendar, 
  Wrench, 
  IndianRupee, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText,
  Clock,
  Star,
  Search,
  Check
} from 'lucide-react';

export default function AdminDashboard({ onStatusChange }) {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'vehicles', 'bookings', 'maintenance', 'customers', 'mechanics', 'feedback'
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vehicle Modal (Add / Edit)
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_name: '',
    brand: '',
    model: '',
    category: 'SUV',
    registration_number: '',
    image: '',
    seats: 5,
    fuel_type: 'Diesel',
    transmission: 'Manual',
    price_per_day: 2500,
    availability_status: 'available',
    description: '',
    mileage: 18000
  });

  // Maintenance Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    vehicle_id: '',
    mechanic_id: '',
    issue: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    priority: 'Normal'
  });

  // Add Mechanic Modal
  const [mechanicModalOpen, setMechanicModalOpen] = useState(false);
  const [mechanicForm, setMechanicForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    specialization: 'Hill Suspension & 4x4',
    experience_years: 4
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, vehRes, bkRes, mntRes, custRes, mechRes, fbRes] = await Promise.all([
        api.getDashboardStats(),
        api.getVehicles(),
        api.getAllBookings(),
        api.getMaintenance(),
        api.getAdminCustomers(),
        api.getAdminMechanics(),
        api.getAllFeedback()
      ]);

      setStats(statsRes.stats || null);
      setVehicles(vehRes.data || []);
      setBookings(bkRes.bookings || []);
      setMaintenance(mntRes.records || []);
      setCustomers(custRes.customers || []);
      setMechanics(mechRes.mechanics || []);
      setFeedback(fbRes.feedback || []);
    } catch (err) {
      addToast(err.message || 'Error loading admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Vehicle Add/Edit Handler
  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, vehicleForm);
        addToast('Vehicle updated successfully.', 'success');
      } else {
        await api.createVehicle(vehicleForm);
        addToast('Vehicle added to fleet successfully.', 'success');
      }
      setVehicleModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to save vehicle.', 'error');
    }
  };

  // Vehicle Delete Handler (With safety check)
  const handleDeleteVehicle = async (v) => {
    if (!window.confirm(`Are you sure you want to delete ${v.vehicle_name} (${v.registration_number})?`)) return;

    try {
      const res = await api.deleteVehicle(v.id);
      if (res.success) {
        addToast(res.message || 'Vehicle deleted successfully.', 'success');
        loadAllAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete vehicle. Active bookings or maintenance may exist.', 'error');
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.updateBookingStatus(bookingId, { status: newStatus });
      if (res.success) {
        addToast(`Booking status changed to ${newStatus}.`, 'success');
        loadAllAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update booking status.', 'error');
    }
  };

  // Schedule Maintenance Handler
  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    try {
      await api.scheduleMaintenance(scheduleForm);
      addToast('Vehicle assigned to mechanic and scheduled for service.', 'success');
      setScheduleModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to schedule maintenance.', 'error');
    }
  };

  // Add Mechanic Handler
  const handleAddMechanic = async (e) => {
    e.preventDefault();
    try {
      await api.createMechanic(mechanicForm);
      addToast('New mechanic account created.', 'success');
      setMechanicModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to create mechanic.', 'error');
    }
  };

  const openAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm({
      vehicle_name: '',
      brand: '',
      model: '',
      category: 'SUV',
      registration_number: '',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      seats: 5,
      fuel_type: 'Diesel',
      transmission: 'Manual',
      price_per_day: 2500,
      availability_status: 'available',
      description: 'Rugged terrain suspension and certified braking for Valparai hill roads.',
      mileage: 18000
    });
    setVehicleModalOpen(true);
  };

  const openEditVehicle = (v) => {
    setEditingVehicle(v);
    setVehicleForm({
      vehicle_name: v.vehicle_name,
      brand: v.brand,
      model: v.model,
      category: v.category,
      registration_number: v.registration_number,
      image: v.image,
      seats: v.seats,
      fuel_type: v.fuel_type,
      transmission: v.transmission,
      price_per_day: v.price_per_day,
      availability_status: v.availability_status,
      description: v.description,
      mileage: v.mileage
    });
    setVehicleModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl glass-panel p-6 md:p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Valparai Rental Cars Management Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-light">
            Monitor real-time fleet occupancy, active reservations across 40 hairpin bends, mechanic repair logs, and revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openAddVehicle}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glow transition-all"
          >
            <Wrench className="w-4 h-4" />
            Assign Service
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-4 rounded-2xl glass-card border border-white/10">
            <div className="text-[11px] text-slate-400">Total Cars</div>
            <div className="text-xl font-black text-white">{stats.totalVehicles}</div>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-emerald-500/20">
            <div className="text-[11px] text-emerald-400">Available</div>
            <div className="text-xl font-black text-emerald-300">{stats.availableVehicles}</div>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-amber-500/20">
            <div className="text-[11px] text-amber-400">Maintenance</div>
            <div className="text-xl font-black text-amber-300">{stats.maintenanceVehicles}</div>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-blue-500/20">
            <div className="text-[11px] text-blue-400">Active Trips</div>
            <div className="text-xl font-black text-blue-300">{stats.activeBookings}</div>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-purple-500/20">
            <div className="text-[11px] text-purple-400">Completed</div>
            <div className="text-xl font-black text-purple-300">{stats.completedBookings}</div>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-rose-500/20">
            <div className="text-[11px] text-rose-400">Cancelled</div>
            <div className="text-xl font-black text-rose-300">{stats.cancelledBookings}</div>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-teal-500/20">
            <div className="text-[11px] text-teal-400">Customers</div>
            <div className="text-xl font-black text-teal-300">{stats.totalCustomers}</div>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-emerald-500/40 bg-emerald-950/20">
            <div className="text-[11px] text-emerald-300 font-bold">Revenue</div>
            <div className="text-base font-black text-emerald-400">₹{stats.totalRevenue?.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-white/10 gap-4 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: ShieldCheck },
          { id: 'vehicles', label: `Fleet (${vehicles.length})`, icon: Car },
          { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Calendar },
          { id: 'maintenance', label: `Maintenance (${maintenance.length})`, icon: Wrench },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { id: 'mechanics', label: `Mechanics (${mechanics.length})`, icon: Wrench },
          { id: 'feedback', label: `Reviews (${feedback.length})`, icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs md:text-sm font-bold flex items-center gap-2 transition-all relative shrink-0 ${
                isActive ? 'text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs">Loading admin records...</p>
        </div>
      ) : (
        <>
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Recent Reservations
                </h3>
                <div className="divide-y divide-white/5 space-y-3">
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="pt-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{b.brand} {b.vehicle_name}</div>
                        <div className="text-slate-400 text-[11px]">{b.customer_name} • {b.pickup_location}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">₹{b.total_amount?.toLocaleString('en-IN')}</div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{b.booking_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Health Status */}
              <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Active Workshop Tickets
                </h3>
                <div className="divide-y divide-white/5 space-y-3">
                  {maintenance.slice(0, 5).map((m) => (
                    <div key={m.id} className="pt-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{m.vehicle_name} ({m.registration_number})</div>
                        <div className="text-slate-400 text-[11px]">{m.issue}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.maintenance_status === 'Urgent'
                            ? 'bg-rose-500/20 text-rose-300'
                            : m.maintenance_status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {m.maintenance_status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{m.mechanic_name || 'Unassigned'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. FLEET MANAGEMENT */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">All Fleet Vehicles ({vehicles.length})</h3>
                <button
                  onClick={openAddVehicle}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Car
                </button>
              </div>

              <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-black/40 text-slate-400 uppercase font-mono tracking-wider border-b border-white/10">
                      <tr>
                        <th className="p-4">Car Details</th>
                        <th className="p-4">Registration</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Specs</th>
                        <th className="p-4">Rate/Day</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {vehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={v.image} alt={v.vehicle_name} className="w-12 h-9 object-cover rounded-lg bg-slate-900" />
                            <div>
                              <div className="font-bold text-white">{v.vehicle_name}</div>
                              <div className="text-[11px] text-slate-400">{v.brand} {v.model}</div>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-400">{v.registration_number}</td>
                          <td className="p-4 uppercase">{v.category}</td>
                          <td className="p-4 text-[11px]">
                            {v.seats} Seats • {v.fuel_type} • {v.transmission}
                          </td>
                          <td className="p-4 font-black text-white">₹{v.price_per_day}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              v.availability_status === 'available'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : v.availability_status === 'maintenance'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {v.availability_status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => openEditVehicle(v)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                              title="Edit Car"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(v)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300"
                              title="Delete Car"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. BOOKINGS MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-black/40 text-slate-400 uppercase font-mono tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Dates & Route</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-white">{b.id}</td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{b.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{b.customer_phone || b.customer_email}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{b.brand} {b.vehicle_name}</div>
                          <div className="text-[11px] font-mono text-emerald-400">{b.registration_number}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-white">{b.pickup_date} → {b.return_date}</div>
                          <div className="text-[11px] text-slate-400">{b.pickup_location} ({b.number_of_days}d)</div>
                        </td>
                        <td className="p-4 font-black text-emerald-400">₹{b.total_amount?.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.booking_status === 'completed'
                              ? 'bg-blue-500/20 text-blue-300'
                              : b.booking_status === 'cancelled'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {b.booking_status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          {b.booking_status !== 'completed' && b.booking_status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold"
                              >
                                Mark Completed
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. MAINTENANCE LOG */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Workshop & Maintenance Logs</h3>
                <button
                  onClick={() => setScheduleModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Schedule Service
                </button>
              </div>

              <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-black/40 text-slate-400 uppercase font-mono tracking-wider border-b border-white/10">
                      <tr>
                        <th className="p-4">Vehicle</th>
                        <th className="p-4">Assigned Mechanic</th>
                        <th className="p-4">Issue / Service</th>
                        <th className="p-4">Scheduled Date</th>
                        <th className="p-4">Cost</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {maintenance.map((m) => (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{m.vehicle_name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{m.registration_number}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{m.mechanic_name || 'Unassigned'}</div>
                            <div className="text-[11px] text-slate-400">{m.specialization || 'Workshop Tech'}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-white">{m.issue}</div>
                            <div className="text-[11px] text-slate-400">{m.service_description}</div>
                          </td>
                          <td className="p-4 text-slate-300">{m.scheduled_date}</td>
                          <td className="p-4 font-bold text-amber-400">₹{m.service_cost}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              m.maintenance_status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : m.maintenance_status === 'Urgent'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {m.maintenance_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. CUSTOMERS DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-black/40 text-slate-400 uppercase font-mono tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Address</th>
                      <th className="p-4">Driving License</th>
                      <th className="p-4">Total Bookings</th>
                      <th className="p-4">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customers.map((c) => (
                      <tr key={c.customer_id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">{c.name}</td>
                        <td className="p-4">
                          <div>{c.email}</div>
                          <div className="text-[11px] text-slate-400">{c.phone}</div>
                        </td>
                        <td className="p-4">{c.address || 'Valparai District'}</td>
                        <td className="p-4 font-mono font-bold text-amber-400">{c.driving_license || 'Verified on Pickup'}</td>
                        <td className="p-4 font-black text-white">{c.total_bookings}</td>
                        <td className="p-4 font-black text-emerald-400">₹{c.total_spent?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. MECHANICS MANAGEMENT */}
          {activeTab === 'mechanics' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Workshop Mechanics & Technicians</h3>
                <button
                  onClick={() => setMechanicModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Mechanic Account
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mechanics.map((mech) => (
                  <div key={mech.mechanic_id} className="p-5 rounded-3xl glass-card border border-white/10 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{mech.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase">
                          {mech.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{mech.email} • {mech.phone}</div>
                      <div className="text-xs text-emerald-400 mt-2 font-medium">
                        Specialization: {mech.specialization} ({mech.experience_years} yrs exp)
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
                        <span>Pending Tickets: <strong className="text-amber-400">{mech.pending_repairs}</strong></span>
                        <span>Completed: <strong className="text-emerald-400">{mech.completed_repairs}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. CUSTOMER FEEDBACK & REVIEWS */}
          {activeTab === 'feedback' && (
            <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-black/40 text-slate-400 uppercase font-mono tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Car</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Review Comments</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {feedback.map((f) => (
                      <tr key={f.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">{f.customer_name}</td>
                        <td className="p-4 font-semibold text-slate-300">{f.brand} {f.vehicle_name}</td>
                        <td className="p-4">
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {f.rating} / 5
                          </span>
                        </td>
                        <td className="p-4 italic text-slate-300">"{f.comments}"</td>
                        <td className="p-4 text-slate-400">{new Date(f.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* VEHICLE ADD/EDIT MODAL */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl glass-panel border border-white/10 p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingVehicle ? 'Edit Vehicle Info' : 'Add New Rental Vehicle'}
              </h3>
              <button onClick={() => setVehicleModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Vehicle Name</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.vehicle_name}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_name: e.target.value })}
                    placeholder="e.g. Toyota Innova Crysta"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.brand}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                    placeholder="e.g. Toyota"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    placeholder="e.g. Crysta ZX"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.registration_number}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })}
                    placeholder="TN 41 AX 1234"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={vehicleForm.category}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="MUV">MUV</option>
                    <option value="Hatchback">Hatchback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Daily Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={vehicleForm.price_per_day}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, price_per_day: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Seats</label>
                  <input
                    type="number"
                    value={vehicleForm.seats}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, seats: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Fuel Type</label>
                  <select
                    value={vehicleForm.fuel_type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Transmission</label>
                  <select
                    value={vehicleForm.transmission}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, transmission: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Availability Status</label>
                  <select
                    value={vehicleForm.availability_status}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, availability_status: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="available">available</option>
                    <option value="booked">booked</option>
                    <option value="maintenance">maintenance</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1">Vehicle Image URL</label>
                  <input
                    type="url"
                    value={vehicleForm.image}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, image: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1">Description & Valparai Features</label>
                  <textarea
                    rows="2"
                    value={vehicleForm.description}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MAINTENANCE MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Assign Vehicle to Workshop
              </h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Vehicle</label>
                <select
                  required
                  value={scheduleForm.vehicle_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, vehicle_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="">-- Choose Car --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_name} ({v.registration_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Assign Mechanic</label>
                <select
                  value={scheduleForm.mechanic_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, mechanic_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="">-- Any Available Mechanic --</option>
                  {mechanics.map((m) => (
                    <option key={m.mechanic_id} value={m.mechanic_id}>
                      {m.name} ({m.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Issue / Maintenance Reason</label>
                <textarea
                  required
                  rows="2"
                  value={scheduleForm.issue}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, issue: e.target.value })}
                  placeholder="e.g. Brake pad wear, mountain clutch calibration, oil service"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.scheduled_date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Priority</label>
                  <select
                    value={scheduleForm.priority}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, priority: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent / Grounded</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MECHANIC MODAL */}
      {mechanicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Register Mechanic Account
              </h3>
              <button onClick={() => setMechanicModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMechanic} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Mechanic Full Name</label>
                <input
                  type="text"
                  required
                  value={mechanicForm.name}
                  onChange={(e) => setMechanicForm({ ...mechanicForm, name: e.target.value })}
                  placeholder="e.g. S. Murugesan"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={mechanicForm.email}
                  onChange={(e) => setMechanicForm({ ...mechanicForm, email: e.target.value })}
                  placeholder="mech.murugesan@valparai.com"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={mechanicForm.phone}
                  onChange={(e) => setMechanicForm({ ...mechanicForm, phone: e.target.value })}
                  placeholder="+91 94420 XXXXX"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={mechanicForm.specialization}
                  onChange={(e) => setMechanicForm({ ...mechanicForm, specialization: e.target.value })}
                  placeholder="e.g. 4x4 Hill Terrain & Suspension"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setMechanicModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Create Mechanic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
