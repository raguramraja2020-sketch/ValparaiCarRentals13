import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { 
  Car, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Star, 
  User, 
  Clock, 
  XCircle, 
  CheckCircle, 
  Phone, 
  AlertCircle,
  ShieldCheck,
  Edit,
  Save,
  MessageSquare
} from 'lucide-react';

export default function CustomerDashboard({ onBookCarClick, onCancelBookingSuccess }) {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'payments', 'profile'
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.details?.address || '');
  const [profileLicense, setProfileLicense] = useState(user?.details?.driving_license || '');

  // Feedback Modal State
  const [feedbackModalBooking, setFeedbackModalBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        api.getMyBookings(),
        api.getMyPayments()
      ]);
      setBookings(bookingsRes.bookings || []);
      setPayments(paymentsRes.payments || []);
    } catch (err) {
      addToast(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        addToast('Booking cancelled successfully.', 'success');
        loadDashboardData();
        if (onCancelBookingSuccess) onCancelBookingSuccess();
      }
    } catch (err) {
      addToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile({
        name: profileName,
        phone: profilePhone,
        address: profileAddress,
        driving_license: profileLicense
      });
      if (res.success) {
        addToast('Profile updated successfully!', 'success');
        updateUser({
          name: profileName,
          phone: profilePhone,
          details: {
            ...user.details,
            address: profileAddress,
            driving_license: profileLicense
          }
        });
        setIsEditingProfile(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await api.submitFeedback({
        booking_id: feedbackModalBooking.id,
        rating,
        comments
      });
      if (res.success) {
        addToast('Thank you for your review!', 'success');
        setFeedbackModalBooking(null);
        setComments('');
        loadDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const activeBookingsCount = bookings.filter(b => b.booking_status === 'active' || b.booking_status === 'confirmed').length;
  const completedTripsCount = bookings.filter(b => b.booking_status === 'completed').length;
  const totalSpent = payments.reduce((sum, p) => sum + (p.payment_status === 'success' ? p.amount : 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="rounded-3xl glass-panel p-6 md:p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Customer Account</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Vanakkam, {user?.name || 'Customer'}!
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-light">
            Manage your rental reservations for Valparai hills, track trip payments, and view service details.
          </p>
        </div>

        <button
          onClick={onBookCarClick}
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          Book Another Car
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Bookings</div>
            <div className="text-2xl font-black text-white">{activeBookingsCount}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Completed Hill Trips</div>
            <div className="text-2xl font-black text-white">{completedTripsCount}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Spent</div>
            <div className="text-2xl font-black text-white">₹{totalSpent.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'bookings'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Bookings ({bookings.length})</span>
          {activeTab === 'bookings' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'payments'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment History ({payments.length})</span>
          {activeTab === 'payments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'profile'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & License</span>
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
          )}
        </button>
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs">Loading customer records...</p>
        </div>
      ) : (
        <>
          {/* 1. MY BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="p-12 text-center rounded-3xl glass-card border border-white/10">
                  <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No Bookings Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    You haven't reserved any vehicles yet. Explore our fleet of hill-certified cars!
                  </p>
                  <button
                    onClick={onBookCarClick}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    Browse Cars
                  </button>
                </div>
              ) : (
                bookings.map((booking) => {
                  const isCancelable = booking.booking_status === 'confirmed' || booking.booking_status === 'pending';
                  return (
                    <div
                      key={booking.id}
                      className="p-5 md:p-6 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={booking.image}
                          alt={booking.vehicle_name}
                          className="w-28 h-20 object-cover rounded-2xl shrink-0 bg-slate-900"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-emerald-400 font-bold">
                              {booking.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              booking.booking_status === 'completed'
                                ? 'bg-blue-500/20 text-blue-300'
                                : booking.booking_status === 'cancelled'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {booking.booking_status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              booking.payment_status === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {booking.payment_status}
                            </span>
                          </div>

                          <h3 className="font-bold text-white text-base">
                            {booking.brand} {booking.vehicle_name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              {booking.pickup_location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                              {booking.pickup_date} to {booking.return_date} ({booking.number_of_days} Days)
                            </span>
                          </div>

                          {booking.user_rating && (
                            <div className="flex items-center gap-2 pt-1 text-xs text-amber-300">
                              <span className="flex">
                                {[...Array(booking.user_rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                              </span>
                              <span className="text-slate-400 italic">"{booking.user_feedback}"</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Amount & Actions */}
                      <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                        <div className="text-left md:text-right">
                          <div className="text-xs text-slate-400">Total Rental</div>
                          <div className="text-xl font-black text-emerald-400">
                            ₹{booking.total_amount?.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {booking.booking_status === 'completed' && !booking.user_rating && (
                            <button
                              onClick={() => {
                                setFeedbackModalBooking(booking);
                                setRating(5);
                                setComments('');
                              }}
                              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5"
                            >
                              <Star className="w-3.5 h-3.5" />
                              Review Trip
                            </button>
                          )}

                          {isCancelable && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. PAYMENT HISTORY */}
          {activeTab === 'payments' && (
            <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-black/40 text-slate-400 uppercase font-mono tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Transaction Ref</th>
                      <th className="p-4">Car & Route</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500">
                          No transaction records found.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-white">{p.transaction_reference}</td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{p.vehicle_name}</div>
                            <div className="text-[11px] text-slate-400">{p.pickup_location}</div>
                          </td>
                          <td className="p-4 uppercase font-semibold text-slate-300">
                            {p.payment_method}
                          </td>
                          <td className="p-4 font-black text-emerald-400 text-sm">
                            ₹{p.amount?.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
                              {p.payment_status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">
                            {new Date(p.payment_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. PROFILE & LICENSE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl rounded-3xl glass-card border border-white/10 p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">Driver Profile Details</h3>
                  <p className="text-xs text-slate-400">Required for self-drive insurance in Valparai hills.</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email (Account ID)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    disabled={!isEditingProfile}
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Address</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Driving License Number</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profileLicense}
                    onChange={(e) => setProfileLicense(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono uppercase disabled:opacity-60"
                  />
                </div>

                {isEditingProfile && (
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-glow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </>
      )}

      {/* TRIP FEEDBACK MODAL */}
      {feedbackModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Rate Your Valparai Rental
              </h3>
              <button onClick={() => setFeedbackModalBooking(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Trip: {feedbackModalBooking.vehicle_name} ({feedbackModalBooking.pickup_location})
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-amber-400 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Your Feedback & Experience</label>
                <textarea
                  required
                  rows="3"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="How did the car handle the 40 hairpin bends? Was the pickup smooth?"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalBooking(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
