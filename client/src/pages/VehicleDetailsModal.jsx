import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  X, 
  Users, 
  Fuel, 
  Gauge, 
  ShieldCheck, 
  Wrench, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Car,
  Calendar
} from 'lucide-react';

export default function VehicleDetailsModal({ vehicleId, isOpen, onClose, onBookClick }) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicleId && isOpen) {
      loadDetails();
    }
  }, [vehicleId, isOpen]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getVehicleById(vehicleId);
      if (res.success && res.data) {
        setVehicle(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div>
            <h2 className="text-xl font-black text-white">{vehicle?.vehicle_name || 'Vehicle Details'}</h2>
            <p className="text-xs text-slate-400">
              {vehicle?.brand} {vehicle?.model} • Registration: {vehicle?.registration_number}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-xs">Loading vehicle specs...</p>
            </div>
          ) : vehicle ? (
            <>
              {/* Main Image */}
              <div className="relative h-64 sm:h-72 rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-xl">
                <img
                  src={vehicle.image}
                  alt={vehicle.vehicle_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 uppercase">
                      {vehicle.category}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">{vehicle.vehicle_name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-300">Daily Rate</div>
                    <div className="text-2xl font-black text-emerald-400">
                      ₹{vehicle.price_per_day?.toLocaleString('en-IN')}
                      <span className="text-xs text-slate-400 font-normal">/day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Seating</div>
                    <div className="text-xs font-bold text-white">{vehicle.seats} Passengers</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <Fuel className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Fuel</div>
                    <div className="text-xs font-bold text-white">{vehicle.fuel_type}</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Transmission</div>
                    <div className="text-xs font-bold text-white">{vehicle.transmission}</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-400 shrink-0 fill-amber-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Rating</div>
                    <div className="text-xs font-bold text-white">{vehicle.average_rating} / 5 ({vehicle.review_count})</div>
                  </div>
                </div>
              </div>

              {/* Description & Mountain Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">Vehicle Description & Mountain Suitability</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{vehicle.description}</p>
              </div>

              {/* Certified Mountain Features */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Valparai Mountain Road Readiness
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Braking disc & brake pads inspected for 40 hairpin bends
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    High ground clearance for tea plantation rough paths
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Fog lamps and mist defoggers certified
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Spare tire & emergency puncture kit onboard
                  </div>
                </div>
              </div>

              {/* Customer Reviews for this car */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Verified Customer Reviews
                </h4>
                {vehicle.feedbacks?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No reviews yet for this vehicle. Be the first to rent and review!</p>
                ) : (
                  <div className="space-y-2.5">
                    {vehicle.feedbacks?.map((f) => (
                      <div key={f.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{f.customer_name}</span>
                          <span className="flex items-center text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 mr-1" />
                            {f.rating} / 5
                          </span>
                        </div>
                        <p className="text-slate-300 italic">"{f.comments}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
          {vehicle && (
            <button
              disabled={vehicle.availability_status === 'booked' || vehicle.availability_status === 'maintenance'}
              onClick={() => {
                onClose();
                onBookClick(vehicle);
              }}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                vehicle.availability_status === 'booked' || vehicle.availability_status === 'maintenance'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow hover:scale-105 active:scale-95'
              }`}
            >
              {vehicle.availability_status === 'maintenance'
                ? 'Under Service'
                : vehicle.availability_status === 'booked'
                ? 'Currently Booked'
                : `Book ${vehicle.vehicle_name} Now`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
