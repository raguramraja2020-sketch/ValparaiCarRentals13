import React from 'react';
import { Mountain, ShieldCheck, Heart, Award, Users, Compass } from 'lucide-react';

export default function About({ onExploreCarsClick }) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold uppercase">
          <Mountain className="w-3.5 h-3.5 text-emerald-400" />
          <span>About Valparai Rental Cars</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
          Born In The Mist of the <span className="gradient-text-emerald">Western Ghats</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
          Founded to solve a vital challenge for tourists: providing reliable, mechanically-certified rental vehicles equipped specifically for the winding 40 hairpin curves and steep climbs of the Anamalai Hills.
        </p>
      </div>

      {/* Values & Safety Standards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Hill Safety First</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unlike city rental agencies, our vehicles receive specialized mountain braking checks, coolant inspection, and tire tread depth certification after every single return.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <Users className="w-8 h-8 text-amber-400" />
          <h3 className="text-base font-bold text-white">Local Mountain Expertise</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our team comprises Valparai natives who understand forest checkpost timings, monsoon fog advisories, and the best viewpoints across Sholayar Dam and Chinnakallar.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <Award className="w-8 h-8 text-teal-400" />
          <h3 className="text-base font-bold text-white">Transparent & Academic Rigor</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Engineered as a comprehensive Software Engineering full-stack application featuring role-based portals for customers, administrators, and workshop mechanics.
          </p>
        </div>
      </div>

      {/* Valparai Travel Tips */}
      <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          Essential Driving Advice for Valparai Ghat Road
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Always honk at hairpin curves:</strong> Mountain blind turns require alert horn signals before entry.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Use engine braking (Low gear):</strong> Avoid riding the brake pedal continuously on steep descents from Valparai to Aliyar.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Checkpost Timing:</strong> Aliyar Forest Checkpost operates between 6:00 AM and 6:00 PM for private tourist entry.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Respect Wildlife:</strong> Keep distance from roaming Lion-tailed Macaques, Nilgiri Tahr, and wild elephants near Sholayar.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
