import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User as UserIcon,
  FileText,
  Bell,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Pill,
  Printer,
  Heart,
  Edit2,
  Save,
  ChevronRight,
  RefreshCw,
  Phone,
  Video
} from 'lucide-react';
import { Appointment, MedicalRecord, PatientProfile, User, NotificationItem } from '../../types';
import { api } from '../../services/api';

interface PatientDashboardProps {
  currentUser: User;
  onOpenBooking: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  onOpenBooking
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'records' | 'profile' | 'notifications'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cancellation Modal state
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Profile Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appts, records, prof, notifs] = await Promise.all([
        api.getAppointments(),
        api.getMedicalRecords(),
        api.getPatientProfile().catch(() => null),
        api.getNotifications()
      ]);
      setAppointments(appts);
      setMedicalRecords(records);
      setNotifications(notifs);

      if (prof) {
        setProfile(prof);
        setPhone(prof.phone || '');
        setBloodGroup(prof.bloodGroup || 'O+');
        setEmergencyName(prof.emergencyContactName || '');
        setEmergencyPhone(prof.emergencyContactPhone || '');
        setAllergies(prof.allergies || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patient dashboard records');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalAppt) return;
    try {
      setCancelling(true);
      await api.updateAppointmentStatus(cancelModalAppt.id, 'cancelled', cancelReason);
      setCancelModalAppt(null);
      setCancelReason('');
      await loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await api.updatePatientProfile({
        phone,
        bloodGroup,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        allergies
      });
      setProfile(updated);
      setIsEditingProfile(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Confirmed</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending Review</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const upcomingCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Patient Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
              Kirinda Patient Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{currentUser.fullName}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              MRN: {profile?.medicalRecordNumber || profile?.patientCode || 'MRN-KIR-2026-001'} | Blood Group: {profile?.bloodGroup || 'O+'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="patient-book-new-appt-btn"
            onClick={onOpenBooking}
            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Upcoming Appointments</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{upcomingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Completed Consultations</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{completedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Prescription Records</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{medicalRecords.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-4 px-3 sm:px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'appointments'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Appointments ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`py-4 px-3 sm:px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'records'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Medical Records & Prescriptions ({medicalRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-3 sm:px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Personal & Medical Details</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-3 sm:px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'notifications'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts & Notifications ({notifications.length})</span>
          </button>
        </div>

        {/* Tab 1: Appointments */}
        {activeTab === 'appointments' && (
          <div className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                No appointment history found.
                <div className="mt-3">
                  <button
                    onClick={onOpenBooking}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg"
                  >
                    Book Your First Appointment
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    id={`patient-appt-${appt.id}`}
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {appt.referenceNo}
                          </span>
                          {getStatusBadge(appt.status)}
                          <span className="text-xs text-slate-500 capitalize">
                            • {appt.appointmentType.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5">
                          {appt.doctorName}
                        </h3>
                        <p className="text-xs text-emerald-700 font-medium">{appt.departmentName}</p>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-xs text-slate-400">Date & Slot</div>
                        <div className="text-sm font-bold text-slate-900">{appt.appointmentDate}</div>
                        <div className="text-xs font-semibold text-emerald-700">{appt.startTime} - {appt.endTime}</div>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-700">Purpose:</span> {appt.reason}
                        {appt.cancellationReason && (
                          <div className="text-rose-600 mt-0.5">
                            <strong>Cancelled:</strong> {appt.cancellationReason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <button
                            id={`cancel-appt-btn-${appt.id}`}
                            onClick={() => {
                              setCancelModalAppt(appt);
                              setCancelReason('');
                            }}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Cancel Appointment
                          </button>
                        )}

                        <button
                          onClick={() => window.print()}
                          className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Medical Records */}
        {activeTab === 'records' && (
          <div className="p-6 space-y-6">
            {medicalRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                No medical records logged yet. Once you complete a consultation with your doctor, summary notes and prescriptions will appear here.
              </div>
            ) : (
              <div className="space-y-6">
                {medicalRecords.map((rec) => (
                  <div key={rec.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                          Official Clinical Record #{rec.recordNumber || rec.id}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          {rec.diagnosis}
                        </h3>
                        <div className="text-xs text-slate-500">
                          Examining Physician: <strong>{rec.doctorName}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400">Consultation Date</div>
                        <div className="text-xs font-bold text-slate-800">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Reported Symptoms:</span>
                        <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                          {rec.symptoms}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Clinical Assessment:</span>
                        <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                          {rec.clinicalAssessment}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 text-xs block mb-1">Treatment Plan:</span>
                      <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                        {rec.treatmentPlan}
                      </p>
                    </div>

                    {/* Prescriptions */}
                    {rec.prescriptions && rec.prescriptions.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                          <Pill className="w-4 h-4 text-emerald-600" />
                          Prescribed Medications ({rec.prescriptions.length})
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {rec.prescriptions.map((px) => (
                            <div key={px.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                              <div className="font-bold text-slate-900">{px.medicationName}</div>
                              <div className="text-emerald-700 font-semibold">{px.dosage} • {px.frequency}</div>
                              <div className="text-slate-500 text-[11px] mt-1">Duration: {px.duration}</div>
                              <div className="text-slate-600 text-[11px] italic mt-0.5">Instructions: {px.instructions}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Personal & Medical Profile */}
        {activeTab === 'profile' && (
          <div className="p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Personal & Emergency Contact Details</h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.fullName}
                    className="w-full px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    disabled={!isEditingProfile}
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Known Allergies / Chronic Conditions</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin allergy, Mild asthma"
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              {isEditingProfile && (
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              )}
            </form>
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === 'notifications' && (
          <div className="p-6">
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border text-xs transition-colors ${
                    n.isRead ? 'bg-white border-slate-200' : 'bg-emerald-50/60 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {cancelModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertCircle className="w-5 h-5" />
              <span>Cancel Appointment</span>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your appointment with <strong>{cancelModalAppt.doctorName}</strong> on {cancelModalAppt.appointmentDate} ({cancelModalAppt.startTime})?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation (Required by hospital policy)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Work commitment conflict, symptom improved..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalAppt(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Keep Appointment
              </button>
              <button
                disabled={cancelling || !cancelReason.trim()}
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
