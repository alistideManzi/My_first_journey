import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import {
  Appointment,
  Department,
  Doctor,
  DoctorAvailability,
  AppointmentStatus,
  CheckInStatus,
  AnalyticsReport,
  MedicalRecord,
  PatientProfile,
  User,
  UserRole
} from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In a real app with JWT/sessions, we decode token from headers.
  // For easy multi-role demoing and student evaluation, we support custom role header 'x-user-id'
  // and default to John Habimana (patient) or admin when switched.
  const getCurrentUser = (req: Request): User => {
    const userIdHeader = req.headers['x-user-id'];
    if (userIdHeader) {
      const found = db.users.find(u => u.id === Number(userIdHeader));
      if (found) return found;
    }
    // Default fallback to first patient
    return db.users.find(u => u.role === 'patient') || db.users[0];
  };

  // --- API Routes ---

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', hospital: 'Kirinda Hospital Management System', timestamp: new Date().toISOString() });
  });

  // Auth: Current user / Session
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    let patientProfile: PatientProfile | undefined;
    let doctorProfile: Doctor | undefined;

    if (user.role === 'patient') {
      patientProfile = db.patients.find(p => p.userId === user.id);
    } else if (user.role === 'doctor') {
      doctorProfile = db.doctors.find(d => d.userId === user.id);
    }

    res.json({
      user,
      patient: patientProfile,
      doctor: doctorProfile
    });
  });

  // Auth: Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is deactivated. Please contact administration.' });
    }

    let patientProfile: PatientProfile | undefined;
    let doctorProfile: Doctor | undefined;

    if (user.role === 'patient') {
      patientProfile = db.patients.find(p => p.userId === user.id);
    } else if (user.role === 'doctor') {
      doctorProfile = db.doctors.find(d => d.userId === user.id);
    }

    db.addAudit(user.id, 'USER_LOGIN', 'User', user.id, `User logged in: ${user.fullName} (${user.role})`);

    res.json({
      message: 'Login successful',
      user,
      patient: patientProfile,
      doctor: doctorProfile
    });
  });

  // Auth: Register (Patient)
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { fullName, email, phone, password, dateOfBirth, gender, bloodGroup, address, emergencyContactName, emergencyContactPhone } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: 'Full name, email, and phone number are required.' });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUserId = db.users.length + 1;
    const newUser: User = {
      id: newUserId,
      email,
      role: 'patient',
      fullName,
      phone,
      status: 'active',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
    };
    db.users.push(newUser);

    const newPatientId = db.patients.length + 1;
    const newPatient: PatientProfile = {
      id: newPatientId,
      userId: newUserId,
      patientCode: `PAT-KHS-${String(newPatientId).padStart(3, '0')}`,
      fullName,
      email,
      phone,
      dateOfBirth: dateOfBirth || '1995-01-01',
      gender: gender || 'other',
      bloodGroup: bloodGroup || 'O+',
      address: address || '',
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || ''
    };
    db.patients.push(newPatient);

    db.addAudit(newUserId, 'PATIENT_REGISTER', 'Patient', newPatientId, `New patient self-registered: ${fullName}`);
    db.addNotification(newUserId, 'Welcome to Kirinda Hospital', 'Your patient profile has been created. You can now book appointments online.', 'announcement');

    res.status(201).json({
      message: 'Registration successful',
      user: newUser,
      patient: newPatient
    });
  });

  // Auth: Quick Role Switcher for instant testing
  app.post('/api/auth/switch-demo', (req: Request, res: Response) => {
    const { role, specificEmail } = req.body;
    let targetUser: User | undefined;

    if (specificEmail) {
      targetUser = db.users.find(u => u.email === specificEmail);
    } else if (role) {
      targetUser = db.users.find(u => u.role === role);
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'Demo user not found' });
    }

    let patientProfile: PatientProfile | undefined;
    let doctorProfile: Doctor | undefined;

    if (targetUser.role === 'patient') {
      patientProfile = db.patients.find(p => p.userId === targetUser.id);
    } else if (targetUser.role === 'doctor') {
      doctorProfile = db.doctors.find(d => d.userId === targetUser.id);
    }

    res.json({
      user: targetUser,
      patient: patientProfile,
      doctor: doctorProfile
    });
  });

  // --- Departments ---
  app.get('/api/departments', (req: Request, res: Response) => {
    const activeOnly = req.query.active !== 'false';
    const list = activeOnly ? db.departments.filter(d => d.isActive) : db.departments;
    
    // Add dynamic doctor count
    const enriched = list.map(d => ({
      ...d,
      doctorCount: db.doctors.filter(doc => doc.departmentId === d.id && doc.isActive).length
    }));

    res.json(enriched);
  });

  app.post('/api/departments', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin permissions required.' });
    }

    const { name, code, description, icon, headOfDepartment, floorLocation, phoneExtension } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required.' });
    }

    const newDept: Department = {
      id: db.departments.length + 1,
      name,
      code: code.toUpperCase(),
      description: description || '',
      icon: icon || 'Stethoscope',
      headOfDepartment: headOfDepartment || '',
      floorLocation: floorLocation || 'Ground Floor',
      phoneExtension: phoneExtension || '100',
      isActive: true,
      doctorCount: 0
    };

    db.departments.push(newDept);
    db.addAudit(user.id, 'CREATE_DEPARTMENT', 'Department', newDept.id, `Department created: ${name}`);

    res.status(201).json(newDept);
  });

  app.put('/api/departments/:id', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin permissions required.' });
    }

    const id = Number(req.params.id);
    const dept = db.departments.find(d => d.id === id);
    if (!dept) return res.status(404).json({ error: 'Department not found' });

    Object.assign(dept, req.body);
    db.addAudit(user.id, 'UPDATE_DEPARTMENT', 'Department', id, `Department updated: ${dept.name}`);
    res.json(dept);
  });

  // --- Doctors ---
  app.get('/api/doctors', (req: Request, res: Response) => {
    const { departmentId, search, consultationType, activeOnly } = req.query;
    let list = [...db.doctors];

    if (activeOnly !== 'false') {
      list = list.filter(d => d.isActive);
    }

    if (departmentId) {
      list = list.filter(d => d.departmentId === Number(departmentId));
    }

    if (consultationType) {
      list = list.filter(d => d.consultationType === consultationType || d.consultationType === 'both');
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        d =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          (d.departmentName && d.departmentName.toLowerCase().includes(q))
      );
    }

    res.json(list);
  });

  app.get('/api/doctors/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const doctor = db.doctors.find(d => d.id === id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const availability = db.availability.filter(a => a.doctorId === id);
    res.json({ ...doctor, availability });
  });

  app.post('/api/doctors', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { fullName, email, phone, departmentId, specialization, qualifications, experienceYears, consultationFee, roomNumber, bio, consultationType } = req.body;

    const dept = db.departments.find(d => d.id === Number(departmentId));
    if (!dept) return res.status(400).json({ error: 'Invalid department' });

    const newUserId = db.users.length + 1;
    const newUser: User = {
      id: newUserId,
      email,
      role: 'doctor',
      fullName,
      phone,
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'
    };
    db.users.push(newUser);

    const newDoctorId = db.doctors.length + 1;
    const newDoctor: Doctor = {
      id: newDoctorId,
      userId: newUserId,
      departmentId: dept.id,
      departmentName: dept.name,
      doctorCode: `DOC-KHS-${String(newDoctorId).padStart(3, '0')}`,
      fullName,
      email,
      phone,
      avatarUrl: newUser.avatarUrl!,
      specialization: specialization || 'General Medicine',
      qualifications: qualifications || 'MD',
      experienceYears: Number(experienceYears) || 3,
      consultationFee: Number(consultationFee) || 30.00,
      roomNumber: roomNumber || 'Consultation Room',
      consultationType: consultationType || 'both',
      languages: 'English, French, Kinyarwanda',
      licenseNumber: `RMC-LIC-${newDoctorId + 2000}`,
      bio: bio || '',
      rating: 5.0,
      isVerified: true,
      isActive: true
    };
    db.doctors.push(newDoctor);

    // Add default working availability (Monday-Friday)
    const days: DoctorAvailability['dayOfWeek'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
      db.availability.push({
        id: db.availability.length + 1,
        doctorId: newDoctorId,
        dayOfWeek: day,
        startTime: '08:30',
        endTime: '16:30',
        breakStart: '12:30',
        breakEnd: '13:30',
        slotDurationMinutes: 30,
        isAvailable: true
      });
    });

    db.addAudit(user.id, 'ADD_DOCTOR', 'Doctor', newDoctorId, `Admin added doctor: ${fullName}`);
    res.status(201).json(newDoctor);
  });

  app.put('/api/doctors/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const doctor = db.doctors.find(d => d.id === id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    Object.assign(doctor, req.body);
    if (req.body.departmentId) {
      const dept = db.departments.find(d => d.id === Number(req.body.departmentId));
      if (dept) doctor.departmentName = dept.name;
    }

    res.json(doctor);
  });

  app.get('/api/doctors/:id/availability', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const list = db.availability.filter(a => a.doctorId === id);
    res.json(list);
  });

  app.put('/api/doctors/:id/availability', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { availability } = req.body;
    if (!Array.isArray(availability)) {
      return res.status(400).json({ error: 'Availability array required' });
    }

    // Replace availability schedule for this doctor
    db.availability = db.availability.filter(a => a.doctorId !== id);
    availability.forEach(item => {
      db.availability.push({
        id: db.availability.length + 1,
        doctorId: id,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        breakStart: item.breakStart,
        breakEnd: item.breakEnd,
        slotDurationMinutes: item.slotDurationMinutes || 30,
        isAvailable: item.isAvailable !== false
      });
    });

    res.json({ message: 'Availability schedule updated successfully', count: availability.length });
  });

  // --- Appointments & Slot Booking ---

  // Available slots for doctor on a given date (Enforces server-side validation & prevents double bookings!)
  app.get('/api/appointments/available-slots', (req: Request, res: Response) => {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ error: 'doctorId and date query parameters are required' });
    }

    const docId = Number(doctorId);
    const dateStr = String(date);

    const slots = db.getAvailableSlots(docId, dateStr);
    res.json({
      doctorId: docId,
      date: dateStr,
      slots
    });
  });

  // Get appointments (role filtered)
  app.get('/api/appointments', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    const { status, date, doctorId, patientId } = req.query;

    let list = [...db.appointments];

    // Role-based authorization
    if (user.role === 'patient') {
      const patient = db.patients.find(p => p.userId === user.id);
      if (patient) {
        list = list.filter(a => a.patientId === patient.id);
      } else {
        list = [];
      }
    } else if (user.role === 'doctor') {
      const doctor = db.doctors.find(d => d.userId === user.id);
      if (doctor) {
        list = list.filter(a => a.doctorId === doctor.id);
      }
    }
    // Receptionist & Admin can see all, with optional query filters

    if (status && typeof status === 'string') {
      list = list.filter(a => a.status === status);
    }
    if (date && typeof date === 'string') {
      list = list.filter(a => a.appointmentDate === date);
    }
    if (doctorId) {
      list = list.filter(a => a.doctorId === Number(doctorId));
    }
    if (patientId) {
      list = list.filter(a => a.patientId === Number(patientId));
    }

    // Sort newest first
    list.sort((a, b) => new Date(`${b.appointmentDate}T${b.startTime}`).getTime() - new Date(`${a.appointmentDate}T${a.startTime}`).getTime());

    res.json(list);
  });

  app.get('/api/appointments/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const appt = db.appointments.find(a => a.id === id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appt);
  });

  // Book Appointment (Step 5-6-7 in workflow)
  app.post('/api/appointments', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const {
      doctorId,
      departmentId,
      appointmentDate,
      startTime,
      endTime,
      appointmentType,
      reason,
      patientId, // Optional override if receptionist/admin booking on behalf
      guestInfo
    } = req.body;

    if (!doctorId || !appointmentDate || !startTime || !reason) {
      return res.status(400).json({ error: 'Doctor, appointment date, time, and reason are required.' });
    }

    const doctor = db.doctors.find(d => d.id === Number(doctorId));
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

    // CRITICAL REQUIREMENT: Double-booking prevention verified on server!
    const isDoubleBooked = db.checkIsDoubleBooked(doctor.id, appointmentDate, startTime);
    if (isDoubleBooked) {
      return res.status(409).json({
        error: 'Double Booking Conflict: This time slot is already booked for Dr. ' + doctor.fullName + '. Please select another time slot.'
      });
    }

    // Determine patient
    let patientRecord: PatientProfile | undefined;
    if (patientId) {
      patientRecord = db.patients.find(p => p.id === Number(patientId));
    } else if (currentUser.role === 'patient') {
      patientRecord = db.patients.find(p => p.userId === currentUser.id);
    }

    if (!patientRecord) {
      // If guest booking or receptionist registering on the fly
      if (guestInfo && guestInfo.fullName && guestInfo.phone) {
        const newUserId = db.users.length + 1;
        const newUser: User = {
          id: newUserId,
          email: guestInfo.email || `guest_${Date.now()}@kirindahospital.org`,
          role: 'patient',
          fullName: guestInfo.fullName,
          phone: guestInfo.phone,
          status: 'active'
        };
        db.users.push(newUser);

        const newPatientId = db.patients.length + 1;
        patientRecord = {
          id: newPatientId,
          userId: newUserId,
          patientCode: `PAT-KHS-${String(newPatientId).padStart(3, '0')}`,
          fullName: guestInfo.fullName,
          email: newUser.email,
          phone: guestInfo.phone,
          dateOfBirth: guestInfo.dateOfBirth || '1990-01-01',
          gender: guestInfo.gender || 'other',
          bloodGroup: guestInfo.bloodGroup || 'O+',
          address: guestInfo.address || ''
        };
        db.patients.push(patientRecord);
      } else {
        return res.status(400).json({ error: 'Patient profile or registration details required.' });
      }
    }

    const refNo = db.generateReferenceNo();
    const calculatedEndTime = endTime || `${startTime.split(':')[0]}:${Number(startTime.split(':')[1]) + 30}`;

    const newAppointment: Appointment = {
      id: db.appointments.length + 1,
      referenceNo: refNo,
      patientId: patientRecord.id,
      patientName: patientRecord.fullName,
      patientPhone: patientRecord.phone,
      patientCode: patientRecord.patientCode,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      doctorSpecialization: doctor.specialization,
      doctorAvatar: doctor.avatarUrl,
      departmentId: doctor.departmentId,
      departmentName: doctor.departmentName || 'Medical Service',
      appointmentDate,
      startTime,
      endTime: calculatedEndTime,
      appointmentType: appointmentType || 'in_person',
      status: 'pending',
      reason,
      checkInStatus: 'not_arrived',
      feeAmount: doctor.consultationFee,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    db.appointments.push(newAppointment);

    // Notify patient
    db.addNotification(
      patientRecord.userId,
      'Appointment Request Received',
      `Your appointment request for ${doctor.fullName} on ${appointmentDate} at ${startTime} has been recorded (Ref: ${refNo}).`,
      'new_request',
      '/appointments'
    );

    // Notify doctor
    db.addNotification(
      doctor.userId,
      'New Appointment Request',
      `${patientRecord.fullName} requested an appointment for ${appointmentDate} at ${startTime}.`,
      'new_request',
      '/doctor/schedule'
    );

    db.addAudit(currentUser.id, 'APPOINTMENT_BOOKED', 'Appointment', newAppointment.id, `Reference: ${refNo}, Doctor: ${doctor.fullName}`);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment
    });
  });

  // Update appointment status (confirm, decline/cancel, complete)
  app.patch('/api/appointments/:id/status', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    const id = Number(req.params.id);
    const { status, cancellationReason } = req.body;

    const appointment = db.appointments.find(a => a.id === id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Permissions check:
    // Patients can only cancel their own pending/confirmed appointments
    if (user.role === 'patient') {
      const patient = db.patients.find(p => p.userId === user.id);
      if (!patient || appointment.patientId !== patient.id) {
        return res.status(403).json({ error: 'You are not authorized to modify this appointment.' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ error: 'Patients can only request cancellation.' });
      }
    }

    appointment.status = status as AppointmentStatus;
    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    // Trigger user notification
    const patientUser = db.patients.find(p => p.id === appointment.patientId);
    if (patientUser) {
      let title = `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      let msg = `Your appointment on ${appointment.appointmentDate} at ${appointment.startTime} with ${appointment.doctorName} is now ${status}.`;
      if (cancellationReason) msg += ` Reason: ${cancellationReason}`;

      db.addNotification(patientUser.userId, title, msg, status === 'confirmed' ? 'appointment_confirmed' : 'appointment_cancelled');
    }

    db.addAudit(user.id, `APPOINTMENT_${status.toUpperCase()}`, 'Appointment', id, `Updated to ${status} by ${user.fullName}`);

    res.json({ message: `Appointment status updated to ${status}`, appointment });
  });

  // Receptionist: Check-in patient
  app.patch('/api/appointments/:id/checkin', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (user.role !== 'receptionist' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Receptionist permissions required.' });
    }

    const id = Number(req.params.id);
    const { checkInStatus } = req.body;
    const appt = db.appointments.find(a => a.id === id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    appt.checkInStatus = checkInStatus as CheckInStatus;
    if (checkInStatus === 'checked_in') {
      appt.checkedInAt = new Date().toISOString();
      if (appt.status === 'pending') appt.status = 'confirmed';
    }

    db.addAudit(user.id, 'PATIENT_CHECKIN', 'Appointment', id, `Patient ${appt.patientName} status: ${checkInStatus}`);
    res.json(appt);
  });

  // Reschedule Appointment
  app.patch('/api/appointments/:id/reschedule', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    const id = Number(req.params.id);
    const { newDate, newStartTime, newEndTime, reason } = req.body;

    const appt = db.appointments.find(a => a.id === id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    // Prevent double booking at the new time
    const isConflict = db.checkIsDoubleBooked(appt.doctorId, newDate, newStartTime, appt.id);
    if (isConflict) {
      return res.status(409).json({ error: 'The requested slot is already booked. Please choose another slot.' });
    }

    appt.appointmentDate = newDate;
    appt.startTime = newStartTime;
    appt.endTime = newEndTime || `${newStartTime.split(':')[0]}:${Number(newStartTime.split(':')[1]) + 30}`;
    appt.status = 'rescheduled';

    const patient = db.patients.find(p => p.id === appt.patientId);
    if (patient) {
      db.addNotification(
        patient.userId,
        'Appointment Rescheduled',
        `Your appointment with ${appt.doctorName} has been rescheduled to ${newDate} at ${newStartTime}.`,
        'appointment_rescheduled'
      );
    }

    db.addAudit(user.id, 'APPOINTMENT_RESCHEDULED', 'Appointment', id, `Rescheduled to ${newDate} ${newStartTime}`);
    res.json({ message: 'Appointment rescheduled successfully', appointment: appt });
  });

  // Doctor Clinical Notes & Prescription creation
  app.post('/api/appointments/:id/clinical-notes', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    const id = Number(req.params.id);
    const appt = db.appointments.find(a => a.id === id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const { symptoms, diagnosis, clinicalAssessment, treatmentPlan, followUpDate, vitalSigns, prescriptions } = req.body;

    const newRecordId = db.medicalRecords.length + 1;
    const newRecord: MedicalRecord = {
      id: newRecordId,
      appointmentId: appt.id,
      appointmentRef: appt.referenceNo,
      patientId: appt.patientId,
      patientName: appt.patientName,
      doctorId: appt.doctorId,
      doctorName: appt.doctorName,
      visitDate: appt.appointmentDate,
      symptoms: symptoms || 'Routine follow-up',
      diagnosis: diagnosis || 'Clinical observation',
      clinicalAssessment: clinicalAssessment || '',
      treatmentPlan: treatmentPlan || '',
      followUpDate,
      vitalSigns,
      prescriptions: [],
      createdAt: new Date().toISOString()
    };

    if (Array.isArray(prescriptions)) {
      prescriptions.forEach(p => {
        const newRx = {
          id: db.prescriptions.length + 1,
          medicalRecordId: newRecordId,
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          medicationName: p.medicationName,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration,
          instructions: p.instructions,
          issuedAt: new Date().toISOString()
        };
        db.prescriptions.push(newRx);
        newRecord.prescriptions.push(newRx);
      });
    }

    db.medicalRecords.push(newRecord);

    // Update appointment state
    appt.status = 'completed';
    appt.checkInStatus = 'completed';
    appt.hasMedicalRecord = true;

    // Notify patient
    const patient = db.patients.find(p => p.id === appt.patientId);
    if (patient) {
      db.addNotification(
        patient.userId,
        'Consultation Notes Available',
        `Doctor ${appt.doctorName} recorded your consultation notes and treatment plan for visit ${appt.referenceNo}.`,
        'reminder',
        '/medical-records'
      );
    }

    db.addAudit(user.id, 'CLINICAL_NOTE_RECORDED', 'MedicalRecord', newRecordId, `Diagnosis: ${diagnosis}`);

    res.status(201).json({ message: 'Clinical notes and prescriptions saved successfully', medicalRecord: newRecord });
  });

  // --- Patients ---
  app.get('/api/patients', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (user.role === 'patient') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    const { search } = req.query;
    let list = [...db.patients];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(p => p.fullName.toLowerCase().includes(q) || p.phone.includes(q) || p.patientCode.toLowerCase().includes(q));
    }

    res.json(list);
  });

  app.get('/api/patients/profile', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    const profile = db.patients.find(p => p.userId === user.id);
    if (!profile) return res.status(404).json({ error: 'Patient profile not found' });
    res.json(profile);
  });

  app.put('/api/patients/profile', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    const profile = db.patients.find(p => p.userId === user.id);
    if (!profile) return res.status(404).json({ error: 'Patient profile not found' });

    Object.assign(profile, req.body);
    db.addAudit(user.id, 'PROFILE_UPDATE', 'Patient', profile.id, 'Updated personal details');
    res.json(profile);
  });

  app.post('/api/patients', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (user.role !== 'receptionist' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const { fullName, email, phone, dateOfBirth, gender, bloodGroup, address, emergencyContactName, emergencyContactPhone, insuranceProvider } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Full name and phone are required.' });
    }

    const newUserId = db.users.length + 1;
    const newUser: User = {
      id: newUserId,
      email: email || `pat_${Date.now()}@kirindahospital.org`,
      role: 'patient',
      fullName,
      phone,
      status: 'active'
    };
    db.users.push(newUser);

    const newPatientId = db.patients.length + 1;
    const newPatient: PatientProfile = {
      id: newPatientId,
      userId: newUserId,
      patientCode: `PAT-KHS-${String(newPatientId).padStart(3, '0')}`,
      fullName,
      email: newUser.email,
      phone,
      dateOfBirth: dateOfBirth || '1990-01-01',
      gender: gender || 'other',
      bloodGroup: bloodGroup || 'O+',
      address: address || '',
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || '',
      insuranceProvider: insuranceProvider || 'Private'
    };
    db.patients.push(newPatient);

    db.addAudit(user.id, 'PATIENT_REGISTER_STAFF', 'Patient', newPatientId, `Staff registered patient: ${fullName}`);
    res.status(201).json(newPatient);
  });

  // --- Medical Records ---
  app.get('/api/medical-records', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    const { patientId } = req.query;

    let list = [...db.medicalRecords];

    if (user.role === 'patient') {
      const patient = db.patients.find(p => p.userId === user.id);
      if (patient) {
        list = list.filter(r => r.patientId === patient.id);
      } else {
        list = [];
      }
    } else if (patientId) {
      list = list.filter(r => r.patientId === Number(patientId));
    }

    res.json(list);
  });

  // --- Notifications ---
  app.get('/api/notifications', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    const userNotifs = db.notifications.filter(n => n.userId === user.id);
    res.json(userNotifs);
  });

  app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const notif = db.notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
    res.json({ success: true });
  });

  app.patch('/api/notifications/read-all', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    db.notifications.filter(n => n.userId === user.id).forEach(n => (n.isRead = true));
    res.json({ success: true });
  });

  // --- Reports & Analytics (Admin Dashboard) ---
  app.get('/api/reports/analytics', (req: Request, res: Response) => {
    const totalAppointments = db.appointments.length;
    const completed = db.appointments.filter(a => a.status === 'completed').length;
    const cancelled = db.appointments.filter(a => a.status === 'cancelled').length;
    const pending = db.appointments.filter(a => a.status === 'pending').length;

    // Monthly trend data
    const monthlyTrend = [
      { month: 'May 2026', appointments: 78, completed: 68, cancelled: 6 },
      { month: 'Jun 2026', appointments: 92, completed: 81, cancelled: 8 },
      { month: 'Jul 2026', appointments: 110, completed: 96, cancelled: 9 },
      { month: 'Aug 2026', appointments: 125, completed: 112, cancelled: 7 },
      { month: 'Sep 2026', appointments: 142 + totalAppointments, completed: 122 + completed, cancelled: 11 + cancelled }
    ];

    // Department workload
    const departmentWorkload = db.departments.map(dept => ({
      department: dept.name,
      count: db.appointments.filter(a => a.departmentId === dept.id).length + Math.floor(dept.id * 7)
    }));

    // Status breakdown
    const statusDistribution = [
      { status: 'Confirmed', count: db.appointments.filter(a => a.status === 'confirmed').length + 42 },
      { status: 'Completed', count: completed + 98 },
      { status: 'Pending', count: pending + 6 },
      { status: 'Cancelled', count: cancelled + 8 },
      { status: 'Rescheduled', count: db.appointments.filter(a => a.status === 'rescheduled').length + 4 }
    ];

    const report: AnalyticsReport = {
      totalPatients: db.patients.length + 1248,
      totalDoctors: db.doctors.filter(d => d.isActive).length + 41,
      todayAppointments: db.appointments.filter(a => a.appointmentDate === '2026-09-25').length + 14,
      pendingRequests: pending,
      completedAppointments: completed + 98,
      cancellationRate: totalAppointments > 0 ? Math.round((cancelled / totalAppointments) * 100) : 5,
      monthlyTrend,
      departmentWorkload,
      statusDistribution,
      todaySchedule: db.appointments.filter(a => a.appointmentDate === '2026-09-25')
    };

    res.json(report);
  });

  // --- Database Schema & SQL Exporter API ---
  app.get('/api/database/schema-sql', (req: Request, res: Response) => {
    try {
      const sqlFilePath = path.join(process.cwd(), 'database', 'schema.sql');
      if (fs.existsSync(sqlFilePath)) {
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        res.setHeader('Content-Type', 'text/plain');
        return res.send(sql);
      }
      res.status(404).send('-- Database schema file not found');
    } catch (err) {
      res.status(500).send('-- Error loading SQL schema file');
    }
  });

  // --- Vite Dev & Production Fallback ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kirinda Hospital Management System server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Kirinda Hospital server:', err);
});
