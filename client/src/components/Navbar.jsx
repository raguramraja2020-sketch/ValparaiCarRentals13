import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Car, 
  Compass, 
  CalendarCheck, 
  Info, 
  Phone, 
  User, 
  ShieldCheck, 
  Wrench, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenAuth, onOpenBookingModal }) {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'cars', label: 'Cars', icon: Car },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDashboardPageId = () => {
    if (role === 'admin') return 'admin-dashboard';
    if (role === 'mechanic') return 'mechanic-dashboard';
    return 'customer-dashboard';
  };

  return (
    <header className="sticky top-3 z-40 px-4 md:px-8 max-w-7xl mx-auto w-full transition-all">
      <nav className="glass-nav rounded-full px-5 py-2.5 flex items-center justify-between border border-white/10 shadow-2xl relative">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base md:text-lg tracking-wider text-white">
                VALPARAI
              </span>
              <span className="font-light text-base md:text-lg tracking-widest text-emerald-400">
                RENTAL CARS
              </span>
            </div>
            <p className="text-[10px] tracking-wider text-slate-400 uppercase -mt-1 hidden sm:block">
              Your Journey. Our Cars.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Capsule (Inspired by Reference 2 Rebound) */}
        <div className="hidden lg:flex items-center bg-black/50 p-1 rounded-full border border-white/10 shadow-inner">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-white/15 text-white shadow-inner border border-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right Section: Auth & Role Portals */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Dashboard Pill */}
              <button
                onClick={() => handleNavClick(getDashboardPageId())}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold tracking-wide transition-all"
              >
                {role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : role === 'mechanic' ? (
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{user?.name?.split(' ')[0] || 'Dashboard'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 uppercase font-mono">
                  {role}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Portals Selection */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Portals</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel shadow-2xl p-2 z-50 animate-in fade-in-50 duration-200">
                    <button
                      onClick={() => {
                        onOpenAuth('login', 'customer');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Customer Portal</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuth('login', 'admin');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Portal</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuth('login', 'mechanic');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Mechanic Portal</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Login Button */}
              <button
                onClick={() => onOpenAuth('login', 'customer')}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                Sign In
              </button>

              {/* CTA Book Now Button (Inspired by Reference 2 Rebound) */}
              <button
                onClick={() => handleNavClick('cars')}
                className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow transition-all hover:scale-105 active:scale-95"
              >
                Explore Cars
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full bg-white/5 text-slate-300 hover:text-white border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl glass-nav border border-white/10 shadow-2xl animate-in fade-in-50 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                    activePage === link.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  {link.label}
                </button>
              );
            })}

            <div className="border-t border-white/10 my-2 pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavClick(getDashboardPageId())}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-sm font-semibold"
                  >
                    <span>{role?.toUpperCase()} Dashboard</span>
                    <span className="text-xs text-slate-400">{user?.name}</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 text-rose-300 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onOpenAuth('login', 'customer');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-2xl bg-white/10 text-white font-semibold text-sm"
                  >
                    Customer Sign In
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('login', 'admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30"
                  >
                    Admin Portal
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('login', 'mechanic');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30"
                  >
                    Mechanic Portal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
