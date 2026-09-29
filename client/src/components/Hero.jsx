import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Mountain, 
  Compass, 
  Car, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function Hero({ onSearchSubmit, onExploreClick }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [location, setLocation] = useState('Valparai Town Stand');
  
  // Default to today + tomorrow
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(tomorrow);
  const [deliveryPickup, setDeliveryPickup] = useState(true);

  const tabs = [
    { id: 'daily', title: 'Daily Drives', desc: 'Short trips, upto 7 days' },
    { id: 'weekend', title: 'Weekend Escape', desc: '40 Hairpins Special' },
    { id: 'safari', title: 'Tea Safari', desc: '4x4 Offroad & Estates' },
    { id: 'airport', title: 'Airport Pickup', desc: 'Coimbatore (CJB) direct' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit({
        location,
        pickupDate,
        returnDate,
        deliveryPickup,
        tab: activeTab
      });
    }
  };

  return (
    <section className="relative pt-6 pb-20 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-emerald-600/20 via-teal-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Atmospheric Editorial Headline (Inspired by Reference 3) */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-4 animate-fade-in">
          <Mountain className="w-3.5 h-3.5 text-emerald-400" />
          <span>The 7th Heaven Of Western Ghats</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight font-display">
          Your Journey. <span className="gradient-text-emerald">Our Cars.</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-light">
          Explore Valparai with comfortable, reliable and affordable rental cars. 
          Conquer the 40 legendary hairpin bends and emerald tea estates with complete peace of mind.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExploreClick}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-glow transition-all hover:scale-105 active:scale-95"
          >
            <span>Explore Fleet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#why-choose-us"
            className="px-6 py-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-sm font-semibold transition-colors"
          >
            Why Choose Us
          </a>
        </div>
      </div>

      {/* Dynamic Tilted Polaroid Visual Cards (Inspired by Reference 1 Zoomcar) */}
      <div className="relative mb-12 hidden md:block">
        <div className="flex items-center justify-center gap-4 py-4 px-2">
          {/* Card 1: Mountain road */}
          <div className="w-60 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform -rotate-6 hover:rotate-0 transition-transform duration-300 relative group">
            <img 
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80" 
              alt="Valparai Highway" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
              <span className="text-xs font-bold text-white">40 Hairpin Bends</span>
              <span className="text-[10px] text-emerald-300">Smooth climbs & safety</span>
            </div>
          </div>

          {/* Card 2: Tea Estates */}
          <div className="w-64 h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/25 transform -rotate-2 hover:rotate-0 transition-transform duration-300 relative group -mt-4">
            <img 
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80" 
              alt="Tea Plantation Drive" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
              <span className="text-xs font-bold text-white">Stanmore Tea Estate</span>
              <span className="text-[10px] text-emerald-300">Misty mountain trails</span>
            </div>
          </div>

          {/* Card 3: Happy road trip */}
          <div className="w-64 h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/25 transform rotate-2 hover:rotate-0 transition-transform duration-300 relative group -mt-4">
            <img 
              src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80" 
              alt="4x4 Offroader" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
              <span className="text-xs font-bold text-white">Mahindra Thar 4x4</span>
              <span className="text-[10px] text-emerald-300">Unstoppable adventures</span>
            </div>
          </div>

          {/* Card 4: Sholayar Dam */}
          <div className="w-60 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform rotate-6 hover:rotate-0 transition-transform duration-300 relative group">
            <img 
              src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80" 
              alt="Valparai Scenic Drive" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
              <span className="text-xs font-bold text-white">Sholayar High Dam</span>
              <span className="text-[10px] text-emerald-300">Panoramic viewpoints</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Booking Search Widget (Inspired by Reference 1 Zoomcar) */}
      <div className="relative max-w-5xl mx-auto shadow-2xl rounded-3xl overflow-hidden border border-white/10 glass-panel">
        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-950/60 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[160px] py-3.5 px-4 text-left transition-all relative ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="text-xs font-bold">{tab.title}</div>
                <div className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {tab.desc}
                </div>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSearch} className="p-4 sm:p-6 bg-slate-900/90">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch">
            {/* City & Region */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/40 transition-colors flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pickup Region</span>
              </div>
              <div className="text-white font-bold text-sm">
                Valparai & Anamalai
              </div>
              <div className="text-[11px] text-emerald-400">Coimbatore Hills</div>
            </div>

            {/* Location Landmark */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/40 transition-colors flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pickup Location</span>
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-white font-semibold text-xs sm:text-sm focus:outline-none cursor-pointer truncate"
              >
                <option value="Valparai Town Stand" className="bg-slate-900 text-white">Valparai Town Stand</option>
                <option value="Pollachi Junction" className="bg-slate-900 text-white">Pollachi Junction</option>
                <option value="Coimbatore Airport (CJB)" className="bg-slate-900 text-white">Coimbatore Airport (CJB)</option>
                <option value="Aliyar Dam Checkpost" className="bg-slate-900 text-white">Aliyar Dam Checkpost</option>
                <option value="Stanmore Tea Estate" className="bg-slate-900 text-white">Stanmore Tea Estate</option>
                <option value="Waterfall Tea Estate" className="bg-slate-900 text-white">Waterfall Tea Estate</option>
                <option value="Sholayar Dam Gate" className="bg-slate-900 text-white">Sholayar Dam Gate</option>
              </select>
            </div>

            {/* Pickup Date */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/40 transition-colors flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trip Start Date</span>
              </div>
              <input
                type="date"
                value={pickupDate}
                min={today}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-white font-semibold text-xs sm:text-sm focus:outline-none cursor-pointer"
              />
            </div>

            {/* Return Date */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/40 transition-colors flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trip End Date</span>
              </div>
              <input
                type="date"
                value={returnDate}
                min={pickupDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-transparent text-white font-semibold text-xs sm:text-sm focus:outline-none cursor-pointer"
              />
            </div>

            {/* Search Button */}
            <div className="sm:col-span-2 lg:col-span-1 flex items-stretch">
              <button
                type="submit"
                className="w-full py-3.5 px-4 min-h-[58px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow transition-all hover:scale-[1.02] active:scale-95"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Search Cars</span>
              </button>
            </div>
          </div>

          {/* Delivery & Pickup checkbox (Zoomcar style) */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={deliveryPickup}
                onChange={(e) => setDeliveryPickup(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/30 accent-emerald-500"
              />
              <span>Doorstep Delivery & Pick-up available at hotels, resorts, & homestays</span>
            </label>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Free Cancellation up to 6 hrs
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Zero Security Deposit
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Floating Support Guide Widget ("Ask Valparai Guide" - Zoomcar inspired) */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:block">
        <button
          onClick={onExploreClick}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 text-white border border-emerald-500/30 shadow-2xl backdrop-blur-md hover:bg-emerald-950/80 transition-all hover:scale-105 group"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-glow text-slate-950 font-black text-xs">
            🌿
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white group-hover:text-emerald-300">Valparai Fleet Guide</div>
            <div className="text-[10px] text-slate-400">View 40-hairpin certified cars</div>
          </div>
        </button>
      </div>
    </section>
  );
}
