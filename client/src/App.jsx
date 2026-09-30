import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cars from './pages/Cars';
import About from './pages/About';
import Contact from './pages/Contact';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MechanicDashboard from './pages/MechanicDashboard';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import VehicleDetailsModal from './pages/VehicleDetailsModal';

function MainApp() {
  const { user, isAuthenticated, role } = useAuth();
  const { addToast } = useToast();

  const [activePage, setActivePage] = useState('home');

  // Search criteria passed from Hero to Cars page
  const [searchCriteria, setSearchCriteria] = useState(null);

  const [refreshFleetKey, setRefreshFleetKey] = useState(0);
  const triggerFleetRefresh = () => setRefreshFleetKey(k => k + 1);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [authInitialRole, setAuthInitialRole] = useState('customer');

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVehicleIdForDetails, setSelectedVehicleIdForDetails] = useState(null);

  // Navigation handlers
  const handleOpenAuth = (mode = 'login', targetRole = 'customer') => {
    setAuthInitialMode(mode);
    setAuthInitialRole(targetRole);
    setAuthModalOpen(true);
  };

  const handleHeroSearchSubmit = (criteria) => {
    setSearchCriteria(criteria);
    setActivePage('cars');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookVehicle = (vehicle) => {
    setSelectedVehicleForBooking(vehicle);
    setBookingModalOpen(true);
  };

  const handleViewVehicleDetails = (vehicle) => {
    setSelectedVehicleIdForDetails(vehicle.id);
    setDetailsModalOpen(true);
  };

  const handlePageNavigation = (page) => {
    // Role protection for dashboards
    if (page === 'admin-dashboard' && role !== 'admin') {
      addToast('Admin authentication required. Please sign in as Admin.', 'info');
      handleOpenAuth('login', 'admin');
      return;
    }
    if (page === 'mechanic-dashboard' && role !== 'mechanic') {
      addToast('Mechanic portal access required. Please sign in as Mechanic.', 'info');
      handleOpenAuth('login', 'mechanic');
      return;
    }
    if (page === 'customer-dashboard' && !isAuthenticated) {
      addToast('Please sign in to view your Customer Dashboard.', 'info');
      handleOpenAuth('login', 'customer');
      return;
    }

    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Floating Capsule Navbar (Rebound & Zoomcar inspired) */}
      <Navbar
        activePage={activePage}
        setActivePage={handlePageNavigation}
        onOpenAuth={handleOpenAuth}
        onOpenBookingModal={() => handlePageNavigation('cars')}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {activePage === 'home' && (
          <Home
            onSearchSubmit={handleHeroSearchSubmit}
            onBookClick={handleBookVehicle}
            onViewDetails={handleViewVehicleDetails}
            onExploreCarsClick={() => handlePageNavigation('cars')}
            refreshKey={refreshFleetKey}
          />
        )}

        {activePage === 'cars' && (
          <Cars
            initialSearchCriteria={searchCriteria}
            onBookClick={handleBookVehicle}
            onViewDetails={handleViewVehicleDetails}
            refreshKey={refreshFleetKey}
          />
        )}

        {activePage === 'about' && (
          <About onExploreCarsClick={() => handlePageNavigation('cars')} />
        )}

        {activePage === 'contact' && <Contact />}

        {activePage === 'customer-dashboard' && (
          <CustomerDashboard 
            onBookCarClick={() => handlePageNavigation('cars')}
            onCancelBookingSuccess={triggerFleetRefresh}
          />
        )}

        {activePage === 'admin-dashboard' && (
          <AdminDashboard onStatusChange={triggerFleetRefresh} />
        )}

        {activePage === 'mechanic-dashboard' && (
          <MechanicDashboard onStatusChange={triggerFleetRefresh} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handlePageNavigation} />

      {/* MODALS */}
      {/* 1. Interactive Dynamic Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        vehicle={selectedVehicleForBooking}
        initialDates={searchCriteria}
        onClose={() => setBookingModalOpen(false)}
        onOpenAuth={handleOpenAuth}
        onSuccess={() => {
          triggerFleetRefresh();
        }}
      />

      {/* 2. Authentication Modal (Customer, Admin, Mechanic) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        initialRole={authInitialRole}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* 3. Vehicle Details Modal */}
      <VehicleDetailsModal
        isOpen={detailsModalOpen}
        vehicleId={selectedVehicleIdForDetails}
        onClose={() => setDetailsModalOpen(false)}
        onBookClick={handleBookVehicle}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
