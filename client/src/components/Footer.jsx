import React from 'react';
import { Car, MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl pt-16 pb-12 mt-20 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Description */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-glow">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wider">VALPARAI</span>{' '}
              <span className="font-light text-emerald-400 text-base">RENTAL CARS</span>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed font-light">
            "Your Journey. Our Cars." The premier self-drive and chauffeur car rental platform designed specifically for the picturesque curves of Valparai and Anamalai Hills.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>40 Hairpin Bends Certified Fleet</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase">Navigation</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                Home Page
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('cars')} className="hover:text-emerald-400 transition-colors">
                Browse Rental Cars
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors">
                About Valparai Hills
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">
                Emergency Assistance & Contact
              </button>
            </li>
          </ul>
        </div>

        {/* Popular Pickup Hubs */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase">Pickup Points</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Valparai Main Bus Stand</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pollachi Railway Junction</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Coimbatore Airport (CJB)</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Aliyar Checkpost / Stanmore Estate</span>
            </li>
          </ul>
        </div>

        {/* 24/7 Roadside Support */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase">24/7 Mountain Helpline</h4>
          <p className="text-slate-400 text-xs">
            Traveling on the ghat road and need mechanical or towing assistance?
          </p>
          <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>8667654134, 9442410020</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>valparairentals13@gmail.com</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Head Office: Main Road, Near Post Office, Valparai, Tamil Nadu 642127
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          © 2026 VALPARAI RENTAL CARS. Software Engineering Project. All rights reserved.
        </div>
        <div className="flex items-center gap-1">
          <span>Engineered with passion for Valparai travelers</span>
        </div>
      </div>
    </footer>
  );
}
