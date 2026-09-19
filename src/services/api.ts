import {
  User,
  PatientProfile,
  Department,
  Doctor,
  DoctorAvailability,
  Appointment,
  MedicalRecord,
  NotificationItem,
  AnalyticsReport
} from '../types';

class ApiService {
  private currentUserId: number = 7; // Default to Patient John Habimana for user-friendly testing

  setCurrentUserId(id: number) {
    this.currentUserId = id;
  }

  getCurrentUserId(): number {
    return this.currentUserId;
  }

  private async fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': String(this.currentUserId),
      ...(options.headers as Record<string, string> || {})
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = await res.text() || res.statusText;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // Auth
  async getMe(): Promise<{ user: User; patient?: PatientProfile; doctor?: Doctor }> {
    return this.fetchJson('/api/auth/me');
  }

  async login(email: string, password?: string): Promise<{ user: User; patient?: PatientProfile; doctor?: Doctor }> {
    const data = await this.fetchJson<{ user: User; patient?: PatientProfile; doctor?: Doctor }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }
    );
    this.currentUserId = data.user.id;
    return data;
  }

  async register(patientData: Partial<PatientProfile> & { password?: string }): Promise<{ user: User; patient: PatientProfile }> {
    const data = await this.fetchJson<{ user: User; patient: PatientProfile }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(patientData)
      }
    );
    this.currentUserId = data.user.id;
    return data;
  }

  async switchDemoRole(role: string, specificEmail?: string): Promise<{ user: User; patient?: PatientProfile; doctor?: Doctor }> {
    const data = await this.fetchJson<{ user: User; patient?: PatientProfile; doctor?: Doctor }>(
      '/api/auth/switch-demo',
      {
        method: 'POST',
        body: JSON.stringify({ role, specificEmail })
      }
    );
    this.currentUserId = data.user.id;
    return data;
  }

  // Departments
  async getDepartments(activeOnly = true): Promise<Department[]> {
    return this.fetchJson(`/api/departments?active=${activeOnly}`);
  }

  async createDepartment(dept: Partial<Department>): Promise<Department> {
    return this.fetchJson('/api/departments', {
      method: 'POST',
      body: JSON.stringify(dept)
    });
  }

  async updateDepartment(id: number, dept: Partial<Department>): Promise<Department> {
    return this.fetchJson(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dept)
    });
  }

  // Doctors
  async getDoctors(filters?: { departmentId?: number; search?: string; consultationType?: string; activeOnly?: boolean }): Promise<Doctor[]> {
    const params = new URLSearchParams();
    if (filters?.departmentId) params.append('departmentId', String(filters.departmentId));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.consultationType) params.append('consultationType', filters.consultationType);
    if (filters?.activeOnly !== undefined) params.append('activeOnly', String(filters.activeOnly));

    return this.fetchJson(`/api/doctors?${params.toString()}`);
  }

  async getDoctor(id: number): Promise<Doctor & { availability: DoctorAvailability[] }> {
    return this.fetchJson(`/api/doctors/${id}`);
  }

  async createDoctor(doc: any): Promise<Doctor> {
    return this.fetchJson('/api/doctors', {
      method: 'POST',
      body: JSON.stringify(doc)
    });
  }

  async updateDoctor(id: number, doc: Partial<Doctor>): Promise<Doctor> {
    return this.fetchJson(`/api/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doc)
    });
  }

  async updateDoctorAvailability(doctorId: number, availability: Partial<DoctorAvailability>[]): Promise<any> {
    return this.fetchJson(`/api/doctors/${doctorId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ availability })
    });
  }

  // Appointments
  async getAvailableSlots(doctorId: number, date: string): Promise<{ doctorId: number; date: string; slots: { time: string; endTime: string; isAvailable: boolean; reason?: string }[] }> {
    return this.fetchJson(`/api/appointments/available-slots?doctorId=${doctorId}&date=${date}`);
  }

  async getAppointments(filters?: { status?: string; date?: string; doctorId?: number; patientId?: number }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.doctorId) params.append('doctorId', String(filters.doctorId));
    if (filters?.patientId) params.append('patientId', String(filters.patientId));

    return this.fetchJson(`/api/appointments?${params.toString()}`);
  }

  async bookAppointment(payload: {
    doctorId: number;
    departmentId?: number;
    appointmentDate: string;
    startTime: string;
    endTime?: string;
    appointmentType: 'in_person' | 'telemedicine';
    reason: string;
    patientId?: number;
    guestInfo?: any;
  }): Promise<{ message: string; appointment: Appointment }> {
    return this.fetchJson('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateAppointmentStatus(id: number, status: string, cancellationReason?: string): Promise<{ message: string; appointment: Appointment }> {
    return this.fetchJson(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, cancellationReason })
    });
  }

  async checkInPatient(id: number, checkInStatus: string): Promise<Appointment> {
    return this.fetchJson(`/api/appointments/${id}/checkin`, {
      method: 'PATCH',
      body: JSON.stringify({ checkInStatus })
    });
  }

  async rescheduleAppointment(id: number, newDate: string, newStartTime: string, reason?: string): Promise<{ message: string; appointment: Appointment }> {
    return this.fetchJson(`/api/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ newDate, newStartTime, reason })
    });
  }

  async saveClinicalNotes(appointmentId: number, data: {
    symptoms: string;
    diagnosis: string;
    clinicalAssessment: string;
    treatmentPlan: string;
    followUpDate?: string;
    vitalSigns?: any;
    prescriptions: Array<{ medicationName: string; dosage: string; frequency: string; duration: string; instructions: string }>;
  }): Promise<{ message: string; medicalRecord: MedicalRecord }> {
    return this.fetchJson(`/api/appointments/${appointmentId}/clinical-notes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Patients
  async getPatients(search?: string): Promise<PatientProfile[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.fetchJson(`/api/patients${q}`);
  }

  async getPatientProfile(): Promise<PatientProfile> {
    return this.fetchJson('/api/patients/profile');
  }

  async updatePatientProfile(profile: Partial<PatientProfile>): Promise<PatientProfile> {
    return this.fetchJson('/api/patients/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }

  async registerPatientByStaff(data: any): Promise<PatientProfile> {
    return this.fetchJson('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Medical Records
  async getMedicalRecords(patientId?: number): Promise<MedicalRecord[]> {
    const q = patientId ? `?patientId=${patientId}` : '';
    return this.fetchJson(`/api/medical-records${q}`);
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return this.fetchJson('/api/notifications');
  }

  async markNotificationRead(id: number): Promise<{ success: boolean }> {
    return this.fetchJson(`/api/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.fetchJson('/api/notifications/read-all', { method: 'PATCH' });
  }

  // Analytics & Reports
  async getAnalytics(): Promise<AnalyticsReport> {
    return this.fetchJson('/api/reports/analytics');
  }

  // Raw Database Schema SQL
  async getDatabaseSchemaSql(): Promise<string> {
    const res = await fetch('/api/database/schema-sql');
    return res.text();
  }
}

export const api = new ApiService();
