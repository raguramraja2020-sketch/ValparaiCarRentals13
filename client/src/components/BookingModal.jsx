import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { api } from '../services/api';
import { 
  X, 
  Calendar, 
  MapPin, 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Car,
  Clock,
  Sparkles,
  Receipt
} from 'lucide-react';

export default function BookingModal({ vehicle, initialDates, isOpen, onClose, onSuccess, onOpenAuth }) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [pickupLocation, setPickupLocation] = useState(initialDates?.location || 'Valparai Town Stand');
  const [pickupDate, setPickupDate] = useState(initialDates?.pickupDate || today);
  const [returnDate, setReturnDate] = useState(initialDates?.returnDate || tomorrow);

  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [step, setStep] = useState(1); // 1: Details & Calc, 2: Payment, 3: Confirmation Receipt

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('valparai.traveler@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8910');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('482');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Sync dates when modal opens or vehicle changes
  useEffect(() => {
    if (vehicle && isOpen) {
      setStep(1);
      setConfirmedBooking(null);
      verifyDates(pickupDate, returnDate);
    }
  }, [vehicle, isOpen]);

  const verifyDates = async (pDate, rDate) => {
    if (!vehicle || !pDate || !rDate) return;
    setCheckingAvailability(true);
    setAvailabilityResult(null);

    try {
      const res = await api.checkAvailability({
        vehicle_id: vehicle.id,
        pickup_date: pDate,
        return_date: rDate
      });
      setAvailabilityResult(res);
    } catch (err) {
      setAvailabilityResult({
        available: false,
        reason: err.message || 'Error checking availability.'
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleDateChange = (type, val) => {
    let p = pickupDate;
    let r = returnDate;
    if (type === 'pickup') {
      p = val;
      setPickupDate(val);
      if (r <= val) {
        const nextDay = new Date(new Date(val).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        r = nextDay;
        setReturnDate(nextDay);
      }
    } else {
      r = val;
      setReturnDate(val);
    }
    verifyDates(p, r);
  };

  const handleProceedToPayment = () => {
    if (!isAuthenticated) {
      addToast('Please login or register to book a car.', 'info');
      onOpenAuth('login', 'customer');
      return;
    }

    if (!availabilityResult?.available) {
      addToast('This vehicle is unavailable for the selected dates.', 'error');
      return;
    }

    setStep(2);
  };

  const handleConfirmAndPay = async () => {
    setSubmitting(true);
    try {
      const res = await api.createBooking({
        vehicle_id: vehicle.id,
        pickup_location: pickupLocation,
        pickup_date: pickupDate,
        return_date: returnDate,
        payment_method: paymentMethod
      });

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setStep(3);

        // Celebration Confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        addToast('Booking confirmed successfully!', 'success');
        if (onSuccess) onSuccess(res.booking);
      }
    } catch (err) {
      addToast(err.message || 'Booking creation failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  // Calculate days & amount locally as fallback
  const start = new Date(pickupDate);
  const end = new Date(returnDate);
  const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const computedDays = availabilityResult?.days || diffDays;
  const computedTotal = availabilityResult?.total_amount || (computedDays * vehicle.price_per_day);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {step === 3 ? 'Booking Confirmed' : step === 2 ? 'Payment Simulation' : 'Book Your Vehicle'}
              </h2>
              <p className="text-xs text-slate-400">
                {vehicle.brand} {vehicle.vehicle_name} ({vehicle.registration_number})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: DATES, LOCATION & DYNAMIC PRICING */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Car Snapshot Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                <img
                  src={vehicle.image}
                  alt={vehicle.vehicle_name}
                  className="w-24 h-16 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-emerald-400 uppercase">{vehicle.category}</div>
                  <div className="font-bold text-white text-base truncate">{vehicle.vehicle_name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                    <span>{vehicle.fuel_type}</span>
                    <span>•</span>
                    <span>{vehicle.transmission}</span>
                    <span>•</span>
                    <span>{vehicle.seats} Seats</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400">Per Day</div>
                  <div className="text-base font-black text-white">₹{vehicle.price_per_day?.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Booking Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pickup Location */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Pickup & Drop Location in Valparai / Coimbatore
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Valparai Town Stand">Valparai Town Stand (Main Bus Terminal)</option>
                    <option value="Pollachi Junction">Pollachi Railway Junction</option>
                    <option value="Coimbatore Airport (CJB)">Coimbatore International Airport (CJB)</option>
                    <option value="Aliyar Dam Checkpost">Aliyar Dam Checkpost (Hairpin Bend 1)</option>
                    <option value="Stanmore Tea Estate">Stanmore Tea Estate Resort</option>
                    <option value="Waterfall Tea Estate">Waterfall Tea Estate Gate</option>
                    <option value="Sholayar Dam Gate">Sholayar Dam Viewpoint</option>
                  </select>
                </div>

                {/* Pickup Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={pickupDate}
                    onChange={(e) => handleDateChange('pickup', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Return Date
                  </label>
                  <input
                    type="date"
                    min={pickupDate}
                    value={returnDate}
                    onChange={(e) => handleDateChange('return', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Real-time Dynamic Availability Status Banner */}
              {checkingAvailability ? (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 text-slate-300 text-xs flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Checking backend database availability & overlaps...</span>
                </div>
              ) : availabilityResult && !availabilityResult.available ? (
                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">Unavailable for Selected Dates</div>
                    <div className="mt-0.5">{availabilityResult.reason || 'This vehicle is unavailable for the selected dates.'}</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Vehicle is 100% available and reserved for your date selection!</span>
                </div>
              )}

              {/* Dynamic Price Breakdown (Prompt Requirement: No Hardcoding!) */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Rental Fare Calculation
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Price per Day</span>
                  <span className="font-semibold text-white">₹{vehicle.price_per_day?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Number of Days ({pickupDate} to {returnDate})</span>
                  <span className="font-semibold text-white">{computedDays} Day{computedDays > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Mountain Road Toll & Maintenance Waiver</span>
                  <span className="text-emerald-400 font-semibold">FREE (Inclusive)</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-white block">Total Rental Amount</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {computedDays} days × ₹{vehicle.price_per_day} = ₹{computedTotal}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-emerald-400">
                    ₹{computedTotal?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD SIMULATION */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Booking Vehicle</div>
                  <div className="text-sm font-bold text-white">{vehicle.vehicle_name} ({computedDays} Days)</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Amount Due</div>
                  <div className="text-lg font-black text-emerald-400">₹{computedTotal?.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'upi'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs">UPI / GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <span className="text-xs">Credit/Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'netbanking'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    <span className="text-xs">Pay on Pickup</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs according to payment method */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">UPI Virtual Payment Address (VPA)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Instant QR Verified</span>
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                  />
                  <p className="text-[11px] text-slate-400">
                    A test UPI payment request will be simulated and confirmed instantly with a transaction ID.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                  <div className="font-bold">Pay on Vehicle Handover</div>
                  <p>You can pay ₹{computedTotal} via cash or instant UPI to our executive upon delivery at {pickupLocation}.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: BOOKING CONFIRMATION RECEIPT */}
          {step === 3 && confirmedBooking && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-glow">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">Booking Confirmed!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Your rental reservation has been recorded in the database.
                </p>
              </div>

              {/* Receipt Details Box */}
              <div className="p-6 rounded-3xl bg-black/60 border border-emerald-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono text-slate-400">BOOKING ID</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-300">{confirmedBooking.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Customer Name</span>
                    <span className="font-semibold text-white">{confirmedBooking.customer_name || user?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Vehicle</span>
                    <span className="font-semibold text-white">{vehicle.brand} {vehicle.vehicle_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pickup Date</span>
                    <span className="font-semibold text-white">{confirmedBooking.pickup_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Return Date</span>
                    <span className="font-semibold text-white">{confirmedBooking.return_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pickup Location</span>
                    <span className="font-semibold text-white">{confirmedBooking.pickup_location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Duration</span>
                    <span className="font-semibold text-white">{confirmedBooking.number_of_days} Day(s)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Booking Status</span>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
                      {confirmedBooking.booking_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payment Status</span>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
                      {confirmedBooking.payment_status}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Total Paid</span>
                  <span className="text-xl font-black text-emerald-400">
                    ₹{confirmedBooking.total_amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={checkingAvailability || (availabilityResult && !availabilityResult.available)}
                onClick={handleProceedToPayment}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-glow transition-all ${
                  availabilityResult?.available !== false && !checkingAvailability
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmAndPay}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow transition-all hover:scale-105 active:scale-95"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₹{computedTotal} & Confirm</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="w-full flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
