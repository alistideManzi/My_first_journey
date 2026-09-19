import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Stethoscope,
  Building2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Video,
  MapPin,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Department, Doctor, Appointment, User } from '../types';
import { api } from '../services/api';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  initialDoctorId?: number;
  initialDepartmentId?: number;
  onAppointmentCreated?: (appointment: Appointment) => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialDoctorId,
  initialDepartmentId,
  onAppointmentCreated
}) => {
  const [step, setStep] = useState<number>(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(initialDepartmentId);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(initialDoctorId);
  const [appointmentDate, setAppointmentDate] = useState<string>('2026-09-25');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in_person' | 'telemedicine'>('in_person');
  const [reason, setReason] = useState<string>('');
  const [visitCategory, setVisitCategory] = useState<string>('Follow-up / Routine');

  // Slots fetched from server
  const [availableSlots, setAvailableSlots] = useState<{ time: string; endTime: string; isAvailable: boolean; reason?: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Confirmed booking response
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (initialDepartmentId) setSelectedDepartmentId(initialDepartmentId);
      if (initialDoctorId) {
        setSelectedDoctorId(initialDoctorId);
        setStep(3); // Jump directly to Date selection if doctor was pre-selected
      } else {
        setStep(1);
      }
      setConfirmedAppointment(null);
      setError(null);
    }
  }, [isOpen, initialDoctorId, initialDepartmentId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [deptData, docData] = await Promise.all([
        api.getDepartments(),
        api.getDoctors()
      ]);
      setDepartments(deptData);
      setDoctors(docData);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking choices');
    } finally {
      setLoading(false);
    }
  };

  // Fetch server-validated slots whenever Doctor and Date are selected
  useEffect(() => {
    if (selectedDoctorId && appointmentDate) {
      loadSlots(selectedDoctorId, appointmentDate);
    }
  }, [selectedDoctorId, appointmentDate]);

  const loadSlots = async (docId: number, date: string) => {
    try {
      setSlotsLoading(true);
      setSelectedSlot(null);
      const res = await api.getAvailableSlots(docId, date);
      setAvailableSlots(res.slots || []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  // Filter doctors by selected department
  const filteredDoctors = selectedDepartmentId
    ? doctors.filter(doc => doc.departmentId === selectedDepartmentId)
    : doctors;

  // Handle final submission
  const handleConfirmBooking = async () => {
    if (!selectedDoctorId || !appointmentDate || !selectedSlot || !reason) {
      setError('Please provide all appointment details and reason for visit.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const slotObj = availableSlots.find(s => s.time === selectedSlot);
      const res = await api.bookAppointment({
        doctorId: selectedDoctorId,
        departmentId: selectedDepartmentId || selectedDoctor?.departmentId,
        appointmentDate,
        startTime: selectedSlot,
        endTime: slotObj?.endTime,
        appointmentType,
        reason: `[${visitCategory}] ${reason}`
      });

      setConfirmedAppointment(res.appointment);
      setStep(7); // Jump to Confirmation receipt!
      if (onAppointmentCreated) {
        onAppointmentCreated(res.appointment);
      }
    } catch (err: any) {
      setError(err.message || 'Booking conflict encountered. Please try another slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header with Step Tracker */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
              Kirinda Hospital Online Booking
            </div>
            <h2 className="text-xl font-bold">
              {step === 7 ? 'Booking Confirmed' : `Step ${step} of 6: ${
                step === 1 ? 'Select Department' :
                step === 2 ? 'Select Healthcare Specialist' :
                step === 3 ? 'Choose Date' :
                step === 4 ? 'Select Available Time Slot' :
                step === 5 ? 'Reason & Visit Details' :
                'Confirm & Review Appointment'
              }`}
            </h2>
          </div>

          <button
            id="close-booking-modal-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Step Indicator */}
        {step < 7 && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              {[
                { num: 1, label: 'Department' },
                { num: 2, label: 'Doctor' },
                { num: 3, label: 'Date' },
                { num: 4, label: 'Time' },
                { num: 5, label: 'Details' },
                { num: 6, label: 'Review' }
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step === s.num
                        ? 'bg-emerald-600 text-white'
                        : step > s.num
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span className={`hidden sm:inline ${step === s.num ? 'text-emerald-700 font-bold' : ''}`}>
                    {s.label}
                  </span>
                  {s.num < 6 && <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:inline" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Select Department */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                Choose the clinical department relevant to your health needs.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    id={`dept-option-${dept.id}`}
                    onClick={() => {
                      setSelectedDepartmentId(dept.id);
                      setSelectedDoctorId(undefined);
                      setStep(2);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 hover:border-emerald-500 hover:shadow-sm ${
                      selectedDepartmentId === dept.id
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{dept.name}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description}</div>
                      <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
                        <span>Floor: {dept.floorLocation}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Select an available physician in <strong>{selectedDepartment?.name}</strong>:
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change Department
                </button>
              </div>

              {filteredDoctors.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
                  No active doctors currently assigned to this department.
                  <div className="mt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="text-emerald-600 font-medium hover:underline text-xs"
                    >
                      Choose another department
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredDoctors.map((doc) => (
                    <div
                      key={doc.id}
                      id={`doctor-card-${doc.id}`}
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setStep(3);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-emerald-500 hover:shadow-md ${
                        selectedDoctorId === doc.id
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.fullName}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900 text-sm truncate">{doc.fullName}</span>
                            <span title="Verified Hospital Specialist">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            </span>
                          </div>
                          <div className="text-xs text-emerald-700 font-medium">{doc.specialization}</div>
                          <div className="text-[11px] text-slate-500 mt-1 truncate">{doc.qualifications}</div>

                          <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                            <span className="text-slate-500">{doc.experienceYears} yrs exp</span>
                            <span className="font-bold text-slate-900">${doc.consultationFee.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Select Date */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Selected Doctor: {selectedDoctor?.fullName}
                  </div>
                  <div className="text-xs text-slate-500">{selectedDoctor?.specialization}</div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change Doctor
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Appointment Date
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="date"
                    id="appointment-date-input"
                    value={appointmentDate}
                    min="2026-09-20"
                    max="2026-12-31"
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />

                  {/* Quick Select Shortcut Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Sept 25, 2026', val: '2026-09-25' },
                      { label: 'Sept 28, 2026', val: '2026-09-28' },
                      { label: 'Sept 29, 2026', val: '2026-09-29' },
                      { label: 'Oct 02, 2026', val: '2026-10-02' }
                    ].map(d => (
                      <button
                        key={d.val}
                        onClick={() => setAppointmentDate(d.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          appointmentDate === d.val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <span>
                    Selected date: <strong>{new Date(appointmentDate + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Select Available Time Slot */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Schedule for {selectedDoctor?.fullName} on {appointmentDate}
                  </div>
                  <div className="text-xs text-slate-500">
                    Server verified real-time slot availability (Double-booking protected)
                  </div>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change Date
                </button>
              </div>

              {slotsLoading ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Checking real-time doctor availability...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs space-y-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Doctor Not Available On This Day
                  </div>
                  <p>
                    {selectedDoctor?.fullName} does not have scheduled consultation hours on {appointmentDate}.
                    Please choose another weekday (e.g. Monday - Friday).
                  </p>
                  <button
                    onClick={() => setStep(3)}
                    className="mt-2 text-emerald-700 font-semibold hover:underline"
                  >
                    Select another date
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Available Consultation Slots:
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          id={`time-slot-${slot.time.replace(':', '-')}`}
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-2.5 px-3 rounded-lg text-xs font-medium border flex flex-col items-center justify-center gap-0.5 transition-all ${
                            !slot.isAvailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50'
                          }`}
                        >
                          <span className="font-bold">{slot.time}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {slot.isAvailable ? 'Available' : 'Booked'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-4 pt-2">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-white border border-slate-300 inline-block" /> Available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> Selected
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" /> Booked / Unavailable
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Reason & Details */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                Please specify your reason for visit and preferred consultation format:
              </div>

              {/* Consultation Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Consultation Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAppointmentType('in_person')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      appointmentType === 'in_person'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">In-Person Consultation</div>
                      <div className="text-[11px] text-slate-500">Visit {selectedDoctor?.roomNumber}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppointmentType('telemedicine')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      appointmentType === 'telemedicine'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Telemedicine Consultation</div>
                      <div className="text-[11px] text-slate-500">Secure video call link</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Visit Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Visit Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['First-time Consultation', 'Follow-up / Routine', 'Prescription Renewal'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setVisitCategory(cat)}
                      className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                        visitCategory === cat
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason for Visit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Visit / Primary Symptoms
                </label>
                <div className="text-[11px] text-slate-400 mb-2">
                  Briefly describe your symptoms or health reason (avoid unnecessary sensitive details).
                </div>
                <textarea
                  id="appointment-reason-textarea"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Experiencing mild headaches and request routine blood pressure check..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Review & Confirm */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="text-sm font-medium text-slate-700">
                Please verify your appointment details before finalizing:
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedDoctor?.avatarUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{selectedDoctor?.fullName}</div>
                      <div className="text-xs text-emerald-700 font-medium">{selectedDoctor?.specialization}</div>
                      <div className="text-[11px] text-slate-500">{selectedDepartment?.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">Consultation Fee</div>
                    <div className="text-base font-bold text-slate-900">
                      ${selectedDoctor?.consultationFee.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Date & Time:</span>
                    <span className="font-semibold text-slate-800">
                      {appointmentDate} at {selectedSlot}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Consultation Type:</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {appointmentType === 'in_person' ? 'In-Person (Room ' + selectedDoctor?.roomNumber + ')' : 'Telemedicine (Video Call)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Patient Name:</span>
                    <span className="font-semibold text-slate-800">{currentUser.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact Phone:</span>
                    <span className="font-semibold text-slate-800">{currentUser.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500 block">Visit Purpose:</span>
                  <span className="text-slate-800 font-medium italic">
                    [{visitCategory}] {reason}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Kirinda Hospital Policy: You may reschedule or cancel your booking up to 2 hours prior to consultation without penalty.
                </span>
              </div>
            </div>
          )}

          {/* STEP 7: Booking Confirmed (Official Receipt) */}
          {step === 7 && confirmedAppointment && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
                  Request Successfully Recorded
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Appointment Confirmed!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  A notification has been dispatched to {selectedDoctor?.fullName} and saved in your patient profile.
                </p>
              </div>

              {/* Receipt Ticket Card */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left max-w-lg mx-auto shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Reference Number</div>
                    <div className="text-base font-extrabold text-emerald-700 tracking-tight font-mono" id="confirmed-booking-reference">
                      {confirmedAppointment.referenceNo}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">
                    {confirmedAppointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs py-3 border-b border-dashed border-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Doctor</span>
                    <span className="font-bold text-slate-800">{confirmedAppointment.doctorName}</span>
                    <span className="block text-[11px] text-emerald-700">{confirmedAppointment.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date & Time</span>
                    <span className="font-bold text-slate-800">{confirmedAppointment.appointmentDate}</span>
                    <span className="block text-slate-600">{confirmedAppointment.startTime} - {confirmedAppointment.endTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Location</span>
                    <span className="font-medium text-slate-800">Kirinda Hospital Main Campus</span>
                    <span className="block text-[10px] text-slate-500">Karongi / Ruhango Outpatient Wing</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Consultation Mode</span>
                    <span className="font-medium text-slate-800 capitalize">{confirmedAppointment.appointmentType.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="pt-3 text-[11px] text-slate-500">
                  <strong>Instructions:</strong> Please check in at the reception desk 15 minutes prior to your scheduled time. Bring your national ID and insurance card if applicable.
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 7 && (
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            {step > 1 ? (
              <button
                id="booking-step-prev-btn"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            <div>
              {step === 1 && (
                <button
                  id="booking-step1-next-btn"
                  disabled={!selectedDepartmentId}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs"
                >
                  Next: Select Doctor <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 2 && (
                <button
                  id="booking-step2-next-btn"
                  disabled={!selectedDoctorId}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs"
                >
                  Next: Choose Date <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 3 && (
                <button
                  id="booking-step3-next-btn"
                  disabled={!appointmentDate}
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs"
                >
                  Next: Choose Time Slot <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 4 && (
                <button
                  id="booking-step4-next-btn"
                  disabled={!selectedSlot}
                  onClick={() => setStep(5)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs"
                >
                  Next: Visit Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 5 && (
                <button
                  id="booking-step5-next-btn"
                  disabled={!reason.trim()}
                  onClick={() => setStep(6)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs"
                >
                  Next: Review Summary <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 6 && (
                <button
                  id="booking-step6-confirm-btn"
                  disabled={loading}
                  onClick={handleConfirmBooking}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  {loading ? 'Validating Slot & Booking...' : 'Confirm Appointment'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
