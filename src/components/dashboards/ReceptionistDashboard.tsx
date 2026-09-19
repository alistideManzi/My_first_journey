import React, { useState, useEffect } from 'react';
import {
  Calendar,
  UserCheck,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  AlertCircle,
  Building2,
  Stethoscope,
  Filter
} from 'lucide-react';
import { Appointment, PatientProfile, Doctor, Department, User } from '../../types';
import { api } from '../../services/api';

interface ReceptionistDashboardProps {
  currentUser: User;
  onOpenBooking: () => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({
  currentUser,
  onOpenBooking
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [message, setMessage] = useState<string | null>(null);

  // Walk-in Registration Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadReceptionData();
  }, []);

  const loadReceptionData = async () => {
    try {
      setLoading(true);
      const [appts, docs, depts] = await Promise.all([
        api.getAppointments(),
        api.getDoctors(),
        api.getDepartments()
      ]);
      setAppointments(appts);
      setDoctors(docs);
      setDepartments(depts);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheckIn = async (appt: Appointment) => {
    const nextStatus = appt.checkInStatus === 'checked_in' ? 'in_consultation' : 'checked_in';
    try {
      await api.checkInPatient(appt.id, nextStatus);
      setMessage(`Patient ${appt.patientName} marked as ${nextStatus === 'checked_in' ? 'Arrived / Checked In' : 'In Consultation'}`);
      setTimeout(() => setMessage(null), 3000);
      loadReceptionData();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRegistering(true);
      await api.registerPatientByStaff({
        fullName,
        email: email || `walkin.${Date.now()}@kirindahospital.org`,
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone
      });
      setShowRegModal(false);
      setMessage(`Walk-in patient ${fullName} registered with hospital MRN!`);
      setTimeout(() => setMessage(null), 3000);
      // reset
      setFullName('');
      setPhone('');
      setEmail('');
    } catch (err: any) {
      setMessage(`Registration error: ${err.message}`);
    } finally {
      setRegistering(false);
    }
  };

  const filtered = appointments.filter(a => {
    const matchesDoc = selectedDoctorFilter === 'all' || String(a.doctorId) === selectedDoctorFilter;
    const matchesSearch = searchQuery === '' ||
      (a.patientName && a.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.referenceNo && a.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDoc && matchesSearch;
  });

  const checkedInCount = appointments.filter(a => a.checkInStatus === 'checked_in').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
            Outpatient Check-In Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reception & Triage Queue</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Receptionist: <strong>{currentUser.fullName}</strong> • Central Arrival Desk
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegModal(true)}
            className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-amber-700" />
            <span>Register Walk-in Patient</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Scheduled Consultations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{confirmedCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600">Arrived in Waiting Room</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{checkedInCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-blue-600">Active Doctors on Duty</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{doctors.length}</div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by patient name or reference code (KHS-)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={String(d.id)}>{d.fullName} ({d.specialization})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-4">Reference No</th>
                <th className="p-4">Patient Name & MRN</th>
                <th className="p-4">Doctor & Department</th>
                <th className="p-4">Time Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4">Arrival Check-In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(appt => (
                <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {appt.referenceNo}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{appt.patientName}</div>
                    <div className="text-[11px] text-slate-400">{appt.patientPhone || 'No phone'}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{appt.doctorName}</div>
                    <div className="text-[11px] text-slate-400">{appt.departmentName}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{appt.appointmentDate}</div>
                    <div className="text-[11px] text-emerald-700">{appt.startTime} - {appt.endTime}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      appt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      appt.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleCheckIn(appt)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                        appt.checkInStatus === 'checked_in'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : appt.checkInStatus === 'in_consultation'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>
                        {appt.checkInStatus === 'checked_in'
                          ? 'Checked In (Arrived)'
                          : appt.checkInStatus === 'in_consultation'
                          ? 'In Doctor Room'
                          : 'Mark Arrived'}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Walk-in Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-600" />
              <span>Register New Walk-In Patient</span>
            </h3>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Patient Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
                >
                  {registering ? 'Creating MRN...' : 'Save & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
