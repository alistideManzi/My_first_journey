import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PublicHome } from './components/PublicHome';
import { BookAppointmentModal } from './components/BookAppointmentModal';
import { DoctorProfileModal } from './components/DoctorProfileModal';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { AuthModal } from './components/AuthModal';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';
import { ReceptionistDashboard } from './components/dashboards/ReceptionistDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { User, Department, Doctor, Appointment } from './types';
import { api } from './services/api';
import {
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2,
  Stethoscope,
  ShieldCheck,
  Calendar,
  Database,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 7,
    fullName: 'John Habimana',
    email: 'patient.john@example.com',
    role: 'patient',
    phone: '+250 788 123 456',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [currentView, setCurrentView] = useState<string>('home');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState<number | undefined>(undefined);
  const [bookingDeptId, setBookingDeptId] = useState<number | undefined>(undefined);
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState<Doctor | null>(null);
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      setLoading(true);
      const [meData, depts, docs] = await Promise.all([
        api.getMe().catch(() => null),
        api.getDepartments(),
        api.getDoctors()
      ]);

      if (meData?.user) {
        setCurrentUser(meData.user);
      }
      setDepartments(depts);
      setDoctors(docs);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (role: string, specificEmail?: string) => {
    try {
      const res = await api.switchDemoRole(role, specificEmail);
      setCurrentUser(res.user);
      // Automatically route to their role dashboard
      switch (role) {
        case 'doctor':
          setCurrentView('doctor_dashboard');
          break;
        case 'receptionist':
          setCurrentView('receptionist_dashboard');
          break;
        case 'admin':
        case 'super_admin':
          setCurrentView('admin_dashboard');
          break;
        default:
          setCurrentView('patient_dashboard');
          break;
      }
    } catch {
      // fallback
    }
  };

  const handleOpenBooking = (deptId?: number, docId?: number) => {
    setBookingDeptId(deptId);
    setBookingDoctorId(docId);
    setBookingModalOpen(true);
  };

  const handleAppointmentCreated = (appointment: Appointment) => {
    // Refresh background state if needed
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSchema={() => setSchemaModalOpen(true)}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <PublicHome
            departments={departments}
            doctors={doctors}
            onOpenBooking={handleOpenBooking}
            onViewDoctorProfile={(doc) => setSelectedDoctorForProfile(doc)}
            onNavigate={(view) => setCurrentView(view)}
            onOpenSchema={() => setSchemaModalOpen(true)}
          />
        )}

        {currentView === 'departments' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Kirinda Hospital Centers of Excellence
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
                Clinical Departments & Specialized Services
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Explore our specialized medical units led by experienced clinicians and certified specialists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <div key={dept.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded">
                        {dept.code}
                      </span>
                      <span className="text-xs text-slate-400">
                        {dept.doctorCount || 0} Physicians
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{dept.name}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{dept.description}</p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Floor: {dept.floorLocation}</span>
                    <button
                      onClick={() => handleOpenBooking(dept.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors"
                    >
                      Book Specialist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'doctors' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Healthcare Specialists
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
                Medical Staff Directory
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Find licensed physicians, view clinical qualifications, consultation fees, and schedule visits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                    <img src={doc.avatarUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{doc.fullName}</h3>
                      <div className="text-xs font-semibold text-emerald-700 mt-0.5">{doc.specialization}</div>
                      <div className="text-xs text-slate-500 mt-1">{doc.departmentName}</div>
                      <div className="text-[11px] text-slate-400 mt-2">{doc.qualifications}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">
                        ${doc.consultationFee.toFixed(2)}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedDoctorForProfile(doc)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleOpenBooking(doc.departmentId, doc.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'services' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Hospital Capabilities
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
                Medical & Diagnostic Services
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Kirinda Hospital provides comprehensive outpatient and inpatient medical services 24 hours a day, 7 days a week.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: '24/7 Emergency & Resuscitation Center', desc: 'Equipped with cardiac monitors, oxygen therapy, trauma surgical bays, and rapid ambulance response units.', contact: 'Hotline: +250 788 112 000' },
                { title: 'Outpatient Specialist Clinics', desc: 'Scheduled consultations with cardiologists, pediatricians, dentists, gynecologists, and internists.', contact: 'Mon - Sat: 08:00 AM - 05:00 PM' },
                { title: 'Laboratory Diagnostics & Clinical Pathology', desc: 'Fully automated biochemistry, hematology, immunology, microbiology, and molecular diagnostic testing.', contact: '24/7 Service Desk' },
                { title: 'Medical Imaging & Radiology', desc: 'Digital X-ray, Ultrasound scanning, Doppler echocardiography, and prenatal ultrasound imaging.', contact: 'Ground Floor, Diagnostic Wing' },
                { title: 'Inpatient Medical & Surgical Wards', desc: 'Comfortable acute inpatient care with specialized surgical suites, post-op monitoring, and dedicated nursing care.', contact: 'Visiting hours: 12:00 PM - 02:00 PM & 05:00 PM - 07:00 PM' },
                { title: 'Hospital Pharmacy & Medication Counseling', desc: 'Verified pharmaceutical dispensing, prescription management, and clinical dosage safety reviews.', contact: 'Available 24 hours daily' }
              ].map((s, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <h3 className="font-bold text-base text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  <div className="pt-2 text-xs font-semibold text-emerald-700">{s.contact}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Get In Touch
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
                Contact Kirinda Hospital
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Reach out for appointment enquiries, ambulance dispatch, or administrative questions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-base text-slate-900">Hospital Contact Desk</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Kirinda District Hospital</strong>
                    <p className="text-slate-500">Main Highway Campus, Southern Province, Rwanda</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Reception: +250 788 112 000 / +250 788 112 233</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>appointments@kirindahospital.org</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Emergency: 24/7/365 | Outpatient: Mon - Sat 8:00 - 17:00</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <h3 className="font-bold text-base text-slate-900">Quick Patient Inquiry</h3>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
                <textarea
                  rows={3}
                  placeholder="Your Message or Inquiry..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
                <button
                  onClick={() => alert('Thank you for contacting Kirinda Hospital. A patient care representative will reply promptly.')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROLE DASHBOARDS */}
        {currentView === 'patient_dashboard' && (
          <PatientDashboard
            currentUser={currentUser}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentView === 'doctor_dashboard' && (
          <DoctorDashboard
            currentUser={currentUser}
          />
        )}

        {currentView === 'receptionist_dashboard' && (
          <ReceptionistDashboard
            currentUser={currentUser}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentView === 'admin_dashboard' && (
          <AdminDashboard
            currentUser={currentUser}
            onOpenSchema={() => setSchemaModalOpen(true)}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}
      </main>

      {/* MODALS */}
      <BookAppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        currentUser={currentUser}
        initialDoctorId={bookingDoctorId}
        initialDepartmentId={bookingDeptId}
        onAppointmentCreated={handleAppointmentCreated}
      />

      <DoctorProfileModal
        isOpen={!!selectedDoctorForProfile}
        doctor={selectedDoctorForProfile}
        onClose={() => setSelectedDoctorForProfile(null)}
        onBookAppointment={(docId) => handleOpenBooking(undefined, docId)}
      />

      <DatabaseSchemaModal
        isOpen={schemaModalOpen}
        onClose={() => setSchemaModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          // Navigate to appropriate view
          switch (user.role) {
            case 'doctor':
              setCurrentView('doctor_dashboard');
              break;
            case 'receptionist':
              setCurrentView('receptionist_dashboard');
              break;
            case 'admin':
            case 'super_admin':
              setCurrentView('admin_dashboard');
              break;
            default:
              setCurrentView('patient_dashboard');
              break;
          }
        }}
      />
    </div>
  );
}
