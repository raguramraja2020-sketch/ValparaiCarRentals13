-- ========================================================
-- VALPARAI RENTAL CARS - SUPABASE POSTGRESQL SCHEMA
-- Software Engineering Mini Project
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'admin', 'mechanic')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    address TEXT,
    driving_license VARCHAR(100),
    emergency_contact VARCHAR(50)
);

-- 3. MECHANICS TABLE
CREATE TABLE IF NOT EXISTS public.mechanics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    specialization VARCHAR(100),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    experience_years INTEGER DEFAULT 3
);

-- 4. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    image TEXT NOT NULL,
    seats INTEGER NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    price_per_day NUMERIC(10, 2) NOT NULL,
    availability_status VARCHAR(50) DEFAULT 'available' CHECK (availability_status IN ('available', 'booked', 'maintenance', 'retired')),
    description TEXT,
    mileage INTEGER DEFAULT 18000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    pickup_location VARCHAR(255) NOT NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    number_of_days INTEGER NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    booking_status VARCHAR(50) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('upi', 'card', 'cash', 'netbanking')),
    payment_status VARCHAR(50) NOT NULL CHECK (payment_status IN ('success', 'failed', 'pending')),
    transaction_reference VARCHAR(150) UNIQUE NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MAINTENANCE TABLE
CREATE TABLE IF NOT EXISTS public.maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    mechanic_id UUID REFERENCES public.mechanics(id) ON DELETE SET NULL,
    issue TEXT NOT NULL,
    service_description TEXT,
    service_cost NUMERIC(10, 2) DEFAULT 0.0,
    maintenance_status VARCHAR(50) DEFAULT 'Scheduled' CHECK (maintenance_status IN ('Scheduled', 'In Progress', 'Completed', 'Urgent')),
    scheduled_date DATE NOT NULL,
    completed_date DATE
);

-- 8. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_dates ON public.bookings(vehicle_id, pickup_date, return_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON public.maintenance(vehicle_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Public vehicle viewing policy
CREATE POLICY "Allow public read access to vehicles" ON public.vehicles FOR SELECT USING (true);
