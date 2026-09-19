import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Stethoscope,
  Pill,
  Activity,
  Edit2,
  Check,
  ChevronRight
} from 'lucide-react';
import { Appointment, Doctor, DoctorAvailability, User, PatientProfile } from '../../types';
import { api } from '../../services/api';

interface DoctorDashboardProps {
  currentUser: User;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'availability' | 'patients'>('schedule');
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Clinical Notes Modal State
  const [clinicalModalAppt, setClinicalModalAppt] = useState<Appointment | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalAssessment, setClinicalAssessment] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [prescriptions, setPrescriptions] = useState<Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>>([
    { medicationName: '', dosage: '', frequency: 'Twice daily after meals', duration: '5 days', instructions: 'Take with plenty of water' }
  ]);
  const [savingNotes, setSavingNotes] = useState(false);

  // Decline Modal State
  const [declineModalAppt, setDeclineModalAppt] = useState<Appointment | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    loadDoctorData();
  }, [currentUser.id]);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const meData = await api.getMe();
      if (meData.doctor) {
        setDoctorProfile(meData.doctor);
        const [appts, docDetails, pts] = await Promise.all([
          api.getAppointments({ doctorId: meData.doctor.id }),
          api.getDoctor(meData.doctor.id),
          api.getPatients()
        ]);
        setAppointments(appts);
        setAvailability(docDetails.availability || []);
        setPatients(pts);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId: number, newStatus: string, reason?: string) => {
    try {
      await api.updateAppointmentStatus(apptId, newStatus, reason);
      setSuccessMsg(`Appointment status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadDoctorData();
    } catch (err: any) {
      setError(err.message || 'Failed to update appointment');
    }
  };

  const handleSaveClinicalNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalModalAppt || !diagnosis || !symptoms) {
      setError('Please provide at least primary diagnosis and symptoms.');
      return;
    }

    try {
      setSavingNotes(true);
      await api.saveClinicalNotes(clinicalModalAppt.id, {
        symptoms,
        diagnosis,
        clinicalAssessment: clinicalAssessment || 'Physical examination completed.',
        treatmentPlan: treatmentPlan || 'Follow prescription guidelines.',
        prescriptions: prescriptions.filter(p => p.medicationName.trim() !== '')
      });

      setSuccessMsg(`Clinical notes & prescription logged successfully. Appointment marked completed.`);
      setClinicalModalAppt(null);
      setTimeout(() => setSuccessMsg(null), 4000);
      loadDoctorData();
    } catch (err: any) {
      setError(err.message || 'Failed to save clinical notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!doctorProfile) return;
    try {
      setLoading(true);
      await api.updateDoctorAvailability(doctorProfile.id, availability);
      setSuccessMsg('Working hours and slot rules updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medicationName: '', dosage: '', frequency: 'Twice daily', duration: '7 days', instructions: '' }
    ]);
  };

  const removePrescriptionRow = (idx: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={doctorProfile?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
          />
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Doctor Schedule & Consultation Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{doctorProfile?.fullName || currentUser.fullName}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {doctorProfile?.specialization} • Room {doctorProfile?.roomNumber} • License: {doctorProfile?.licenseNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Duty Status: Active & Available
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Assigned Consultations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{appointments.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-amber-600">Pending Patient Requests</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600">Confirmed Appointments</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{confirmedCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-blue-600">Completed Encounters</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-blue-600 text-blue-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Consultation Schedule & Requests ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`py-4 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'availability'
                ? 'border-blue-600 text-blue-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Working Hours & Slot Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`py-4 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'patients'
                ? 'border-blue-600 text-blue-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Patient Register ({patients.length})</span>
          </button>
        </div>

        {/* Tab 1: Schedule */}
        {activeTab === 'schedule' && (
          <div className="p-6 space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Filter by status:</span>
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No appointments matched the current filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    id={`doc-appt-card-${appt.id}`}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {appt.patientName ? appt.patientName.charAt(0) : 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{appt.patientName}</span>
                            <span className="font-mono text-[11px] text-slate-400 font-normal">
                              ({appt.referenceNo})
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              appt.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              appt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {appt.status}
                            </span>
                            {appt.checkInStatus === 'checked_in' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                Arrived / In Waiting Area
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Phone: {appt.patientPhone || 'N/A'} • Type: <strong className="capitalize">{appt.appointmentType.replace('_', ' ')}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-xs font-bold text-slate-800">{appt.appointmentDate}</div>
                        <div className="text-xs font-semibold text-blue-700">{appt.startTime} - {appt.endTime}</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-600 border border-slate-100">
                      <strong>Patient Note / Reason:</strong> {appt.reason}
                      {appt.cancellationReason && (
                        <div className="text-rose-600 font-semibold mt-1">
                          Cancellation reason: {appt.cancellationReason}
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      {appt.status === 'pending' && (
                        <>
                          <button
                            id={`accept-appt-btn-${appt.id}`}
                            onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Request</span>
                          </button>

                          <button
                            onClick={() => {
                              setDeclineModalAppt(appt);
                              setDeclineReason('');
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs px-3 py-1.5 rounded-lg"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {appt.status === 'confirmed' && (
                        <button
                          id={`record-clinical-btn-${appt.id}`}
                          onClick={() => {
                            setClinicalModalAppt(appt);
                            setSymptoms('');
                            setDiagnosis('');
                            setClinicalAssessment('');
                            setTreatmentPlan('');
                            setPrescriptions([
                              { medicationName: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: '' }
                            ]);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Record Clinical Notes & Prescribe</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Availability Schedule Editor */}
        {activeTab === 'availability' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Clinical Schedule & Slot Configuration</h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure your active consulting days, office hours, break times, and slot duration. Patients will only be permitted to book within these valid intervals.
              </p>
            </div>

            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayName, idx) => {
                const dayNum = (idx + 1) % 7; // Monday=1 ... Sunday=0
                const avail = availability.find(a => String(a.dayOfWeek) === String(dayNum) || a.dayOfWeek === dayName) || {
                  id: 0,
                  doctorId: doctorProfile?.id || 0,
                  dayOfWeek: dayName as any,
                  startTime: '08:30',
                  endTime: '16:30',
                  breakStartTime: '12:00',
                  breakEndTime: '13:00',
                  slotDurationMinutes: 30,
                  isAvailable: dayNum >= 1 && dayNum <= 5
                };

                const updateDay = (field: keyof DoctorAvailability, val: any) => {
                  const existingIdx = availability.findIndex(a => String(a.dayOfWeek) === String(dayNum) || a.dayOfWeek === dayName);
                  const updated = [...availability];
                  if (existingIdx >= 0) {
                    updated[existingIdx] = { ...updated[existingIdx], [field]: val };
                  } else {
                    updated.push({ ...avail, [field]: val } as any);
                  }
                  setAvailability(updated);
                };

                return (
                  <div
                    key={dayName}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-colors ${
                      avail.isAvailable ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="w-32 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`check-day-${dayNum}`}
                        checked={avail.isAvailable}
                        onChange={(e) => updateDay('isAvailable', e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`check-day-${dayNum}`} className="font-bold text-slate-900 cursor-pointer">
                        {dayName}
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Work Start</span>
                        <input
                          type="time"
                          value={avail.startTime}
                          disabled={!avail.isAvailable}
                          onChange={(e) => updateDay('startTime', e.target.value)}
                          className="px-2 py-1 rounded border border-slate-300 font-mono"
                        />
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Work End</span>
                        <input
                          type="time"
                          value={avail.endTime}
                          disabled={!avail.isAvailable}
                          onChange={(e) => updateDay('endTime', e.target.value)}
                          className="px-2 py-1 rounded border border-slate-300 font-mono"
                        />
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Break Start</span>
                        <input
                          type="time"
                          value={avail.breakStartTime || ''}
                          disabled={!avail.isAvailable}
                          onChange={(e) => updateDay('breakStartTime', e.target.value)}
                          className="px-2 py-1 rounded border border-slate-300 font-mono"
                        />
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Break End</span>
                        <input
                          type="time"
                          value={avail.breakEndTime || ''}
                          disabled={!avail.isAvailable}
                          onChange={(e) => updateDay('breakEndTime', e.target.value)}
                          className="px-2 py-1 rounded border border-slate-300 font-mono"
                        />
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Slot Length</span>
                        <select
                          value={avail.slotDurationMinutes}
                          disabled={!avail.isAvailable}
                          onChange={(e) => updateDay('slotDurationMinutes', Number(e.target.value))}
                          className="px-2 py-1 rounded border border-slate-300"
                        >
                          <option value="15">15 min</option>
                          <option value="20">20 min</option>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">60 min</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSaveAvailability}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Weekly Availability Rules</span>
            </button>
          </div>
        )}

        {/* Tab 3: Patients */}
        {activeTab === 'patients' && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{p.fullName}</div>
                  <div className="text-slate-500">MRN: {p.medicalRecordNumber || p.patientCode}</div>
                  <div className="text-slate-500">Phone: {p.phone}</div>
                  <div className="text-slate-500">Blood Group: <strong>{p.bloodGroup}</strong></div>
                  <div className="text-slate-500">Emergency: {p.emergencyContactName || 'None recorded'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Notes & Prescription Modal */}
      {clinicalModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Medical Encounter Record
                </div>
                <h3 className="text-lg font-bold">
                  Consultation Notes: {clinicalModalAppt.patientName}
                </h3>
              </div>
              <button
                onClick={() => setClinicalModalAppt(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClinicalNotes} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Pharyngitis, Hypertension Stage 1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reported Symptoms *</label>
                  <input
                    type="text"
                    required
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Sore throat, dry cough, fever for 3 days"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Assessment & Examination</label>
                <textarea
                  rows={2}
                  value={clinicalAssessment}
                  onChange={(e) => setClinicalAssessment(e.target.value)}
                  placeholder="e.g. Throat erythematous without exudate. Lungs clear to auscultation..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Treatment Plan & Follow-up</label>
                <textarea
                  rows={2}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="e.g. Hydration, warm saline gargles, review in 5 days if fever persists."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Prescriptions Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    Prescription Orders
                  </span>
                  <button
                    type="button"
                    onClick={addPrescriptionRow}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medication
                  </button>
                </div>

                <div className="space-y-2">
                  {prescriptions.map((px, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Medication name (e.g. Amoxicillin)"
                            value={px.medicationName}
                            onChange={(e) => {
                              const copy = [...prescriptions];
                              copy[idx].medicationName = e.target.value;
                              setPrescriptions(copy);
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Dosage (500mg)"
                            value={px.dosage}
                            onChange={(e) => {
                              const copy = [...prescriptions];
                              copy[idx].dosage = e.target.value;
                              setPrescriptions(copy);
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Duration (7 days)"
                            value={px.duration}
                            onChange={(e) => {
                              const copy = [...prescriptions];
                              copy[idx].duration = e.target.value;
                              setPrescriptions(copy);
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removePrescriptionRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Instructions (e.g. Take 1 tablet twice daily after food)"
                        value={px.instructions}
                        onChange={(e) => {
                          const copy = [...prescriptions];
                          copy[idx].instructions = e.target.value;
                          setPrescriptions(copy);
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClinicalModalAppt(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNotes}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs"
                >
                  {savingNotes ? 'Saving & Finalizing...' : 'Save Notes & Complete Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-600">Decline Appointment Request</h3>
            <p className="text-xs text-slate-600">
              Provide a reason for declining the appointment with {declineModalAppt.patientName}. The patient will receive this reason in their notification inbox.
            </p>
            <textarea
              rows={2}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Emergency surgery scheduled, outside clinical scope..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeclineModalAppt(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(declineModalAppt.id, 'cancelled', declineReason);
                  setDeclineModalAppt(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
