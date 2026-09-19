-- ==========================================================
-- Kirinda Hospital Management System (KHS)
-- Production MySQL Database Schema & Seed Data
-- Target Database: MySQL 8.0+ / MariaDB 10.5+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `kirinda_hospital_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `kirinda_hospital_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `prescriptions`;
DROP TABLE IF EXISTS `medical_records`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `doctor_availability`;
DROP TABLE IF EXISTS `doctors`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- Manages authentication credentials, user roles, and account status
-- ----------------------------------------------------------
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('patient', 'doctor', 'receptionist', 'admin', 'super_admin') NOT NULL DEFAULT 'patient',
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(25) NOT NULL,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `avatar_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. PATIENTS TABLE
-- Clinical profiles and personal information for registered patients
-- ----------------------------------------------------------
CREATE TABLE `patients` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `patient_code` VARCHAR(30) NOT NULL UNIQUE,
    `date_of_birth` DATE NOT NULL,
    `gender` ENUM('male', 'female', 'other') NOT NULL,
    `blood_group` VARCHAR(10) NULL,
    `address` VARCHAR(255) NULL,
    `emergency_contact_name` VARCHAR(100) NULL,
    `emergency_contact_phone` VARCHAR(25) NULL,
    `insurance_provider` VARCHAR(100) NULL,
    `insurance_policy_number` VARCHAR(50) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_patients_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. DEPARTMENTS TABLE
-- Hospital medical and clinical departments
-- ----------------------------------------------------------
CREATE TABLE `departments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `icon` VARCHAR(50) DEFAULT 'Stethoscope',
    `head_of_department` VARCHAR(100) NULL,
    `floor_location` VARCHAR(50) NOT NULL,
    `phone_extension` VARCHAR(20) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. DOCTORS TABLE
-- Professional credentials, specialization, and room details
-- ----------------------------------------------------------
CREATE TABLE `doctors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `department_id` INT NOT NULL,
    `doctor_code` VARCHAR(30) NOT NULL UNIQUE,
    `specialization` VARCHAR(100) NOT NULL,
    `qualifications` VARCHAR(200) NOT NULL,
    `experience_years` INT NOT NULL DEFAULT 1,
    `consultation_fee` DECIMAL(10,2) NOT NULL DEFAULT 35.00,
    `room_number` VARCHAR(30) NOT NULL,
    `consultation_type` ENUM('in_person', 'telemedicine', 'both') DEFAULT 'both',
    `languages` VARCHAR(150) NOT NULL DEFAULT 'English, Swahili',
    `license_number` VARCHAR(60) NOT NULL,
    `bio` TEXT NULL,
    `rating` DECIMAL(3,2) DEFAULT 4.90,
    `is_verified` BOOLEAN DEFAULT TRUE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_doctors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_doctors_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
    INDEX `idx_doctors_department` (`department_id`),
    INDEX `idx_doctors_specialization` (`specialization`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. DOCTOR AVAILABILITY TABLE
-- Configurable working schedule rules per doctor
-- ----------------------------------------------------------
CREATE TABLE `doctor_availability` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `doctor_id` INT NOT NULL,
    `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `break_start` TIME NULL,
    `break_end` TIME NULL,
    `slot_duration_minutes` INT NOT NULL DEFAULT 30,
    `max_patients_per_slot` INT NOT NULL DEFAULT 1,
    `is_available` BOOLEAN DEFAULT TRUE,
    CONSTRAINT `fk_availability_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_doctor_day` (`doctor_id`, `day_of_week`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. APPOINTMENTS TABLE
-- Booking requests, schedules, reference tokens, and current status
-- ----------------------------------------------------------
CREATE TABLE `appointments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `reference_no` VARCHAR(40) NOT NULL UNIQUE,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `department_id` INT NOT NULL,
    `appointment_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `appointment_type` ENUM('in_person', 'telemedicine') NOT NULL DEFAULT 'in_person',
    `status` ENUM('pending', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
    `reason` TEXT NOT NULL,
    `cancellation_reason` TEXT NULL,
    `check_in_status` ENUM('not_arrived', 'checked_in', 'in_consultation', 'completed') DEFAULT 'not_arrived',
    `checked_in_at` TIMESTAMP NULL,
    `fee_amount` DECIMAL(10,2) NOT NULL DEFAULT 35.00,
    `payment_status` ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_appointments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_appointments_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
    INDEX `idx_app_date_doctor` (`appointment_date`, `doctor_id`),
    INDEX `idx_app_status` (`status`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. NOTIFICATIONS TABLE
-- Real-time in-app alerts and delivery receipts
-- ----------------------------------------------------------
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('appointment_confirmed', 'appointment_cancelled', 'appointment_rescheduled', 'new_request', 'reminder', 'announcement') NOT NULL,
    `link` VARCHAR(255) NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_notif_user` (`user_id`, `is_read`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. MEDICAL RECORDS TABLE
-- Authorized clinical consultation summaries, diagnoses, and care notes
-- ----------------------------------------------------------
CREATE TABLE `medical_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `appointment_id` INT NOT NULL UNIQUE,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `visit_date` DATE NOT NULL,
    `symptoms` TEXT NOT NULL,
    `diagnosis` VARCHAR(255) NOT NULL,
    `clinical_assessment` TEXT NOT NULL,
    `treatment_plan` TEXT NOT NULL,
    `follow_up_date` DATE NULL,
    `vital_signs` JSON NULL, -- e.g. {"bp": "120/80", "pulse": 72, "temp": 36.6, "weight_kg": 68}
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_medrec_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_medrec_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_medrec_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. PRESCRIPTIONS TABLE
-- Medication orders attached to verified medical records
-- ----------------------------------------------------------
CREATE TABLE `prescriptions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `medical_record_id` INT NOT NULL,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `medication_name` VARCHAR(150) NOT NULL,
    `dosage` VARCHAR(80) NOT NULL,
    `frequency` VARCHAR(80) NOT NULL,
    `duration` VARCHAR(80) NOT NULL,
    `instructions` TEXT NULL,
    `issued_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rx_medrec` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rx_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rx_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 10. AUDIT LOGS TABLE
-- Security compliance, record access history, and administrative activity
-- ----------------------------------------------------------
CREATE TABLE `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `action` VARCHAR(80) NOT NULL,
    `entity` VARCHAR(60) NOT NULL,
    `entity_id` INT NULL,
    `details` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_audit_entity` (`entity`, `entity_id`)
) ENGINE=InnoDB;

-- ==========================================================
-- SEED DATA: Realistic Kirinda Hospital Baseline Dataset
-- ==========================================================

-- 1. Seed Users (passwords hashed with bcrypt in real deployment)
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `full_name`, `phone`, `avatar_url`) VALUES
(1, 'admin@kirindahospital.org', '$2b$10$hashed_admin_password', 'admin', 'Dr. Beatrice Mukamwezi', '+250 788 112 233', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
(2, 'jean.claude@kirindahospital.org', '$2b$10$hashed_doctor_password', 'doctor', 'Dr. Jean Claude Munyaneza', '+250 788 223 344', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'),
(3, 'sarah.k@kirindahospital.org', '$2b$10$hashed_doctor_password', 'doctor', 'Dr. Sarah Kanyange', '+250 788 334 455', 'https://images.unsplash.com/photo-1594824813686-749e73b2210b?w=150'),
(4, 'eric.ndaye@kirindahospital.org', '$2b$10$hashed_doctor_password', 'doctor', 'Dr. Eric Ndayisaba', '+250 788 445 566', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'),
(5, 'grace.u@kirindahospital.org', '$2b$10$hashed_doctor_password', 'doctor', 'Dr. Grace Uwera', '+250 788 556 677', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'),
(6, 'reception@kirindahospital.org', '$2b$10$hashed_reception_password', 'receptionist', 'Patrick Mugisha', '+250 788 667 788', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(7, 'patient.john@example.com', '$2b$10$hashed_patient_password', 'patient', 'John Habimana', '+250 788 778 899', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(8, 'patient.alice@example.com', '$2b$10$hashed_patient_password', 'patient', 'Alice Uwase', '+250 788 889 900', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');

-- 2. Seed Departments
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `icon`, `head_of_department`, `floor_location`, `phone_extension`) VALUES
(1, 'General Medicine', 'GEN-MED', 'Comprehensive primary care, diagnostic assessments, and acute illness management.', 'Stethoscope', 'Dr. Jean Claude Munyaneza', 'Ground Floor, Wing A', '101'),
(2, 'Pediatrics', 'PED-CARE', 'Dedicated medical care for infants, children, and adolescents in a welcoming child-friendly environment.', 'Baby', 'Dr. Sarah Kanyange', '1st Floor, Wing B', '102'),
(3, 'Cardiology', 'CARDIO', 'Advanced cardiac diagnostics, heart health screening, and chronic cardiovascular disease management.', 'HeartPulse', 'Dr. Eric Ndayisaba', '2nd Floor, Wing C', '103'),
(4, 'Dentistry', 'DENT', 'Preventative oral health, specialized dental surgeries, restorative crowns, and hygiene care.', 'Smile', 'Dr. Grace Uwera', 'Ground Floor, Wing D', '104'),
(5, 'Gynecology & Obstetrics', 'OB-GYN', 'Full spectrum women’s healthcare, prenatal monitoring, maternity support, and reproductive health.', 'Sparkles', 'Dr. Nadine Ingabire', '1st Floor, Wing A', '105'),
(6, 'Orthopedics', 'ORTHO', 'Musculoskeletal diagnosis, joint reconstruction, sports trauma treatment, and rehabilitation.', 'Activity', 'Dr. Olivier Habineza', '3rd Floor, Wing B', '106');

-- 3. Seed Patients
INSERT INTO `patients` (`id`, `user_id`, `patient_code`, `date_of_birth`, `gender`, `blood_group`, `address`, `emergency_contact_name`, `emergency_contact_phone`, `insurance_provider`) VALUES
(1, 7, 'PAT-KHS-001', '1990-05-14', 'male', 'O+', 'Karongi District, Bwishyura Sector', 'Marie Habimana (Wife)', '+250 788 901 122', 'RSSB Rama / Mutuelle'),
(2, 8, 'PAT-KHS-002', '1995-11-22', 'female', 'A+', 'Kirinda Village, Ruhango District', 'Claude Uwase (Brother)', '+250 788 912 233', 'MMI Military Medical Insurance');

-- 4. Seed Doctors
INSERT INTO `doctors` (`id`, `user_id`, `department_id`, `doctor_code`, `specialization`, `qualifications`, `experience_years`, `consultation_fee`, `room_number`, `consultation_type`, `languages`, `license_number`, `bio`, `rating`) VALUES
(1, 2, 1, 'DOC-KHS-001', 'General Medicine & Family Health', 'MD, MMed (Internal Medicine) - University of Rwanda', 9, 30.00, 'Room 102', 'both', 'English, French, Kinyarwanda', 'RMC-MED-2015-889', 'Lead practitioner at Kirinda Hospital specializing in adult internal care and preventative health screenings.', 4.95),
(2, 3, 2, 'DOC-KHS-002', 'Consultant Pediatrician', 'MD, DCH, Fellow of Pediatrics (EACO)', 11, 35.00, 'Room 205', 'both', 'English, Kinyarwanda, Swahili', 'RMC-PED-2013-441', 'Dedicated child health specialist with extensive experience in pediatric acute care and developmental nutrition.', 4.98),
(3, 4, 3, 'DOC-KHS-003', 'Cardiologist & Heart Specialist', 'MD, FACC, Master in Cardiovascular Sciences', 14, 50.00, 'Room 310', 'in_person', 'English, French', 'RMC-CAR-2010-120', 'Pioneering non-invasive cardiac evaluation and hypertension treatment protocols.', 4.92),
(4, 5, 4, 'DOC-KHS-004', 'Dental Surgeon & Oral Health', 'BDS, MSc in Oral Surgery - Wits University', 7, 30.00, 'Room 114', 'in_person', 'English, Kinyarwanda', 'RMC-DEN-2017-302', 'Gentle, modern dental treatments emphasizing tooth preservation and cosmetic restoration.', 4.88);

-- 5. Seed Doctor Availability (Working Hours)
INSERT INTO `doctor_availability` (`doctor_id`, `day_of_week`, `start_time`, `end_time`, `break_start`, `break_end`, `slot_duration_minutes`) VALUES
(1, 'Monday', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 30),
(1, 'Tuesday', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 30),
(1, 'Wednesday', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 30),
(1, 'Thursday', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 30),
(1, 'Friday', '08:30:00', '14:00:00', '12:00:00', '12:30:00', 30),
(2, 'Monday', '09:00:00', '16:00:00', '13:00:00', '14:00:00', 30),
(2, 'Wednesday', '09:00:00', '16:00:00', '13:00:00', '14:00:00', 30),
(2, 'Friday', '09:00:00', '15:00:00', '12:30:00', '13:30:00', 30),
(3, 'Tuesday', '09:00:00', '17:00:00', '12:30:00', '13:30:00', 30),
(3, 'Thursday', '09:00:00', '17:00:00', '12:30:00', '13:30:00', 30),
(4, 'Monday', '08:00:00', '15:30:00', '12:00:00', '13:00:00', 30),
(4, 'Thursday', '08:00:00', '15:30:00', '12:00:00', '13:00:00', 30);

-- 6. Seed Appointments
INSERT INTO `appointments` (`id`, `reference_no`, `patient_id`, `doctor_id`, `department_id`, `appointment_date`, `start_time`, `end_time`, `appointment_type`, `status`, `reason`, `check_in_status`, `fee_amount`, `payment_status`) VALUES
(1, 'KHS-2026-0901', 1, 1, 1, '2026-09-25', '10:30:00', '11:00:00', 'in_person', 'confirmed', 'Follow-up consultation for recurring seasonal migraines and blood pressure check.', 'not_arrived', 30.00, 'paid'),
(2, 'KHS-2026-0902', 2, 2, 2, '2026-09-25', '14:00:00', '14:30:00', 'in_person', 'pending', 'Annual pediatric wellness assessment and immunization boosters.', 'not_arrived', 35.00, 'pending'),
(3, 'KHS-2026-0903', 1, 3, 3, '2026-09-22', '09:30:00', '10:00:00', 'in_person', 'completed', 'Echocardiogram review and cardiovascular risk assessment.', 'completed', 50.00, 'paid');

-- 7. Seed Medical Record & Prescription for Completed Appointment #3
INSERT INTO `medical_records` (`id`, `appointment_id`, `patient_id`, `doctor_id`, `visit_date`, `symptoms`, `diagnosis`, `clinical_assessment`, `treatment_plan`, `follow_up_date`, `vital_signs`) VALUES
(1, 3, 1, 3, '2026-09-22', 'Mild exertional shortness of breath over the past 3 weeks; resting pulse 74 bpm.', 'Stage 1 Primary Hypertension (controlled)', 'Patient demonstrates good heart sounds (S1, S2 clear, no murmurs). Resting ECG normal. Mildly elevated systolic blood pressure.', 'Prescribed daily low-dose ACE inhibitor. Recommended sodium reduction (<2g/day) and 30 minutes of aerobic walking.', '2026-10-22', '{"bp": "138/86", "pulse": 74, "temp": 36.7, "weight_kg": 72.5}');

INSERT INTO `prescriptions` (`id`, `medical_record_id`, `patient_id`, `doctor_id`, `medication_name`, `dosage`, `frequency`, `duration`, `instructions`) VALUES
(1, 1, 1, 3, 'Lisinopril Tablets', '10 mg', 'Once daily in the morning', '30 days', 'Take with water before breakfast. Monitor blood pressure weekly.'),
(2, 1, 1, 3, 'Omega-3 Fish Oil', '1000 mg', 'Twice daily', '60 days', 'Dietary supplement to support healthy arterial elasticity.');

-- 8. Seed Notifications
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`) VALUES
(1, 7, 'Appointment Confirmed', 'Your appointment with Dr. Jean Claude Munyaneza is confirmed for September 25, 2026 at 10:30 AM (Ref: KHS-2026-0901).', 'appointment_confirmed', '/appointments', FALSE),
(2, 2, 'New Booking Request', 'Patient John Habimana has scheduled a consultation for Sept 25, 2026 at 10:30 AM.', 'new_request', '/doctor-schedule', TRUE),
(3, 7, 'Clinical Summary Available', 'Your consultation notes and prescriptions from Dr. Eric Ndayisaba have been published to your medical records portal.', 'reminder', '/medical-records', FALSE);

-- 9. Seed Audit Logs
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity`, `entity_id`, `details`, `ip_address`) VALUES
(1, 1, 'SYSTEM_INIT', 'System', NULL, 'Kirinda Hospital Management System database schemas initialized successfully.', '127.0.0.1'),
(2, 7, 'APPOINTMENT_BOOK', 'Appointment', 1, 'Patient booked consultation with Dr. Jean Claude Munyaneza (KHS-2026-0901)', '197.243.10.4');
