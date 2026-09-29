# VALPARAI RENTAL CARS
> **"Your Journey. Our Cars."**  
> *A Modern Full-Stack Car Rental Management System for Valparai & Anamalai Hills*  
> *Software Engineering Mini Project*

---

## 🌟 Executive Overview
**VALPARAI RENTAL CARS** is an enterprise-grade, full-stack car rental platform specifically tailored for mountain driving through the 40 legendary hairpin bends, misty tea plantations, and scenic viewpoints of Valparai, Tamil Nadu.

### 🎨 Visual Design Inspiration
- **Zoomcar-Style Elevated Booking Bar:** Multi-mode tab navigation (`Daily Drives`, `Weekend Escape`, `Tea Safari`, `Airport Pickup`), location selector, live calendar pickers, instant price calculation, and doorstep delivery toggles.
- **Rebound Dark Capsule Navigation:** Ultra-sleek floating glassmorphism navbar (`glass-nav`), active pill states, 1-click demo role switcher, and quick action buttons.
- **Atmospheric Editorial Hero:** Confident typography, misty tea estate backdrops, and 40-hairpin certified mountain fleet showcase.

---

## 👥 Three Dedicated User Roles

| Role | Default Email | Password | Dashboard Features & Capabilities |
| :--- | :--- | :--- | :--- |
| **CUSTOMER** | `customer@valparai.com` | `customer123` | Browse fleet, live search/filters, dynamic booking calculation (`days × rate`), overlap prevention, payment simulation (UPI/Card/Cash), booking receipts, cancellation, profile editing, and trip reviews. Can create new accounts. |
| **ADMIN** | `valparairentals13@gmail.com` | `admin123` | **Single Built-in Administrator.** Full executive dashboard, KPI statistics, complete fleet CRUD with active booking protection, booking status updates, vehicle-to-mechanic assignment, and revenue analytics. Account creation disabled. |
| **MECHANIC** | `mechanic@valparai.com` | `mechanic123` | Specialized workshop dashboard, assigned repair tickets, service logs, repair cost tracking, status updates (`Scheduled`, `In Progress`, `Completed`, `Urgent`), defect reporting, and automatic vehicle availability synchronization. |

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework:** React 18 + Vite (Blazing fast HMR)
- **Styling:** Tailwind CSS with custom Valparai color palette (Deep Emerald `#059669`, Mountain Mist, Obsidian Black)
- **Icons:** Lucide React
- **Celebration Animations:** Canvas Confetti

### Backend
- **Runtime:** Node.js (v26 LTS)
- **Framework:** Express.js RESTful API architecture
- **Database:** Native high-performance relational SQLite (`node:sqlite` DatabaseSync) with zero external setup friction. Also includes ready-to-run Supabase PostgreSQL schema (`supabase_schema.sql`).
- **Security:** JSON Web Tokens (JWT), `bcryptjs` password hashing, and server-side role-based authorization middleware.

---

## 🗄️ Relational Database Schema

```
USERS
  ├── id (PK, TEXT)
  ├── name (TEXT)
  ├── email (UNIQUE, TEXT)
  ├── phone (TEXT)
  ├── password_hash (TEXT)
  ├── role ('customer' | 'admin' | 'mechanic')
  └── created_at (TEXT)

CUSTOMERS
  ├── id (PK, TEXT)
  ├── user_id (FK -> USERS.id, CASCADE)
  ├── address (TEXT)
  ├── driving_license (TEXT)
  └── emergency_contact (TEXT)

MECHANICS
  ├── id (PK, TEXT)
  ├── user_id (FK -> USERS.id, CASCADE)
  ├── specialization (TEXT)
  ├── phone (TEXT)
  ├── status (TEXT)
  └── experience_years (INTEGER)

VEHICLES
  ├── id (PK, TEXT)
  ├── vehicle_name (TEXT)
  ├── brand (TEXT)
  ├── model (TEXT)
  ├── category ('SUV' | 'Sedan' | 'MUV' | 'Hatchback')
  ├── registration_number (UNIQUE, TEXT)
  ├── image (TEXT)
  ├── seats (INTEGER)
  ├── fuel_type ('Petrol' | 'Diesel' | 'Electric')
  ├── transmission ('Manual' | 'Automatic')
  ├── price_per_day (REAL)
  ├── availability_status ('available' | 'booked' | 'maintenance' | 'retired')
  ├── description (TEXT)
  ├── mileage (INTEGER)
  └── created_at (TEXT)

BOOKINGS
  ├── id (PK, TEXT)
  ├── customer_id (FK -> CUSTOMERS.id, RESTRICT)
  ├── vehicle_id (FK -> VEHICLES.id, RESTRICT)
  ├── pickup_location (TEXT)
  ├── pickup_date (TEXT)
  ├── return_date (TEXT)
  ├── number_of_days (INTEGER)
  ├── total_amount (REAL)  -- (days * price_per_day)
  ├── booking_status ('pending' | 'confirmed' | 'active' | 'completed' | 'cancelled')
  ├── payment_status ('pending' | 'paid' | 'refunded')
  └── created_at (TEXT)

PAYMENTS
  ├── id (PK, TEXT)
  ├── booking_id (FK -> BOOKINGS.id, CASCADE)
  ├── customer_id (FK -> CUSTOMERS.id, RESTRICT)
  ├── amount (REAL)
  ├── payment_method ('upi' | 'card' | 'cash' | 'netbanking')
  ├── payment_status ('success' | 'failed' | 'pending')
  ├── transaction_reference (UNIQUE, TEXT)
  └── payment_date (TEXT)

MAINTENANCE
  ├── id (PK, TEXT)
  ├── vehicle_id (FK -> VEHICLES.id, RESTRICT)
  ├── mechanic_id (FK -> MECHANICS.id, SET NULL)
  ├── issue (TEXT)
  ├── service_description (TEXT)
  ├── service_cost (REAL)
  ├── maintenance_status ('Scheduled' | 'In Progress' | 'Completed' | 'Urgent')
  ├── scheduled_date (TEXT)
  └── completed_date (TEXT)

FEEDBACK
  ├── id (PK, TEXT)
  ├── customer_id (FK -> CUSTOMERS.id, CASCADE)
  ├── booking_id (FK -> BOOKINGS.id, SET NULL)
  ├── rating (INTEGER, 1 to 5)
  ├── comments (TEXT)
  └── created_at (TEXT)
```

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Role-aware login for Customer, Admin, or Mechanic
- `GET /api/auth/me` - Retrieve current authenticated profile
- `PUT /api/auth/profile` - Update customer address / driving license / phone

### Vehicles Fleet (`/api/vehicles`)
- `GET /api/vehicles` - List vehicles with filters (category, fuel, transmission, price, date overlap)
- `GET /api/vehicles/:id` - Vehicle details with customer reviews and maintenance logs
- `POST /api/vehicles` - [Admin] Add vehicle to fleet
- `PUT /api/vehicles/:id` - [Admin] Update vehicle specifications and pricing
- `DELETE /api/vehicles/:id` - [Admin] Safe delete (checks for active bookings/maintenance)

### Bookings (`/api/bookings`)
- `POST /api/bookings/check-availability` - Real-time date overlap check and dynamic fare calculation
- `POST /api/bookings` - Create reservation with dynamic days calculation and payment record
- `GET /api/bookings/my-bookings` - Customer's booking history
- `GET /api/bookings/:id` - Single booking details
- `PUT /api/bookings/:id/cancel` - Cancel active booking
- `GET /api/bookings` - [Admin] Manage all fleet bookings
- `PUT /api/bookings/:id/status` - [Admin] Update booking status (confirmed, completed, cancelled)

### Payments (`/api/payments`)
- `POST /api/payments/process` - Simulate UPI, Card, Net Banking, or Cash payment
- `GET /api/payments/my-payments` - Customer transaction receipts
- `GET /api/payments` - [Admin] All payments and revenue analytics

### Maintenance & Workshop (`/api/maintenance`)
- `GET /api/maintenance` - View service tickets (Mechanic sees assigned; Admin sees all)
- `POST /api/maintenance/schedule` - [Admin] Assign vehicle to mechanic
- `PUT /api/maintenance/:id` - [Mechanic/Admin] Update service status, parts cost, and mark completed
- `POST /api/maintenance/report-issue` - [Mechanic] Report defect from inspection and ground vehicle

### Customer Feedback (`/api/feedback`)
- `GET /api/feedback/public` - Top customer testimonials for homepage
- `POST /api/feedback` - Submit trip rating and review
- `GET /api/feedback` - [Admin] Review moderation table

### Admin Management (`/api/admin`)
- `GET /api/admin/dashboard-stats` - Real-time KPIs (Fleet count, occupancy, revenue, active trips)
- `GET /api/admin/customers` - Customer directory with total bookings and expenditure
- `GET /api/admin/mechanics` - Workshop technician directory with active/completed tickets
- `POST /api/admin/mechanics` - Register new mechanic account

---

## 🚀 How to Run the Project Locally

### 1. Prerequisites
- **Node.js** (v18, v20, v22, or v26+)
- **npm** (comes with Node.js)

### 2. Quick Start
From the project root (`D:\rental(anti)`):

```bash
# Seed the database with realistic fleet, accounts, and bookings
npm run seed

# Start both Backend API Server and Frontend Client concurrently
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Run Automated System Tests
To demonstrate the complete test suite to examiners:
```bash
node server/test_system.js
```
*Executes 19 comprehensive tests validating registration, role permissions, dynamic pricing, overlap prevention, cancellations, maintenance status synchronization, and safe deletion.*

---

## 🔑 Login Credentials & Support Contacts
- **👑 Single Built-in Admin Portal:**
  - **Email:** `valparairentals13@gmail.com` (or `admin@valparai.com`)
  - **Password:** `admin123`
  - *(Note: Account creation for Admin is strictly disabled)*

- **🔧 Mechanic Portal:**
  - **Email:** `mechanic@valparai.com`
  - **Password:** `mechanic123`

- **🚗 Customer Portal:**
  - **Email:** `customer@valparai.com` (or create any new user account)
  - **Password:** `customer123`

- **📞 Helplines:** `8667654134`, `9442410020`
- **✉️ Email:** `valparairentals13@gmail.com`

*(Tip: In the navbar, click "Demo Roles" for 1-click instant login into any portal without typing!)*

---

## ☁️ Supabase PostgreSQL Deployment (Optional)
If you wish to host the database on Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab.
3. Paste the contents of `supabase_schema.sql` located in this directory and click **Run**.
4. In `server/.env`, set:
   ```env
   DATABASE_TYPE=supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```
