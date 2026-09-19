import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Building2,
  Stethoscope,
  BarChart3,
  TrendingUp,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  Search,
  Filter,
  Check,
  X,
  Clock,
  DollarSign,
  ShieldCheck,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Department,
  Doctor,
  Appointment,
  PatientProfile,
  AnalyticsReport,
  User
} from '../../types';
import { api } from '../../services/api';

interface AdminDashboardProps {
  currentUser: User;
  onOpenSchema: () => void;
  onOpenBooking: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onOpenSchema,
  onOpenBooking
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'doctors' | 'patients' | 'departments' | 'appointments'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsReport | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Add Doctor Modal
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocEmail, setNewDocEmail] = useState('');
  const [newDocDeptId, setNewDocDeptId] = useState<number>(1);
  const [newDocSpecialization, setNewDocSpecialization] = useState('');
  const [newDocQualifications, setNewDocQualifications] = useState('MBBS, MMed');
  const [newDocFee, setNewDocFee] = useState<number>(40);
  const [newDocRoom, setNewDocRoom] = useState('Room 205');
  const [newDocLicense, setNewDocLicense] = useState('RMC-KIR-8821');

  // Add Department Modal
  const [showAddDept, setShowAddDept] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptFloor, setDeptFloor] = useState('Ground Floor, East Wing');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [report, docs, depts, pts, appts] = await Promise.all([
        api.getAnalytics(),
        api.getDoctors({ activeOnly: false }),
        api.getDepartments(false),
        api.getPatients(),
        api.getAppointments()
      ]);
      setAnalytics(report);
      setDoctors(docs);
      setDepartments(depts);
      setPatients(pts);
      setAppointments(appts);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDoctor({
        fullName: newDocName,
        email: newDocEmail,
        departmentId: Number(newDocDeptId),
        specialization: newDocSpecialization,
        qualifications: newDocQualifications,
        consultationFee: Number(newDocFee),
        roomNumber: newDocRoom,
        licenseNumber: newDocLicense,
        experienceYears: 5
      });
      setShowAddDoctor(false);
      setMsg(`Specialist ${newDocName} added to hospital roster!`);
      setTimeout(() => setMsg(null), 3000);
      loadAdminData();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDepartment({
        name: deptName,
        code: deptCode.toUpperCase(),
        description: deptDesc,
        floorLocation: deptFloor
      });
      setShowAddDept(false);
      setMsg(`Department ${deptName} created successfully!`);
      setTimeout(() => setMsg(null), 3000);
      loadAdminData();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const handleToggleDoctorStatus = async (doc: Doctor) => {
    try {
      await api.updateDoctor(doc.id, { isActive: !doc.isActive });
      loadAdminData();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  // Colors for Recharts
  const STATUS_COLORS: Record<string, string> = {
    confirmed: '#10b981',
    pending: '#f59e0b',
    completed: '#3b82f6',
    cancelled: '#f43f5e'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-purple-300 font-semibold">
            Hospital Operations & System Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Executive Management Dashboard</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Admin: <strong>{currentUser.fullName}</strong> • Kirinda District Healthcare Network
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenSchema}
            className="bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Inspect MySQL Schema</span>
          </button>

          <button
            onClick={() => setShowAddDoctor(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Specialist</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Registered Patients</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{analytics?.totalPatients || patients.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Doctors</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{analytics?.totalDoctors || doctors.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600">Total Encounters</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{analytics?.todayAppointments || appointments.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-amber-600">Pending Actions</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{analytics?.pendingRequests || 0}</div>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600" />
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-purple-600 text-purple-900 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`py-4 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'doctors'
                ? 'border-purple-600 text-purple-900 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Manage Doctors ({doctors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`py-4 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'departments'
                ? 'border-purple-600 text-purple-900 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Departments ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`py-4 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'patients'
                ? 'border-purple-600 text-purple-900 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patients Directory ({patients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-4 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-purple-600 text-purple-900 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>All Hospital Bookings ({appointments.length})</span>
          </button>
        </div>

        {/* Tab 1: Analytics & Reports */}
        {activeTab === 'analytics' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Volume Bar Chart */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Monthly Appointment Volume
                  </h3>
                  <span className="text-[11px] text-slate-400">Past 6 Months</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.monthlyTrend || []}>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="appointments" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Breakdown Pie */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Appointment Status Distribution
                  </h3>
                  <span className="text-[11px] text-slate-400">Current Distribution</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.statusDistribution || []}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {(analytics?.statusDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Department Workload Table */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Department Clinical Utilization
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(analytics?.departmentWorkload || []).map((dept: { department: string; count: number }) => (
                  <div key={dept.department} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <div className="font-bold text-slate-800">{dept.department}</div>
                    <div className="text-emerald-700 font-bold mt-1">{dept.count} Consultations</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manage Doctors */}
        {activeTab === 'doctors' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Manage credentialed doctors, consulting fees, room locations, and active duty statuses.
              </div>
              <button
                onClick={() => setShowAddDoctor(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map(doc => (
                <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-4">
                  <img
                    src={doc.avatarUrl}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm truncate">{doc.fullName}</span>
                      <button
                        onClick={() => handleToggleDoctorStatus(doc)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          doc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <div className="text-emerald-700 font-semibold mt-0.5">{doc.specialization} ({doc.departmentName})</div>
                    <div className="text-slate-500 mt-1">{doc.roomNumber} • License: {doc.licenseNumber}</div>
                    <div className="text-slate-700 font-bold mt-2">
                      ${doc.consultationFee.toFixed(2)} Fee • {doc.experienceYears} Yrs Exp.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Manage Departments */}
        {activeTab === 'departments' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Hospital Clinical Departments & Floor Map
              </div>
              <button
                onClick={() => setShowAddDept(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Department</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map(dept => (
                <div key={dept.id} className="p-5 rounded-xl border border-slate-200 bg-white text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{dept.name}</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {dept.code}
                    </span>
                  </div>
                  <p className="text-slate-500 line-clamp-2">{dept.description}</p>
                  <div className="pt-2 border-t border-slate-100 text-slate-400">
                    Location: <strong className="text-slate-700">{dept.floorLocation}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Patients Directory */}
        {activeTab === 'patients' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="p-3">MRN</th>
                    <th className="p-3">Patient Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Blood Group</th>
                    <th className="p-3">Emergency Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map(pt => (
                    <tr key={pt.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-purple-700">{pt.medicalRecordNumber || pt.patientCode}</td>
                      <td className="p-3 font-semibold text-slate-900">{pt.fullName}</td>
                      <td className="p-3 text-slate-500">{pt.phone}</td>
                      <td className="p-3 font-bold text-slate-800">{pt.bloodGroup || 'N/A'}</td>
                      <td className="p-3 text-slate-500">{pt.emergencyContactName} ({pt.emergencyContactPhone})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: All Appointments */}
        {activeTab === 'appointments' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="p-3">Ref Code</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Specialist</th>
                    <th className="p-3">Date & Slot</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-emerald-700">{a.referenceNo}</td>
                      <td className="p-3 font-semibold text-slate-900">{a.patientName}</td>
                      <td className="p-3 text-slate-800">{a.doctorName}</td>
                      <td className="p-3 text-slate-600">{a.appointmentDate} at {a.startTime}</td>
                      <td className="p-3 capitalize">{a.appointmentType.replace('_', ' ')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          a.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          a.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Credentialed Doctor</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Samuel Kayinamura"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@kirindahospital.org"
                    value={newDocEmail}
                    onChange={(e) => setNewDocEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newDocDeptId}
                    onChange={(e) => setNewDocDeptId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="Orthopedic Surgeon"
                    value={newDocSpecialization}
                    onChange={(e) => setNewDocSpecialization(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">License No</label>
                  <input
                    type="text"
                    required
                    value={newDocLicense}
                    onChange={(e) => setNewDocLicense(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room No</label>
                  <input
                    type="text"
                    value={newDocRoom}
                    onChange={(e) => setNewDocRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    value={newDocFee}
                    onChange={(e) => setNewDocFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Create & Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Clinical Department</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dermatology & Skin Care"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="DERM"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Floor Location</label>
                <input
                  type="text"
                  value={deptFloor}
                  onChange={(e) => setDeptFloor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Specialized dermatological consultations and diagnostics..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDept(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
