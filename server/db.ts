import fs from 'fs';
import path from 'path';
import {
  User,
  PatientProfile,
  Department,
  Doctor,
  DoctorAvailability,
  Appointment,
  MedicalRecord,
  Prescription,
  NotificationItem,
  AnalyticsReport,
  AppointmentStatus,
  CheckInStatus
} from '../src/types';

export class HospitalDatabase {
  users: User[] = [];
  patients: PatientProfile[] = [];
  departments: Department[] = [];
  doctors: Doctor[] = [];
  availability: DoctorAvailability[] = [];
  appointments: Appointment[] = [];
  medicalRecords: MedicalRecord[] = [];
  prescriptions: Prescription[] = [];
  notifications: NotificationItem[] = [];
  auditLogs: Array<{ id: number; userId?: number; action: string; entity: string; entityId?: number; details?: string; timestamp: string }> = [];

  constructor() {
    this.seedDefaultData();
  }

  seedDefaultData() {
    this.users = [
      {
        id: 1,
        email: 'admin@kirindahospital.org',
        role: 'admin',
        fullName: 'Dr. Beatrice Mukamwezi',
        phone: '+250 788 112 233',
        status: 'active',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 2,
        email: 'jean.claude@kirindahospital.org',
        role: 'doctor',
        fullName: 'Dr. Jean Claude Munyaneza',
        phone: '+250 788 223 344',
        status: 'active',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 3,
        email: 'sarah.k@kirindahospital.org',
        role: 'doctor',
        fullName: 'Dr. Sarah Kanyange',
        phone: '+250 788 334 455',
        status: 'active',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813686-749e73b2210b?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 4,
        email: 'eric.ndaye@kirindahospital.org',
        role: 'doctor',
        fullName: 'Dr. Eric Ndayisaba',
        phone: '+250 788 445 566',
        status: 'active',
        avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 5,
        email: 'grace.u@kirindahospital.org',
        role: 'doctor',
        fullName: 'Dr. Grace Uwera',
        phone: '+250 788 556 677',
        status: 'active',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 6,
        email: 'reception@kirindahospital.org',
        role: 'receptionist',
        fullName: 'Patrick Mugisha',
        phone: '+250 788 667 788',
        status: 'active',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 7,
        email: 'patient.john@example.com',
        role: 'patient',
        fullName: 'John Habimana',
        phone: '+250 788 778 899',
        status: 'active',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 8,
        email: 'patient.alice@example.com',
        role: 'patient',
        fullName: 'Alice Uwase',
        phone: '+250 788 889 900',
        status: 'active',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      }
    ];

    this.departments = [
      {
        id: 1,
        name: 'General Medicine',
        code: 'GEN-MED',
        description: 'Comprehensive primary care, diagnostic assessments, health screenings, and acute illness treatment.',
        icon: 'Stethoscope',
        headOfDepartment: 'Dr. Jean Claude Munyaneza',
        floorLocation: 'Ground Floor, Wing A',
        phoneExtension: '101',
        isActive: true,
        doctorCount: 1
      },
      {
        id: 2,
        name: 'Pediatrics',
        code: 'PED-CARE',
        description: 'Compassionate pediatric healthcare for newborns, toddlers, and young adults with dedicated play spaces.',
        icon: 'Baby',
        headOfDepartment: 'Dr. Sarah Kanyange',
        floorLocation: '1st Floor, Wing B',
        phoneExtension: '102',
        isActive: true,
        doctorCount: 1
      },
      {
        id: 3,
        name: 'Cardiology',
        code: 'CARDIO',
        description: 'Specialized heart diagnostics, clinical cardiology, ECG testing, and cardiovascular lifestyle plans.',
        icon: 'HeartPulse',
        headOfDepartment: 'Dr. Eric Ndayisaba',
        floorLocation: '2nd Floor, Wing C',
        phoneExtension: '103',
        isActive: true,
        doctorCount: 1
      },
      {
        id: 4,
        name: 'Dentistry',
        code: 'DENT',
        description: 'Modern oral surgery, restorative fillings, gentle cleaning, pediatric dental care, and smile enhancement.',
        icon: 'Smile',
        headOfDepartment: 'Dr. Grace Uwera',
        floorLocation: 'Ground Floor, Wing D',
        phoneExtension: '104',
        isActive: true,
        doctorCount: 1
      },
      {
        id: 5,
        name: 'Gynecology & Obstetrics',
        code: 'OB-GYN',
        description: 'Maternal health, prenatal scanning, postpartum recovery, and comprehensive women’s reproductive care.',
        icon: 'Sparkles',
        headOfDepartment: 'Dr. Nadine Ingabire',
        floorLocation: '1st Floor, Wing A',
        phoneExtension: '105',
        isActive: true,
        doctorCount: 0
      },
      {
        id: 6,
        name: 'Orthopedics',
        code: 'ORTHO',
        description: 'Bone, joint, and spine treatments, trauma reconstruction, sports injury recovery, and physical rehabilitation.',
        icon: 'Activity',
        headOfDepartment: 'Dr. Olivier Habineza',
        floorLocation: '3rd Floor, Wing B',
        phoneExtension: '106',
        isActive: true,
        doctorCount: 0
      }
    ];

    this.patients = [
      {
        id: 1,
        userId: 7,
        patientCode: 'PAT-KHS-001',
        fullName: 'John Habimana',
        email: 'patient.john@example.com',
        phone: '+250 788 778 899',
        dateOfBirth: '1990-05-14',
        gender: 'male',
        bloodGroup: 'O+',
        address: 'Karongi District, Bwishyura Sector',
        emergencyContactName: 'Marie Habimana (Wife)',
        emergencyContactPhone: '+250 788 901 122',
        insuranceProvider: 'RSSB Rama / Mutuelle',
        insurancePolicyNumber: 'RSSB-2024-9981'
      },
      {
        id: 2,
        userId: 8,
        patientCode: 'PAT-KHS-002',
        fullName: 'Alice Uwase',
        email: 'patient.alice@example.com',
        phone: '+250 788 889 900',
        dateOfBirth: '1995-11-22',
        gender: 'female',
        bloodGroup: 'A+',
        address: 'Kirinda Village, Ruhango District',
        emergencyContactName: 'Claude Uwase (Brother)',
        emergencyContactPhone: '+250 788 912 233',
        insuranceProvider: 'MMI Military Medical Insurance',
        insurancePolicyNumber: 'MMI-882109'
      }
    ];

    this.doctors = [
      {
        id: 1,
        userId: 2,
        departmentId: 1,
        departmentName: 'General Medicine',
        doctorCode: 'DOC-KHS-001',
        fullName: 'Dr. Jean Claude Munyaneza',
        email: 'jean.claude@kirindahospital.org',
        phone: '+250 788 223 344',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
        specialization: 'General Medicine & Family Health',
        qualifications: 'MD, MMed (Internal Medicine) - University of Rwanda',
        experienceYears: 9,
        consultationFee: 30.00,
        roomNumber: 'Room 102 (Outpatient Dept)',
        consultationType: 'both',
        languages: 'English, French, Kinyarwanda',
        licenseNumber: 'RMC-MED-2015-889',
        bio: 'Senior attending practitioner with 9+ years providing compassionate clinical care, acute disease diagnosis, and chronic condition management.',
        rating: 4.95,
        isVerified: true,
        isActive: true
      },
      {
        id: 2,
        userId: 3,
        departmentId: 2,
        departmentName: 'Pediatrics',
        doctorCode: 'DOC-KHS-002',
        fullName: 'Dr. Sarah Kanyange',
        email: 'sarah.k@kirindahospital.org',
        phone: '+250 788 334 455',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813686-749e73b2210b?w=300&auto=format&fit=crop&q=80',
        specialization: 'Consultant Pediatrician',
        qualifications: 'MD, DCH, Fellow of East African Pediatrics Association',
        experienceYears: 11,
        consultationFee: 35.00,
        roomNumber: 'Room 205 (Child Care Wing)',
        consultationType: 'both',
        languages: 'English, Kinyarwanda, Swahili',
        licenseNumber: 'RMC-PED-2013-441',
        bio: 'Devoted child health specialist with deep expertise in neonatal screening, childhood respiratory infections, and developmental milestones.',
        rating: 4.98,
        isVerified: true,
        isActive: true
      },
      {
        id: 3,
        userId: 4,
        departmentId: 3,
        departmentName: 'Cardiology',
        doctorCode: 'DOC-KHS-003',
        fullName: 'Dr. Eric Ndayisaba',
        email: 'eric.ndaye@kirindahospital.org',
        phone: '+250 788 445 566',
        avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
        specialization: 'Cardiologist & Heart Specialist',
        qualifications: 'MD, FACC, Master in Cardiovascular Sciences (Leuven)',
        experienceYears: 14,
        consultationFee: 50.00,
        roomNumber: 'Room 310 (Heart Diagnostic Center)',
        consultationType: 'in_person',
        languages: 'English, French',
        licenseNumber: 'RMC-CAR-2010-120',
        bio: 'Leading cardiologist specializing in echocardiography, hypertension management, and non-invasive coronary prevention.',
        rating: 4.92,
        isVerified: true,
        isActive: true
      },
      {
        id: 4,
        userId: 5,
        departmentId: 4,
        departmentName: 'Dentistry',
        doctorCode: 'DOC-KHS-004',
        fullName: 'Dr. Grace Uwera',
        email: 'grace.u@kirindahospital.org',
        phone: '+250 788 556 677',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
        specialization: 'Dental Surgeon & Oral Health',
        qualifications: 'BDS, MSc in Oral Surgery - Wits University',
        experienceYears: 7,
        consultationFee: 30.00,
        roomNumber: 'Room 114 (Dental Suite)',
        consultationType: 'in_person',
        languages: 'English, Kinyarwanda',
        licenseNumber: 'RMC-DEN-2017-302',
        bio: 'Friendly, patient-centered dentist focusing on pain-free root canals, aesthetic restorations, and preventive community dental programs.',
        rating: 4.88,
        isVerified: true,
        isActive: true
      }
    ];

    this.availability = [
      // Dr. Jean Claude (Mon - Fri)
      { id: 1, doctorId: 1, dayOfWeek: 'Monday', startTime: '08:30', endTime: '16:30', breakStart: '12:30', breakEnd: '13:30', slotDurationMinutes: 30, isAvailable: true },
      { id: 2, doctorId: 1, dayOfWeek: 'Tuesday', startTime: '08:30', endTime: '16:30', breakStart: '12:30', breakEnd: '13:30', slotDurationMinutes: 30, isAvailable: true },
      { id: 3, doctorId: 1, dayOfWeek: 'Wednesday', startTime: '08:30', endTime: '16:30', breakStart: '12:30', breakEnd: '13:30', slotDurationMinutes: 30, isAvailable: true },
      { id: 4, doctorId: 1, dayOfWeek: 'Thursday', startTime: '08:30', endTime: '16:30', breakStart: '12:30', breakEnd: '13:30', slotDurationMinutes: 30, isAvailable: true },
      { id: 5, doctorId: 1, dayOfWeek: 'Friday', startTime: '08:30', endTime: '14:00', breakStart: '12:00', breakEnd: '12:30', slotDurationMinutes: 30, isAvailable: true },
      // Dr. Sarah Kanyange (Mon, Wed, Fri)
      { id: 6, doctorId: 2, dayOfWeek: 'Monday', startTime: '09:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00', slotDurationMinutes: 30, isAvailable: true },
      { id: 7, doctorId: 2, dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00', slotDurationMinutes: 30, isAvailable: true },
      { id: 8, doctorId: 2, dayOfWeek: 'Friday', startTime: '09:00', endTime: '15:00', breakStart: '12:30', breakEnd: '13:30', slotDurationMinutes: 30, isAvailable: true },
      // Dr. Eric Ndayisaba (Tue, Thu)
      { id: 9, doctorId: 3, dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00', breakStart: '12:30', breakEnd: '13:30', slotDurationMinutes: 30, isAvailable: true },
      { id: 10, doctorId: 3, dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00', breakStart: '12:30', breakEnd: '13:30', slotDurationMinutes: 30, isAvailable: true },
      // Dr. Grace Uwera (Mon, Thu)
      { id: 11, doctorId: 4, dayOfWeek: 'Monday', startTime: '08:00', endTime: '15:30', breakStart: '12:00', breakEnd: '13:00', slotDurationMinutes: 30, isAvailable: true },
      { id: 12, doctorId: 4, dayOfWeek: 'Thursday', startTime: '08:00', endTime: '15:30', breakStart: '12:00', breakEnd: '13:00', slotDurationMinutes: 30, isAvailable: true }
    ];

    this.appointments = [
      {
        id: 1,
        referenceNo: 'KHS-2026-0901',
        patientId: 1,
        patientName: 'John Habimana',
        patientPhone: '+250 788 778 899',
        patientCode: 'PAT-KHS-001',
        doctorId: 1,
        doctorName: 'Dr. Jean Claude Munyaneza',
        doctorSpecialization: 'General Medicine & Family Health',
        doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
        departmentId: 1,
        departmentName: 'General Medicine',
        appointmentDate: '2026-09-25',
        startTime: '10:30',
        endTime: '11:00',
        appointmentType: 'in_person',
        status: 'confirmed',
        reason: 'Follow-up consultation for recurring seasonal migraines and blood pressure check.',
        checkInStatus: 'not_arrived',
        feeAmount: 30.00,
        paymentStatus: 'paid',
        createdAt: '2026-09-18T10:00:00.000Z'
      },
      {
        id: 2,
        referenceNo: 'KHS-2026-0902',
        patientId: 2,
        patientName: 'Alice Uwase',
        patientPhone: '+250 788 889 900',
        patientCode: 'PAT-KHS-002',
        doctorId: 2,
        doctorName: 'Dr. Sarah Kanyange',
        doctorSpecialization: 'Consultant Pediatrician',
        doctorAvatar: 'https://images.unsplash.com/photo-1594824813686-749e73b2210b?w=150',
        departmentId: 2,
        departmentName: 'Pediatrics',
        appointmentDate: '2026-09-25',
        startTime: '14:00',
        endTime: '14:30',
        appointmentType: 'in_person',
        status: 'pending',
        reason: 'Annual pediatric wellness assessment and immunization boosters.',
        checkInStatus: 'not_arrived',
        feeAmount: 35.00,
        paymentStatus: 'pending',
        createdAt: '2026-09-18T14:30:00.000Z'
      },
      {
        id: 3,
        referenceNo: 'KHS-2026-0903',
        patientId: 1,
        patientName: 'John Habimana',
        patientPhone: '+250 788 778 899',
        patientCode: 'PAT-KHS-001',
        doctorId: 3,
        doctorName: 'Dr. Eric Ndayisaba',
        doctorSpecialization: 'Cardiologist & Heart Specialist',
        doctorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
        departmentId: 3,
        departmentName: 'Cardiology',
        appointmentDate: '2026-09-22',
        startTime: '09:30',
        endTime: '10:00',
        appointmentType: 'in_person',
        status: 'completed',
        reason: 'Echocardiogram review and cardiovascular risk assessment.',
        checkInStatus: 'completed',
        feeAmount: 50.00,
        paymentStatus: 'paid',
        hasMedicalRecord: true,
        createdAt: '2026-09-15T08:00:00.000Z'
      }
    ];

    this.prescriptions = [
      {
        id: 1,
        medicalRecordId: 1,
        patientId: 1,
        doctorId: 3,
        medicationName: 'Lisinopril Tablets',
        dosage: '10 mg',
        frequency: 'Once daily in the morning',
        duration: '30 days',
        instructions: 'Take with water before breakfast. Monitor blood pressure weekly.',
        issuedAt: '2026-09-22T10:00:00.000Z'
      },
      {
        id: 2,
        medicalRecordId: 1,
        patientId: 1,
        doctorId: 3,
        medicationName: 'Omega-3 Fish Oil',
        dosage: '1000 mg',
        frequency: 'Twice daily',
        duration: '60 days',
        instructions: 'Dietary supplement to support healthy arterial elasticity.',
        issuedAt: '2026-09-22T10:00:00.000Z'
      }
    ];

    this.medicalRecords = [
      {
        id: 1,
        appointmentId: 3,
        appointmentRef: 'KHS-2026-0903',
        patientId: 1,
        patientName: 'John Habimana',
        doctorId: 3,
        doctorName: 'Dr. Eric Ndayisaba',
        visitDate: '2026-09-22',
        symptoms: 'Mild exertional shortness of breath over past 3 weeks; occasional dizziness on rapid standing.',
        diagnosis: 'Stage 1 Primary Hypertension (Controlled)',
        clinicalAssessment: 'Patient demonstrates clear lung sounds and regular S1/S2 heart rhythm with no murmurs. Resting ECG shows sinus rhythm at 74 bpm. Systolic blood pressure slightly elevated.',
        treatmentPlan: 'Initiated low-dose ACE inhibitor therapy (Lisinopril 10mg). Dietary counseling on sodium restriction (<2000mg/day) and structured daily aerobic walking.',
        followUpDate: '2026-10-22',
        vitalSigns: {
          bp: '138/86 mmHg',
          pulse: 74,
          temp: 36.7,
          weightKg: 72.5
        },
        prescriptions: [...this.prescriptions],
        createdAt: '2026-09-22T10:15:00.000Z'
      }
    ];

    this.notifications = [
      {
        id: 1,
        userId: 7,
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Jean Claude Munyaneza is confirmed for September 25, 2026 at 10:30 AM (Ref: KHS-2026-0901).',
        type: 'appointment_confirmed',
        link: '/appointments',
        isRead: false,
        createdAt: '2026-09-18T10:05:00.000Z'
      },
      {
        id: 2,
        userId: 2,
        title: 'New Booking Request',
        message: 'Patient John Habimana scheduled a consultation for Sept 25, 2026 at 10:30 AM.',
        type: 'new_request',
        link: '/doctor/appointments',
        isRead: true,
        createdAt: '2026-09-18T10:01:00.000Z'
      },
      {
        id: 3,
        userId: 7,
        title: 'Clinical Summary Available',
        message: 'Your consultation notes and prescriptions from Dr. Eric Ndayisaba have been published to your medical records.',
        type: 'reminder',
        link: '/medical-records',
        isRead: false,
        createdAt: '2026-09-22T10:20:00.000Z'
      }
    ];

    this.auditLogs = [
      {
        id: 1,
        userId: 1,
        action: 'SYSTEM_INIT',
        entity: 'System',
        entityId: undefined,
        details: 'Kirinda Hospital Management System database schemas initialized successfully.',
        timestamp: '2026-09-15T00:00:00.000Z'
      }
    ];
  }

  // --- Slot computation & double-booking prevention ---
  getAvailableSlots(doctorId: number, dateStr: string): { time: string; endTime: string; isAvailable: boolean; reason?: string }[] {
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (!doctor || !doctor.isActive) return [];

    // Parse day of week from dateStr (e.g. "2026-09-25")
    const dateObj = new Date(dateStr + 'T12:00:00Z');
    const days: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const dayName = days[dateObj.getUTCDay()];

    const avail = this.availability.find(a => a.doctorId === doctorId && a.dayOfWeek === dayName);
    if (!avail || !avail.isAvailable) {
      return [];
    }

    const slotMins = avail.slotDurationMinutes || 30;
    const [startH, startM] = avail.startTime.split(':').map(Number);
    const [endH, endM] = avail.endTime.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    let breakStartTotal = -1;
    let breakEndTotal = -1;
    if (avail.breakStart && avail.breakEnd) {
      const [bsh, bsm] = avail.breakStart.split(':').map(Number);
      const [beh, bem] = avail.breakEnd.split(':').map(Number);
      breakStartTotal = bsh * 60 + bsm;
      breakEndTotal = beh * 60 + bem;
    }

    // Existing active bookings for this doctor on this date
    const bookedAppointments = this.appointments.filter(
      a => a.doctorId === doctorId && a.appointmentDate === dateStr && a.status !== 'cancelled'
    );

    const bookedStartTimes = new Set(bookedAppointments.map(a => a.startTime.substring(0, 5)));

    const slots: { time: string; endTime: string; isAvailable: boolean; reason?: string }[] = [];

    for (let current = startTotal; current + slotMins <= endTotal; current += slotMins) {
      // Check break overlap
      if (breakStartTotal !== -1 && current >= breakStartTotal && current < breakEndTotal) {
        continue; // skip break period
      }

      const h = Math.floor(current / 60);
      const m = current % 60;
      const endH = Math.floor((current + slotMins) / 60);
      const endM = (current + slotMins) % 60;

      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      const isBooked = bookedStartTimes.has(timeStr);

      slots.push({
        time: timeStr,
        endTime: endTimeStr,
        isAvailable: !isBooked,
        reason: isBooked ? 'Booked' : undefined
      });
    }

    return slots;
  }

  // Double-booking check
  checkIsDoubleBooked(doctorId: number, dateStr: string, startTime: string, excludeAppointmentId?: number): boolean {
    const formattedTime = startTime.substring(0, 5);
    return this.appointments.some(
      a =>
        a.doctorId === doctorId &&
        a.appointmentDate === dateStr &&
        a.startTime.substring(0, 5) === formattedTime &&
        a.status !== 'cancelled' &&
        (excludeAppointmentId ? a.id !== excludeAppointmentId : true)
    );
  }

  // Generate Reference No
  generateReferenceNo(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `KHS-${year}-${rand}`;
  }

  addAudit(userId: number | undefined, action: string, entity: string, entityId?: number, details?: string) {
    this.auditLogs.unshift({
      id: this.auditLogs.length + 1,
      userId,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  addNotification(userId: number, title: string, message: string, type: NotificationItem['type'], link?: string) {
    const notif: NotificationItem = {
      id: this.notifications.length + 1,
      userId,
      title,
      message,
      type,
      link,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    return notif;
  }
}

export const db = new HospitalDatabase();
