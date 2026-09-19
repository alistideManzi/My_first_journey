import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Award,
  Globe,
  MapPin,
  FileCheck2,
  DollarSign,
  ShieldCheck,
  Star,
  CheckCircle2,
  Phone,
  Mail
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorProfileModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (doctorId: number) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onBookAppointment
}) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 pb-8">
          <button
            id="close-doc-profile-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <img
                src={doctor.avatarUrl}
                alt={doctor.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
              />
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-400/20 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Hospital Verified Specialist
              </div>
              <h2 className="text-2xl font-bold">{doctor.fullName}</h2>
              <p className="text-emerald-200 text-sm font-medium mt-0.5">{doctor.specialization}</p>
              <p className="text-slate-300 text-xs mt-1">{doctor.departmentName}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <strong>{doctor.rating.toFixed(1)}</strong> / 5.0
                </span>
                <span>•</span>
                <span>{doctor.experienceYears} Years Clinical Exp.</span>
                <span>•</span>
                <span className="font-semibold text-white">${doctor.consultationFee.toFixed(2)} Consultation Fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Details Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Biography */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Professional Biography
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              {doctor.bio || 'Experienced clinician committed to deliver personalized patient care, comprehensive diagnostic evaluations, and compassionate treatment plans at Kirinda Hospital.'}
            </p>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">Qualifications & Education</div>
                <div className="text-xs text-slate-600 mt-0.5">{doctor.qualifications}</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">Medical Council Registration</div>
                <div className="text-xs text-slate-600 mt-0.5 font-mono">{doctor.licenseNumber}</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">Consultation Location</div>
                <div className="text-xs text-slate-600 mt-0.5">{doctor.roomNumber}</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <Globe className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">Languages Spoken</div>
                <div className="text-xs text-slate-600 mt-0.5">{doctor.languages}</div>
              </div>
            </div>
          </div>

          {/* Working Schedule Summary */}
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Clinical Availability Hours
            </div>
            <div className="text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="font-medium text-slate-800">Standard Clinic Days:</span>
                <span>Monday – Friday</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-800">Consultation Hours:</span>
                <span>08:30 AM – 04:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-800">Appointment Duration:</span>
                <span>30 minutes per patient session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Accepts: <strong>In-Person & Telemedicine</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              id={`book-with-doc-${doctor.id}`}
              onClick={() => {
                onClose();
                onBookAppointment(doctor.id);
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:shadow"
            >
              <Calendar className="w-4 h-4" /> Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
