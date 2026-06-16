CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- INDHA COLUMN DHAAN PROBLEM AACHU
    role VARCHAR(20) CHECK (role IN ('USER', 'DOCTOR', 'ADMIN')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL,
    certificate_url TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Admin Settings
CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    app_logo_url TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin setting
INSERT INTO admin_settings (commission_percentage) VALUES (10.00);

-- Doctor Availability Slots
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    UNIQUE(doctor_id, slot_date, start_time)
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    slot_id UUID UNIQUE REFERENCES doctor_availability(id) ON DELETE RESTRICT,
    doctor_fee DECIMAL(10, 2) NOT NULL,
    admin_commission DECIMAL(10, 2) NOT NULL,
    total_fee DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('BOOKED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')) DEFAULT 'BOOKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    medication_details TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);