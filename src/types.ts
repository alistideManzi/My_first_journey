export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin' | 'super_admin';

export type AppointmentStatus = 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show';

export type CheckInStatus = 'not_arrived' | 'checked_in' | 'in_consultation' | 'completed';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  fullName: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientProfile {
  id: number;
  userId: number;
  patientCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  medicalRecordNumber?: string;
  allergies?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
  headOfDepartment: string;
  floorLocation: string;
  phoneExtension: string;
  isActive: boolean;
  doctorCount?: number;
}

export interface Doctor {
  id: number;
  userId: number;
  departmentId: number;
  departmentName?: string;
  doctorCode: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  consultationFee: number;
  roomNumber: string;
  consultationType: 'in_person' | 'telemedicine' | 'both';
  languages: string;
  licenseNumber: string;
  bio: string;
  rating: number;
  isVerified: boolean;
  isActive: boolean;
}

export interface DoctorAvailability {
  id: number;
  doctorId: number;
  dayOfWeek: number | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // e.g. "08:30"
  endTime: string;   // e.g. "16:30"
  breakStart?: string;
  breakEnd?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  slotDurationMinutes: number;
  isAvailable: boolean;
}

export interface Appointment {
  id: number;
  referenceNo: string;
  patientId: number;
  patientName: string;
  patientPhone: string;
  patientCode?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string;
  doctorAvatar?: string;
  departmentId: number;
  departmentName: string;
  appointmentDate: string; // "YYYY-MM-DD"
  startTime: string;      // "10:30"
  endTime: string;        // "11:00"
  appointmentType: 'in_person' | 'telemedicine';
  status: AppointmentStatus;
  reason: string;
  cancellationReason?: string;
  checkInStatus: CheckInStatus;
  checkedInAt?: string;
  feeAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  hasMedicalRecord?: boolean;
}

export interface MedicalRecord {
  id: number;
  recordNumber?: string;
  appointmentId: number;
  appointmentRef?: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  clinicalAssessment: string;
  treatmentPlan: string;
  followUpDate?: string;
  vitalSigns?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    weightKg?: number;
  };
  prescriptions: Prescription[];
  createdAt: string;
}

export interface Prescription {
  id: number;
  medicalRecordId?: number;
  patientId: number;
  doctorId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  issuedAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_rescheduled' | 'new_request' | 'reminder' | 'announcement';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsReport {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  totalAppointments?: number;
  pendingRequests: number;
  pendingAppointments?: number;
  completedAppointments: number;
  cancellationRate: number;
  monthlyTrend: { month: string; appointments: number; completed: number; cancelled: number }[];
  monthlyTrends?: { month: string; appointments: number; completed: number; cancelled: number }[];
  departmentWorkload: { department: string; count: number }[];
  departmentDistribution?: { departmentName: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  todaySchedule: Appointment[];
}
