# 🏥 Lumina Health - Enterprise Hospital ERP & Doctor Appointment System

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9_ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Lumina Health** is a modern, full-stack Hospital Enterprise Resource Planning (ERP) and Healthcare Management System. It connects all hospital stakeholders into a single unified platform with real-time role-based access control, OPD queue tracking, automated triage, digital prescriptions, lab orders, pharmacy inventory management, accounting, and billing.

---

## 📑 Table of Contents
1. [Key Features & User Roles](#-key-features--user-roles)
2. [Clinical Workflow Pipeline](#-clinical-workflow-pipeline)
3. [NPM Packages & Dependencies Guide](#-npm-packages--dependencies-guide)
   - [Backend Dependencies](#backend-dependencies)
   - [Frontend Dependencies](#frontend-dependencies)
4. [Project Directory Structure](#-project-directory-structure)
5. [Prerequisites](#-prerequisites)
6. [Step-by-Step Setup Guide (Clone & Run)](#-step-by-step-setup-guide-clone--run)
   - [Step 1: Clone Repository](#step-1-clone-repository)
   - [Step 2: Database Setup](#step-2-database-setup-postgresql)
   - [Step 3: Backend Setup](#step-3-backend-setup)
   - [Step 4: Frontend Setup](#step-4-frontend-setup)
7. [Default Demo Credentials](#-default-demo-credentials)
8. [API Endpoints Reference](#-api-endpoints-reference)
9. [Git Push Commands](#-git-push-commands)

---

## 🌟 Key Features & User Roles

The system supports **8 dedicated roles**, each with its own customized portal and layout:

| Role | Responsibilities & Capabilities |
| :--- | :--- |
| 👑 **Super Admin** | Hospital-wide governance, staff onboarding, doctor approval, department management, system audit logs, and revenue overview. |
| 🏥 **Receptionist** | OPD token generation, patient registration, walk-in appointment scheduling, and patient check-in. |
| 🩺 **Doctor** | Real-time OPD patient queue, vitals inspection, medical consultations, digital prescription builder, and lab order generation. |
| 👩‍⚕️ **Nurse** | Pre-consultation triage, recording vital signs (BP, Heart Rate, SpO2, Temperature), nursing clinical notes, and inpatient medication logs. |
| 🧪 **Lab Technician** | Laboratory order management, specimen collection, test status tracking, and publishing digital diagnostic reports with reference ranges. |
| 💊 **Pharmacy** | Real-time prescription fulfillment, batch & expiry tracking, medicine stock inventory (50+ pre-seeded catalog), and billing. |
| 💰 **Accounts** | Unified patient billing (consultation + lab + pharmacy), receipt generation, multiple payment modes (Cash, Card, UPI), and financial reporting. |
| 👤 **Patient** | Specialist directory, online slot booking, appointment history, viewing digital prescriptions, downloading lab reports, and reviewing bills. |

---

## 🔄 Clinical Workflow Pipeline

The application features a real-time lifecycle that moves patients sequentially through hospital departments:

```
[ SCHEDULED ]
     │
     ▼
[ CHECKED_IN ] ──────────► Handled by Receptionist upon patient arrival
     │
     ▼
[ VITALS_RECORDED ] ─────► Nurse records BP, Pulse, SpO2, Temperature
     │
     ▼
[ IN_CONSULTATION ] ─────► Doctor conducts clinical review
     │
     ├─► [ LAB_REQUESTED ] ──► Lab Tech collects sample & enters results ──► [ LAB_COMPLETED ]
     │
     ▼
[ PRESCRIPTION_GENERATED ] Doctor creates digital prescription
     │
     ▼
[ MEDICINE_DISPENSED ] ──► Pharmacist dispenses medicines from stock
     │
     ▼
[ PAYMENT_COMPLETED ] ───► Accounts collects invoice payment
     │
     ▼
[ TREATMENT_COMPLETED ] ─► Consultation cycle closed
```

---

## 📦 NPM Packages & Dependencies Guide

### Backend Dependencies

| Package | Version | Purpose & Description |
| :--- | :--- | :--- |
| **`express`** | `^5.2.1` | Fast, unopinionated web server framework for RESTful API routing and middleware handling. |
| **`@prisma/client`** | `^7.9.0` | Next-generation ORM client providing auto-generated, type-safe database queries. |
| **`@prisma/adapter-pg`** | `^7.9.0` | Driver adapter enabling Prisma v7 to run high-performance queries over `pg`. |
| **`prisma`** *(dev)* | `^7.9.0` | Prisma CLI for database migrations (`db push`), code generation, and GUI (`studio`). |
| **`pg`** | `^8.21.0` | Official PostgreSQL client for Node.js connection pooling. |
| **`jsonwebtoken`** | `^9.0.3` | Generates and validates signed JWT access tokens and refresh tokens. |
| **`bcrypt` & `bcryptjs`** | `^6.0.0` / `^3.0.3` | Cryptographic one-way password hashing for secure credential storage. |
| **`cors`** | `^2.8.6` | Cross-Origin Resource Sharing middleware to allow React frontend requests. |
| **`helmet`** | `^8.2.0` | Security middleware that configures secure HTTP response headers. |
| **`express-rate-limit`** | `^8.6.0` | Rate limiter protecting APIs against brute-force attacks and abuse. |
| **`morgan`** | `^1.11.0` | HTTP request logging middleware for backend debugging and monitoring. |
| **`cookie-parser`** | `^1.4.7` | Parses cookie headers for secure refresh token handling. |
| **`dotenv`** | `^17.4.2` | Loads configuration variables from `.env` into `process.env`. |
| **`multer`** | `^2.2.0` | Handles `multipart/form-data` for file uploads (certificates, documents). |
| **`nodemailer`** | `^9.0.3` | Transports transactional emails (confirmations, password reset, alerts) via SMTP. |
| **`node-cron`** | `^4.2.1` | Schedules automated recurring background jobs and reminders. |
| **`zod`** | `^4.4.3` | TypeScript-first runtime schema validation for incoming request payloads. |
| **`razorpay`** | `^2.9.8` | Payment gateway SDK for processing online appointment payments. |
| **`cloudinary`** | `^2.10.0` | Cloud media storage service for profile photos and medical attachments. |
| **`csv-parse`** | `^7.0.2` | Parses CSV files for bulk data uploads (e.g. medicine catalogs). |
| **`nodemon`** *(dev)* | `^3.1.14` | Development utility that automatically restarts the Node server on file changes. |

### Frontend Dependencies

| Package | Version | Purpose & Description |
| :--- | :--- | :--- |
| **`react`** | `^19.2.6` | Modern React UI component framework. |
| **`react-dom`** | `^19.2.6` | React DOM renderer for browser environments. |
| **`vite`** *(dev)* | `^8.0.12` | Next-generation frontend build tool providing near-instant Hot Module Replacement (HMR). |
| **`react-router-dom`** | `^7.17.0` | Declarative routing system for multi-page navigation and protected role layouts. |
| **`axios`** | `^1.18.0` | HTTP client featuring request & response interceptors and silent token refresh. |
| **`tailwindcss`** | `^4.3.1` | Modern utility-first CSS framework for clean, responsive, and accessible styling. |
| **`@tailwindcss/vite`** | `^4.3.1` | Official Vite plugin for Tailwind CSS v4 compiler integration. |
| **`lucide-react`** | `^1.20.0` | Lightweight, customizable icon set for clean dashboard UI elements. |
| **`react-hot-toast`** | `^2.6.0` | Lightweight and customizable toast notification library for alert messages. |
| **`jwt-decode`** | `^4.0.0` | Decodes JWT payloads client-side for role verification and auth expiration checking. |
| **`eslint`** *(dev)* | `^10.3.0` | Code quality and linting tool for React development. |

---

## 📁 Project Directory Structure

```plaintext
doctor/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Full PostgreSQL database schema
│   │   └── seed.js             # Automated seed for 8 role accounts & departments
│   ├── src/
│   │   ├── config/             # DB & Prisma connection pool, JWT configs
│   │   ├── controllers/        # Controllers for all 8 roles & hospital modules
│   │   ├── middlewares/        # Auth, Role-based guard, Error handler, Rate limit
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── utils/              # Email service, AppError class, Helpers
│   │   └── app.js              # Express app entry point
│   ├── uploads/                # Local uploaded files storage (.gitkeep)
│   ├── seed_medicines.js       # Seeds 50+ hospital medicines into inventory
│   ├── .env.example            # Environment variables template
│   └── package.json            # Backend dependencies & scripts
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components & ProtectedRoute
│   │   ├── context/            # Global AuthContext & state management
│   │   ├── layouts/            # 8 Role-specific layouts (Sidebar, Header, Navigation)
│   │   ├── pages/              # Portal pages grouped by role (Admin, Doctor, Nurse, etc.)
│   │   ├── services/           # Axios instance with auto-refresh interceptors
│   │   ├── App.jsx             # Main Router configuration
│   │   └── main.jsx            # React root mount point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json            # Frontend dependencies & scripts
├── .gitignore                  # Git ignore rules (node_modules, .env, uploads)
└── README.md                   # Complete documentation
```

---

## ⚙️ Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **PostgreSQL**: v14 or higher ([Download PostgreSQL](https://www.postgresql.org/)) with `pgAdmin` or `psql`
- **Git**: Installed and configured on your system

---

## 🚀 Step-by-Step Setup Guide (Clone & Run)

Follow these exact steps to run the application from scratch on any computer:

### Step 1: Clone Repository
```bash
git clone https://github.com/isackidan/Doctor-Appointment-System.git
cd Doctor-Appointment-System
```

---

### Step 2: Database Setup (PostgreSQL)
1. Open your PostgreSQL tool (`pgAdmin` or terminal `psql`).
2. Create a new database named `doctor`:
   ```sql
   CREATE DATABASE doctor;
   ```

---

### Step 3: Backend Setup

1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install all backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     # On Windows PowerShell:
     Copy-Item .env.example .env

     # On Linux / Mac / Git Bash:
     cp .env.example .env
     ```
   - Open `.env` and verify your PostgreSQL credentials:
     ```env
     PORT=5000
     DB_USER=postgres
     DB_PASSWORD=your_postgres_password
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=doctor

     DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/doctor?schema=public"
     JWT_SECRET=super_secret_key_for_hospital_erp
     JWT_REFRESH_SECRET=super_secret_refresh_key_for_hospital_erp
     ```

4. Push the Prisma schema to your PostgreSQL database:
   ```bash
   npm run db:push
   ```

5. Seed all demo accounts and medicines:
   ```bash
   # Seed 8 Role Accounts & Departments
   npm run seed

   # Seed 50+ Common Hospital Medicines
   npm run seed:medicines
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   > 🚀 Output: `Hospital ERP Server is running on port 5000`

---

### Step 4: Frontend Setup

1. Open a **second terminal window** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install all frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 🔑 Default Demo Credentials

Once the seed script finishes, all 8 test accounts are ready to use with the password **`password123`**:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| 👑 **Super Admin** | `superadmin@hospital.com` | `password123` | `/superadmin` |
| 🏥 **Receptionist** | `receptionist@hospital.com` | `password123` | `/receptionist` |
| 🩺 **Doctor** | `doctor@hospital.com` | `password123` | `/doctor` |
| 👩‍⚕️ **Nurse** | `nurse@hospital.com` | `password123` | `/nurse` |
| 🧪 **Lab Technician** | `labtech@hospital.com` | `password123` | `/lab` |
| 💊 **Pharmacy** | `pharmacy@hospital.com` | `password123` | `/pharmacy` |
| 💰 **Accounts** | `accounts@hospital.com` | `password123` | `/accounts` |
| 👤 **Patient** | `patient@hospital.com` | `password123` | `/user` |

---

## 🔌 API Endpoints Reference

| Prefix Route | Module / Scope | Accessible By |
| :--- | :--- | :--- |
| `/api/auth` | Login, Register, Silent Token Refresh, Logout | Public / Authenticated |
| `/api/workflow` | Hospital Patient State Transition Pipeline | Receptionist, Nurse, Doctor, Lab, Pharmacy, Accounts |
| `/api/receptionist` | Patient Registration, OPD Token Check-In | Receptionist, Super Admin |
| `/api/nurse` | Vitals Entry, Nursing Notes, Ward Beds | Nurse, Super Admin |
| `/api/doctor` | Live Queue, Consultations, Prescription Generation | Doctor, Super Admin |
| `/api/lab` | Test Orders, Sample Collection, Diagnostic Results | Lab Technician, Super Admin |
| `/api/pharmacy` | Prescription Dispense, Stock Inventory Batches | Pharmacy, Super Admin |
| `/api/accounts` | Consolidated Patient Billing, Payment Receipts | Accounts, Super Admin |
| `/api/admin` | User CRUD, Department CRUD, Hospital Audit Logs | Super Admin |
| `/api/medicines` | Medicine Inventory Search & Catalog | Pharmacy, Doctor, Super Admin |
| `/api/appointments` | Slot Booking, Status Updates, Rescheduling | Patient, Doctor, Receptionist |
| `/api/patient` | Patient Prescriptions, Lab Reports, Bill History | Patient, Super Admin |

---

## 📤 Git Push Commands

To push all your project changes, documentation, and additions to GitHub, run the following commands in the project root:

```bash
# 1. Check current status
git status

# 2. Stage all project files (sensitive .env is protected by .gitignore)
git add .

# 3. Commit your changes
git commit -m "feat: complete hospital ERP system with 8 roles and comprehensive documentation"

# 4. Push to GitHub main branch
git push origin main
```

---

## 👨‍💻 Author & Maintainer
- **Repository**: [Doctor-Appointment-System](https://github.com/isackidan/Doctor-Appointment-System)
- Built with ❤️ for modern healthcare operations.

---

## 🇮🇳 தமிழ் வழிமுறைகள் (Tamil Quick Setup Guide)

### 📌 திட்டம் பற்றிய சுருக்கம்:
இது ஒரு முழுமையான **Hospital ERP & Doctor Appointment System**. இதில் மொத்தம் **8 பொறுப்புகள் (Roles)** உள்ளன:
- 👑 Super Admin
- 🏥 Receptionist
- 🩺 Doctor
- 👩‍⚕️ Nurse
- 🧪 Lab Technician
- 💊 Pharmacy
- 💰 Accounts
- 👤 Patient

### 📦 பயன்படுத்தப்பட்ட முக்கிய NPM தொகுப்புகள்:
- **Backend**: `express` (சர்வர்), `prisma` & `@prisma/client` (PostgreSQL ORM), `jsonwebtoken` & `bcrypt` (பாதுகாப்பான உள்நுழைவு), `cors`, `helmet`, `nodemailer`, `node-cron`, `multer`, `zod`.
- **Frontend**: `react` 19, `vite` 8, `react-router-dom` 7, `tailwindcss` 4, `axios`, `lucide-react`, `react-hot-toast`.

### 🚀 Git-லிருந்து எடுத்து Run செய்யும் வழிமுறைகள்:

```bash
# 1. GitHub-லிருந்து Clone செய்யவும்
git clone https://github.com/isackidan/Doctor-Appointment-System.git
cd Doctor-Appointment-System

# 2. Backend அமைத்தல்
cd backend
npm install
Copy-Item .env.example .env    # (.env-ல் உங்கள் PostgreSQL கடவுச்சொல்லை மாற்றவும்)
npm run db:push                 # Database அட்டவணைகளை உருவாக்க
npm run seed                    # 8 Demo கணக்குகளை உருவாக்க
npm run seed:medicines          # 50+ மருத்துவமனை மருந்துகளை ஏற்ற
npm run dev                     # Backend சர்வரை இயக்க (Port 5000)

# 3. Frontend அமைத்தல் (புதிய Terminal-ல்)
cd ../frontend
npm install
npm run dev                     # Frontend இயக்க (http://localhost:5173)
```

**அனைத்து Demo கணக்குகளுக்கான பொதுவான கடவுச்சொல் (Password):** `password123`
