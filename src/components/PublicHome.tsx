import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Stethoscope,
  HeartPulse,
  Baby,
  Smile,
  Sparkles,
  Activity,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Star,
  Users,
  Award,
  AlertTriangle,
  ArrowRight,
  Database
} from 'lucide-react';
import { Department, Doctor } from '../types';

interface PublicHomeProps {
  departments: Department[];
  doctors: Doctor[];
  onOpenBooking: (deptId?: number, docId?: number) => void;
  onViewDoctorProfile: (doctor: Doctor) => void;
  onNavigate: (view: string) => void;
  onOpenSchema: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  departments,
  doctors,
  onOpenBooking,
  onViewDoctorProfile,
  onNavigate,
  onOpenSchema
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<number | 'all'>('all');

  // Filtered doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchesDept = selectedDeptFilter === 'all' || doc.departmentId === selectedDeptFilter;
    const matchesQuery = searchQuery === '' ||
      doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.departmentName && doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesQuery;
  });

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'Baby': return <Baby className="w-6 h-6" />;
      case 'HeartPulse': return <HeartPulse className="w-6 h-6" />;
      case 'Smile': return <Smile className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'Activity': return <Activity className="w-6 h-6" />;
      default: return <Stethoscope className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6">
        {/* Subtle background mesh grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Trusted Healthcare in Kirinda District
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your Health, <span className="text-emerald-400 underline decoration-emerald-500/50">Our Priority</span>.
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
              Book your medical appointment online and connect with dedicated healthcare specialists. Experience minimal waiting times, verified doctor schedules, and secure clinical records.
            </p>

            {/* Action Buttons requested in prompt */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-book-appointment-btn"
                onClick={() => onOpenBooking()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Calendar className="w-5 h-5" />
                <span>Book an Appointment</span>
              </button>

              <button
                id="hero-find-doctor-btn"
                onClick={() => {
                  const element = document.getElementById('featured-doctors-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-base px-6 py-3.5 rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                <Search className="w-5 h-5 text-emerald-300" />
                <span>Find a Doctor</span>
              </button>
            </div>

            {/* Key Trust Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800 max-w-xl text-xs sm:text-sm">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">45+</div>
                <div className="text-slate-400 font-medium">Licensed Physicians</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">24/7</div>
                <div className="text-slate-400 font-medium">Emergency Care</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">&lt; 15 min</div>
                <div className="text-slate-400 font-medium">Average Wait Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK SEARCH & APPOINTMENT LOOKUP BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                id="doctor-search-input"
                placeholder="Search doctors by name or medical specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Department Filter */}
            <div className="sm:col-span-4">
              <select
                id="department-filter-select"
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Departments (Any)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.doctorCount || 0} Doctors)
                  </option>
                ))}
              </select>
            </div>

            {/* Book Trigger Button */}
            <div className="sm:col-span-2">
              <button
                onClick={() => onOpenBooking()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OUR DEPARTMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Clinical Excellence
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Our Medical Departments
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Specialized departments equipped with modern medical technology and experienced consulting clinicians.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              id={`dept-card-${dept.id}`}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {getDeptIcon(dept.icon)}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {dept.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    {dept.code}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  <span>Floor: {dept.floorLocation}</span>
                </div>

                <button
                  id={`dept-book-btn-${dept.id}`}
                  onClick={() => onOpenBooking(dept.id)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>Book In Dept</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED DOCTORS SECTION */}
      <section id="featured-doctors-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Medical Practitioners
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Featured Doctors & Specialists
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              All healthcare practitioners are verified by Kirinda Hospital Medical Council with authorized clinical schedules.
            </p>
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No doctors matched your search criteria.
            <div className="mt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDeptFilter('all');
                }}
                className="text-emerald-600 font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                id={`featured-doctor-${doc.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                {/* Doctor Photo */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{doc.rating.toFixed(1)}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-emerald-900/80 text-white backdrop-blur-xs px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                    {doc.departmentName}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-1">
                      {doc.fullName}
                    </h3>
                    <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                      {doc.specialization}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {doc.qualifications}
                    </div>

                    <div className="mt-3 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{doc.experienceYears} years experience</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Mon – Fri Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-slate-400">Consultation:</span>
                      <span className="font-extrabold text-slate-900">${doc.consultationFee.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id={`view-doc-btn-${doc.id}`}
                        onClick={() => onViewDoctorProfile(doc)}
                        className="w-full py-2 px-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-center"
                      >
                        View Profile
                      </button>
                      <button
                        id={`book-doc-btn-${doc.id}`}
                        onClick={() => onOpenBooking(doc.departmentId, doc.id)}
                        className="w-full py-2 px-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-center shadow-xs"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. AVAILABLE SERVICES SECTION */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Comprehensive Care
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Available Hospital Services
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From primary diagnostics to specialized intensive therapies, Kirinda Hospital delivers patient-centered medical solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: '24/7 Emergency & Trauma Care',
                desc: 'Rapid medical response team, modern resuscitation units, and dedicated ambulance service.',
                icon: HeartPulse
              },
              {
                title: 'Outpatient & Primary Consultation',
                desc: 'Preventative screenings, chronic ailment follow-up, and general medicine examinations.',
                icon: Stethoscope
              },
              {
                title: 'Advanced Diagnostic Laboratory',
                desc: 'Comprehensive blood testing, pathology, hormonal panels, and automated clinical chemistry.',
                icon: Activity
              },
              {
                title: 'Pediatrics & Immunization Center',
                desc: 'Child developmental assessments, vaccinations, pediatric acute care, and nutrition guidance.',
                icon: Baby
              },
              {
                title: 'Pharmacy & Drug Dispensing',
                desc: 'Fully stocked hospital pharmacy providing verified medications with clinical pharmacist counseling.',
                icon: ShieldCheck
              },
              {
                title: 'Inpatient Hospitalization Wards',
                desc: 'Comfortable recovery rooms with round-the-clock nursing supervision and specialized post-op monitoring.',
                icon: Building2Icon
              }
            ].map((srv, idx) => {
              const IconComp = srv.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{srv.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{srv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. HOW THE SYSTEM WORKS (4 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Simple Process
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">
            How The Appointment System Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Seamless 4-step workflow connecting patients with hospital physicians without endless queuing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Select Department',
              desc: 'Choose from General Medicine, Pediatrics, Dentistry, Cardiology, or other specialized clinics.'
            },
            {
              step: '02',
              title: 'Choose Doctor & Date',
              desc: 'Browse doctor profiles, qualifications, ratings, and pick your preferred consultation date.'
            },
            {
              step: '03',
              title: 'Pick Available Slot',
              desc: 'System displays real-time server-verified slots to guarantee zero double bookings.'
            },
            {
              step: '04',
              title: 'Attend Consultation',
              desc: 'Receive confirmation reference code, instant SMS/app alerts, and visit without queue delays.'
            }
          ].map((st) => (
            <div key={st.step} className="bg-white rounded-2xl p-6 border border-slate-200 relative shadow-xs">
              <div className="text-3xl font-extrabold text-emerald-600/20 font-mono mb-2">
                {st.step}
              </div>
              <h3 className="font-bold text-base text-slate-900">{st.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. EMERGENCY INFORMATION & CONTACT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Emergency Medical Services
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                Need Immediate Medical Attention?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Kirinda Hospital provides round-the-clock emergency medical response, trauma triage, and rapid ambulance transport across the district.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
                  <div className="text-[11px] text-slate-400">Emergency Hotline</div>
                  <div className="text-lg font-extrabold text-rose-400">+250 788 112 000</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
                  <div className="text-[11px] text-slate-400">Ambulance Dispatch</div>
                  <div className="text-lg font-extrabold text-white">Call 912 / 112</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-4 text-xs sm:text-sm">
              <h3 className="font-bold text-base text-white border-b border-white/10 pb-2">
                Hospital Contact & Location
              </h3>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Kirinda District Hospital</strong>
                  <p className="text-xs text-slate-400">Main Campus, Karongi / Ruhango Highway, Southern Province, Rwanda</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>General Enquiries: +250 788 112 233</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>info@kirindahospital.org</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Outpatient Clinics: Mon – Sat (07:30 AM – 06:00 PM)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 border-t border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-slate-600">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3">
              <HeartPulse className="w-5 h-5 text-emerald-600" />
              <span>Kirinda Hospital</span>
            </div>
            <p className="leading-relaxed">
              Serving the community with specialized medical appointments, emergency medicine, and compassionate health services.
            </p>
            <div className="mt-4">
              <button
                onClick={onOpenSchema}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Download MySQL schema.sql</span>
              </button>
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Clinical Departments
            </div>
            <ul className="space-y-2">
              {departments.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => onOpenBooking(d.id)}
                    className="hover:text-emerald-700 transition-colors"
                  >
                    {d.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Patient Resources
            </div>
            <ul className="space-y-2">
              <li><button onClick={() => onOpenBooking()} className="hover:text-emerald-700">Online Appointment Booking</button></li>
              <li><button onClick={() => onNavigate('patient_dashboard')} className="hover:text-emerald-700">Patient Dashboard & History</button></li>
              <li><button onClick={() => onNavigate('patient_dashboard')} className="hover:text-emerald-700">Medical Records & Prescriptions</button></li>
              <li><button onClick={() => onOpenSchema()} className="hover:text-emerald-700">Database Schema Reference</button></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              System Users Portal
            </div>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('doctor_dashboard')} className="hover:text-emerald-700">Doctor Schedule Portal</button></li>
              <li><button onClick={() => onNavigate('receptionist_dashboard')} className="hover:text-emerald-700">Reception Check-in Desk</button></li>
              <li><button onClick={() => onNavigate('admin_dashboard')} className="hover:text-emerald-700">Hospital Administrator Portal</button></li>
              <li><span className="text-slate-400">Accredited by Ministry of Health</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div>
            © {new Date().getFullYear()} Kirinda Hospital Management System (KHS). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Built with React + Node.js Express + MySQL</span>
            <span>•</span>
            <button onClick={onOpenSchema} className="hover:text-slate-600 underline">
              View Database Architecture
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

function Building2Icon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
