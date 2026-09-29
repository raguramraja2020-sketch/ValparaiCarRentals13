import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Car, 
  X, 
  Check, 
  Sparkles 
} from 'lucide-react';

export default function Cars({ initialSearchCriteria, onBookClick, onViewDetails }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialSearchCriteria?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(initialSearchCriteria?.category || 'All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedTransmission, setSelectedTransmission] = useState('All');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);

  // Dates passed from hero search
  const pickupDate = initialSearchCriteria?.pickupDate || '';
  const returnDate = initialSearchCriteria?.returnDate || '';

  const categories = ['All', 'SUV', 'Sedan', 'MUV', 'Hatchback'];
  const fuels = ['All', 'Diesel', 'Petrol', 'Electric'];
  const transmissions = ['All', 'Manual', 'Automatic'];

  useEffect(() => {
    loadVehicles();
  }, [searchQuery, selectedCategory, selectedFuel, selectedTransmission, maxPrice, availabilityOnly, pickupDate, returnDate]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const params = {
        q: searchQuery,
        category: selectedCategory,
        fuel_type: selectedFuel,
        transmission: selectedTransmission,
        max_price: maxPrice,
        pickup_date: pickupDate,
        return_date: returnDate,
        availability_status: availabilityOnly ? 'available' : undefined
      };

      const res = await api.getVehicles(params);
      setVehicles(res.data || []);
    } catch (err) {
      console.error('Error loading fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedFuel('All');
    setSelectedTransmission('All');
    setMaxPrice(5000);
    setAvailabilityOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Title & Headline */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
          Our Valparai <span className="gradient-text-emerald">Rental Fleet</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 font-light">
          Every vehicle is thoroughly tested and certified for steep mountain climbs, 40 hairpin curves, and scenic tea plantation roads.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Toyota Etios, Thar 4x4, Innova, Creta..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-glow'
                    : 'bg-black/40 text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Filters (Fuel, Transmission, Price Slider) */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center text-xs">
          {/* Fuel Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Fuel Preference</label>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
            >
              {fuels.map(f => <option key={f} value={f}>{f} Engine</option>)}
            </select>
          </div>

          {/* Transmission Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Transmission</label>
            <select
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
            >
              {transmissions.map(t => <option key={t} value={t}>{t} Transmission</option>)}
            </select>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Max Daily Price</span>
              <span className="font-bold text-emerald-400">₹{maxPrice}/day</span>
            </div>
            <input
              type="range"
              min="1000"
              max="5000"
              step="200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Reset & Count */}
          <div className="flex items-center justify-between gap-2 pt-2 sm:pt-4">
            <span className="text-slate-400 text-xs">
              Showing <strong className="text-white">{vehicles.length}</strong> cars
            </span>
            <button
              onClick={handleResetFilters}
              className="text-emerald-400 hover:underline text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs">Scanning available vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-card border border-white/10 space-y-3">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Vehicles Match Your Filter Criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms, changing the maximum price per day, or resetting all filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow"
          >
            Show All Fleet Cars
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onBookClick={onBookClick}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
