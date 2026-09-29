import React from 'react';
import { Users, Fuel, Gauge, Zap, ShieldCheck, Wrench, Calendar, Check, AlertCircle } from 'lucide-react';

export default function VehicleCard({ vehicle, onBookClick, onViewDetails }) {
  const isMaintenance = vehicle.availability_status === 'maintenance' || vehicle.has_active_maintenance;
  const isBooked = vehicle.availability_status === 'booked' || !!vehicle.active_booking;
  const isAvailable = !isMaintenance && !isBooked && (vehicle.is_available_for_dates !== false);

  return (
    <div className="group rounded-3xl glass-card border border-white/10 overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between">
      <div>
        {/* Image & Badges */}
        <div className="relative h-48 overflow-hidden bg-slate-900">
          <img
            src={vehicle.image}
            alt={vehicle.vehicle_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

          {/* Category Tag */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold uppercase tracking-wider">
            {vehicle.category}
          </span>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {isMaintenance ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold backdrop-blur-md">
                <Wrench className="w-3 h-3" /> Workshop / Maint.
              </span>
            ) : isBooked ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold backdrop-blur-md">
                <AlertCircle className="w-3 h-3" /> Currently Booked
              </span>
            ) : isAvailable ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold backdrop-blur-md">
                <AlertCircle className="w-3 h-3" /> Booked For Dates
              </span>
            )}
          </div>

          {/* Registration Number Watermark */}
          <span className="absolute bottom-2 right-3 text-[11px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
            {vehicle.registration_number}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {vehicle.brand}
              </span>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                {vehicle.vehicle_name}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Daily Rate</div>
              <div className="text-lg font-black text-white">
                ₹{vehicle.price_per_day?.toLocaleString('en-IN')}
                <span className="text-xs text-slate-400 font-normal">/day</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {vehicle.description}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/30 border border-white/5">
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{vehicle.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/30 border border-white/5">
              <Fuel className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{vehicle.fuel_type}</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/30 border border-white/5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{vehicle.transmission}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-3">
        <button
          onClick={() => onViewDetails(vehicle)}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
        >
          View Details
        </button>
        <button
          disabled={!isAvailable || isMaintenance || isBooked}
          onClick={() => onBookClick(vehicle)}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
            isAvailable && !isMaintenance && !isBooked
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {isMaintenance ? 'Under Service' : isBooked ? 'Currently Booked' : isAvailable ? 'Book Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
