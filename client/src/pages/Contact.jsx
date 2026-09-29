import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, ShieldCheck } from 'lucide-react';

export default function Contact() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    addToast('Message received! Our Valparai executive will call you shortly.', 'success');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12 animate-in fade-in duration-300">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
          Connect With <span className="gradient-text-emerald">Valparai Rental Cars</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-light">
          Whether you need a custom multi-day tea estate itinerary, airport pickup, or 24/7 mountain roadside towing, our team is standing by.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <h3 className="font-bold text-white text-base">Rental Hub & Dispatch Office</h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Valparai Main Office</div>
                  <div className="text-slate-400">Main Road, Near Post Office, Valparai, Tamil Nadu 642127</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">24/7 Mountain Helpline & Bookings</div>
                  <div className="text-slate-400">8667654134 / 9442410020</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Email Enquiries</div>
                  <div className="text-slate-400">valparairentals13@gmail.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Dispatch Hours</div>
                  <div className="text-slate-400">Available 24 Hours • Vehicle deliveries from 5:30 AM to 10:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 space-y-2">
            <div className="font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Emergency Ghat Road Patrol
            </div>
            <p>
              In case of tire puncture, battery drain, or mechanical issues on the Pollachi-Valparai ghat section, call our dedicated mechanic helpline for prompt roadside recovery.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 md:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Send Us an Enquiry
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Your Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Karthikeyan"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 XXXXX"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Message or Tour Requirements</label>
              <textarea
                required
                rows="4"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Ask about car availability, airport transfers from Coimbatore, or customized dates..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
