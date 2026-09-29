import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { 
  Wrench, 
  Car, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  IndianRupee, 
  Plus, 
  Calendar,
  Check,
  XCircle,
  ShieldCheck,
  Gauge
} from 'lucide-react';

export default function MechanicDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Update Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('In Progress');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCost, setServiceCost] = useState(0);

  // Report Issue Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportVehicleId, setReportVehicleId] = useState('');
  const [reportIssueText, setReportIssueText] = useState('');
  const [reportPriority, setReportPriority] = useState('Urgent');
  const [reportEstCost, setReportEstCost] = useState(1500);

  useEffect(() => {
    loadMechanicData();
  }, []);

  const loadMechanicData = async () => {
    setLoading(true);
    try {
      const [mntRes, vehRes] = await Promise.all([
        api.getMaintenance(),
        api.getVehicles()
      ]);
      setRecords(mntRes.records || []);
      setVehicles(vehRes.data || []);
    } catch (err) {
      addToast(err.message || 'Error loading mechanic records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.maintenance_status);
    setServiceDescription(ticket.service_description || '');
    setServiceCost(ticket.service_cost || 0);
  };

  const handleSaveTicketUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateMaintenance(selectedTicket.id, {
        maintenance_status: updateStatus,
        service_description: serviceDescription,
        service_cost: Number(serviceCost),
        completed_date: updateStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null
      });

      if (res.success) {
        addToast(
          updateStatus === 'Completed'
            ? 'Service completed! Vehicle availability has been restored to available.'
            : 'Maintenance progress updated.',
          'success'
        );
        setSelectedTicket(null);
        loadMechanicData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update ticket.', 'error');
    }
  };

  const handleReportNewIssue = async (e) => {
    e.preventDefault();
    try {
      const res = await api.reportIssue({
        vehicle_id: reportVehicleId,
        issue: reportIssueText,
        priority: reportPriority,
        estimated_cost: Number(reportEstCost)
      });

      if (res.success) {
        addToast('Technical issue logged. Vehicle status set to maintenance.', 'success');
        setReportModalOpen(false);
        setReportVehicleId('');
        setReportIssueText('');
        loadMechanicData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to report issue.', 'error');
    }
  };

  // KPIs
  const pendingRepairs = records.filter(r => r.maintenance_status === 'Scheduled').length;
  const inProgress = records.filter(r => r.maintenance_status === 'In Progress').length;
  const urgentTickets = records.filter(r => r.maintenance_status === 'Urgent').length;
  const completedCount = records.filter(r => r.maintenance_status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl glass-panel p-6 md:p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>Valparai Hill Workshop Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Technician Dashboard: {user?.name}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-light">
            Keep the mountain fleet safe for the 40 hairpin bends. Update brake calibrations, engine checks, and completed repairs.
          </p>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Report Inspection Issue
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-rose-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-semibold">Urgent Repairs</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 mt-2">{urgentTickets}</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-semibold">Under Service</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">{inProgress}</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-300 font-semibold">Scheduled</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400 mt-2">{pendingRepairs}</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-semibold">Completed Repairs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{completedCount}</div>
        </div>
      </div>

      {/* Maintenance Tickets List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white">Assigned Service Tickets ({records.length})</h3>
          <span className="text-xs text-slate-400">Syncs directly with customer vehicle availability</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs">Loading workshop records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((ticket) => (
              <div
                key={ticket.id}
                className="p-5 rounded-3xl glass-card border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={ticket.image}
                        alt={ticket.vehicle_name}
                        className="w-14 h-12 object-cover rounded-xl bg-slate-900 shrink-0"
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{ticket.brand} {ticket.vehicle_name}</div>
                        <div className="text-xs font-mono text-cyan-400">{ticket.registration_number}</div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      ticket.maintenance_status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : ticket.maintenance_status === 'Urgent'
                        ? 'bg-rose-500/20 text-rose-300'
                        : ticket.maintenance_status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {ticket.maintenance_status}
                    </span>
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                      Issue: {ticket.issue}
                    </div>
                    {ticket.service_description && (
                      <p className="text-slate-400 text-[11px]">
                        Service Log: {ticket.service_description}
                      </p>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <span>Date: {ticket.scheduled_date}</span>
                      <span className="font-bold text-amber-400">Service Cost: ₹{ticket.service_cost}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleOpenUpdateModal(ticket)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all"
                  >
                    Update Service & Cost
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPDATE TICKET MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Update Service Ticket</h3>
                <p className="text-xs text-slate-400">{selectedTicket.vehicle_name} ({selectedTicket.registration_number})</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTicketUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Maintenance Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress (Under Repair)</option>
                  <option value="Completed">Completed (Ready for Rental)</option>
                  <option value="Urgent">Urgent / Grounded</option>
                </select>
                {updateStatus === 'Completed' && (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    ✓ Marking completed will immediately make this car available for customer booking.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Service Description / Work Done</label>
                <textarea
                  rows="3"
                  required
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Detail parts replaced, brake inspection notes, fluids changed..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Total Service & Parts Cost (₹)</label>
                <input
                  type="number"
                  value={serviceCost}
                  onChange={(e) => setServiceCost(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-glow"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT NEW ISSUE MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Report Vehicle Defect
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportNewIssue} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Inspected Car</label>
                <select
                  required
                  value={reportVehicleId}
                  onChange={(e) => setReportVehicleId(e.target.value)}
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
                <label className="block text-slate-300 mb-1">Discovered Issue / Defect</label>
                <textarea
                  required
                  rows="3"
                  value={reportIssueText}
                  onChange={(e) => setReportIssueText(e.target.value)}
                  placeholder="e.g. Brake vibration on steep descent, tire tread worn below safe limit"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Severity</label>
                  <select
                    value={reportPriority}
                    onChange={(e) => setReportPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    <option value="Urgent">Urgent / Ground Car</option>
                    <option value="Normal">In Progress</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={reportEstCost}
                    onChange={(e) => setReportEstCost(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold"
                >
                  Log & Ground Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
