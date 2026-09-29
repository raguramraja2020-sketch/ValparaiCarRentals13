import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import VehicleCard from '../components/VehicleCard';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Car, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Award, 
  Compass, 
  Mountain, 
  Star, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  Check,
  Zap
} from 'lucide-react';

export default function Home({ onSearchSubmit, onBookClick, onViewDetails, onExploreCarsClick }) {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [vehRes, testRes] = await Promise.all([
          api.getVehicles(),
          api.getPublicFeedback()
        ]);
        setFeaturedVehicles(vehRes.data?.slice(0, 6) || []);
        setTestimonials(testRes.feedback || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION & FLOATING BOOKING SEARCH */}
      <Hero 
        onSearchSubmit={onSearchSubmit} 
        onExploreClick={onExploreCarsClick} 
      />

      {/* 2. WHY CHOOSE US */}
      <section id="why-choose-us" className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Valparai Certified Standard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            Why Rent With <span className="gradient-text-emerald">Valparai Rental Cars?</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-light">
            Driving in high-altitude mountain terrain requires specialized vehicles, experienced mechanics, and transparent pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-glow">
              <Mountain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">40 Hairpin Certified</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every car undergoes rigorous pre-trip brake caliper, suspension, and radiator cooling tests by our certified mechanics.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 shadow-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Zero Security Deposit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent digital bookings. No hidden fees or steep upfront security deposits holding your vacation funds.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-glow">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Doorstep Resort Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We deliver your car to Coimbatore Airport, Pollachi station, or directly to your tea estate resort in Valparai.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 shadow-glow">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">24/7 Ghat Road Helpline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rapid mobile breakdown patrol stationed between Pollachi and Valparai to ensure your mountain safety at all hours.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED VEHICLES */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Car className="w-3.5 h-3.5" />
              <span>Handpicked Mountain Explorers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Featured Rental Vehicles
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-light">
              Choose from sedans, 4x4 rugged offroaders, and luxury 7-seaters.
            </p>
          </div>

          <button
            onClick={onExploreCarsClick}
            className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View All Cars ({featuredVehicles.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs">Loading fleet cars...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onBookClick={onBookClick}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="p-8 md:p-12 rounded-3xl glass-panel border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              How Simple Is <span className="gradient-text-emerald">Renting In Valparai?</span>
            </h2>
            <p className="text-xs text-slate-300 mt-2">
              From online reservation to hill station cruising in 4 effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Vehicle',
                desc: 'Pick your preferred hatchback, sedan, 4x4 Thar, or 7-seater Innova.'
              },
              {
                step: '02',
                title: 'Select Dates & Location',
                desc: 'Select pickup point (Airport, Pollachi, or Valparai Bus Stand) and dates.'
              },
              {
                step: '03',
                title: 'Instant Confirmation',
                desc: 'Automatic fare calculation, real-time availability check, and instant receipt.'
              },
              {
                step: '04',
                title: 'Drive The Hills',
                desc: 'Receive keys from our friendly executive and enjoy the 40 hairpin bends!'
              }
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-2xl bg-black/40 border border-white/5 relative">
                <span className="text-3xl font-black font-mono text-emerald-500/30 block mb-2">{s.step}</span>
                <h4 className="text-sm font-bold text-white mb-1">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY VALPARAI - HILL HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Mountain className="w-3.5 h-3.5" />
              <span>Explore Anamalai Tiger Reserve & Valparai</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight font-display">
              The 40 Hairpin Bends of <span className="gradient-text-emerald">Pure Serenity</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Nestled at 3,500 feet above sea level, Valparai is an emerald sanctuary wrapped in tea estates, rainforests, and wild streams. 
              The route from Pollachi features 40 iconic hairpin bends offering panoramic vistas of Aliyar Dam, roaming Lion-tailed Macaques, and Nilgiri Tahr.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="font-bold text-white">Sholayar Dam</div>
                <div className="text-[11px] text-slate-400">Asia's 2nd deepest reservoir</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="font-bold text-white">Nallamudi Viewpoint</div>
                <div className="text-[11px] text-slate-400">Valley drops & waterfalls</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="font-bold text-white">Chinnakallar</div>
                <div className="text-[11px] text-slate-400">Wettest region in South India</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="font-bold text-white">Balaji Temple & Estates</div>
                <div className="text-[11px] text-slate-400">Private misty plantation roads</div>
              </div>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
            <img
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80"
              alt="Valparai Hairpin Bends"
              className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-xs font-semibold text-emerald-400 uppercase">Valparai Scenic Drive</div>
              <div className="text-xl font-bold text-white">Toyota Etios & Mahindra Thar on Ghat Road</div>
              <p className="text-xs text-slate-300 mt-1">
                Conquer hairpins 1 to 40 with confident handling and high safety standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Real Stories from <span className="gradient-text-emerald">Valparai Travelers</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Read how our certified rental cars made road trips seamless and memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{t.customer_name}</h4>
                    <span className="text-[11px] text-emerald-400">Rented: {t.brand} {t.vehicle_name}</span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{t.comments}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight font-display max-w-xl mx-auto">
            Ready to Explore the Whispering Hills of Valparai?
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-light">
            Book now with zero deposit, free cancellation, and guaranteed delivery to your doorstep.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={onExploreCarsClick}
              className="px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-glow transition-all hover:scale-105 active:scale-95"
            >
              Choose Your Car
            </button>
            <a
              href="tel:8667654134"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Call Helpline (8667654134)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
