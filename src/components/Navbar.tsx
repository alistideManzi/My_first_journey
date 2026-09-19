import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Calendar,
  User as UserIcon,
  Bell,
  Stethoscope,
  Building2,
  Phone,
  Database,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { User, NotificationItem } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  currentUser: User;
  onSelectRole: (role: string, email?: string) => void;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
  onOpenSchema: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectRole,
  onOpenBooking,
  onOpenAuth,
  onOpenSchema,
  currentView,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [currentUser.id]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const getDashboardViewForRole = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'doctor_dashboard';
      case 'receptionist':
        return 'receptionist_dashboard';
      case 'admin':
      case 'super_admin':
        return 'admin_dashboard';
      default:
        return 'patient_dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top emergency & announcement ribbon */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-600 text-white animate-pulse">
              24/7 EMERGENCY
            </span>
            <span>Hotline: <strong className="text-white">+250 788 112 000</strong></span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">Ambulance Dispatch: 912</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Instant Role Preview Switcher for evaluation */}
            <div className="relative">
              <button
                id="role-switcher-btn"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-xs transition-colors border border-slate-700"
                title="Switch role for testing permissions"
              >
                <span>Active Role:</span>
                <span className="font-semibold text-emerald-400 capitalize">{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-slate-800 text-xs z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-slate-500 font-medium">
                    Test Permissions as:
                  </div>
                  <button
                    onClick={() => {
                      onSelectRole('patient', 'patient.john@example.com');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between ${currentUser.role === 'patient' ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''}`}
                  >
                    <div>
                      <div className="font-medium">Patient</div>
                      <div className="text-[11px] text-slate-400">John Habimana</div>
                    </div>
                    {currentUser.role === 'patient' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onSelectRole('doctor', 'jean.claude@kirindahospital.org');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between ${currentUser.role === 'doctor' ? 'bg-blue-50 text-blue-700 font-semibold' : ''}`}
                  >
                    <div>
                      <div className="font-medium">Doctor</div>
                      <div className="text-[11px] text-slate-400">Dr. Jean Claude (General Med)</div>
                    </div>
                    {currentUser.role === 'doctor' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onSelectRole('receptionist', 'reception@kirindahospital.org');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center justify-between ${currentUser.role === 'receptionist' ? 'bg-amber-50 text-amber-700 font-semibold' : ''}`}
                  >
                    <div>
                      <div className="font-medium">Receptionist</div>
                      <div className="text-[11px] text-slate-400">Patrick Mugisha (Check-in desk)</div>
                    </div>
                    {currentUser.role === 'receptionist' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onSelectRole('admin', 'admin@kirindahospital.org');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center justify-between ${currentUser.role === 'admin' ? 'bg-purple-50 text-purple-700 font-semibold' : ''}`}
                  >
                    <div>
                      <div className="font-medium">Hospital Administrator</div>
                      <div className="text-[11px] text-slate-400">Dr. Beatrice Mukamwezi</div>
                    </div>
                    {currentUser.role === 'admin' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                  </button>
                </div>
              )}
            </div>

            <button
              id="view-db-schema-header-btn"
              onClick={onOpenSchema}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              title="View MySQL Database Schema & SQL export"
            >
              <Database className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">MySQL Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Hospital Name */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
            id="brand-logo"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Kirinda Hospital
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  HMS
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium -mt-0.5">
                Modern Healthcare & Appointment Portal
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-link-home"
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'home' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Home
            </button>
            <button
              id="nav-link-departments"
              onClick={() => onNavigate('departments')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'departments' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Departments
            </button>
            <button
              id="nav-link-doctors"
              onClick={() => onNavigate('doctors')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'doctors' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Doctors
            </button>
            <button
              id="nav-link-services"
              onClick={() => onNavigate('services')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'services' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Services
            </button>
            <button
              id="nav-link-contact"
              onClick={() => onNavigate('contact')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'contact' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Contact
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      Notifications
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs transition-colors ${notif.isRead ? 'bg-white' : 'bg-emerald-50/50'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-800">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard Link button for current user */}
            <button
              id="my-dashboard-btn"
              onClick={() => onNavigate(getDashboardViewForRole(currentUser.role))}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView.includes('dashboard')
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline capitalize">
                {currentUser.role === 'admin' ? 'Admin Portal' : `${currentUser.role} Portal`}
              </span>
            </button>

            {/* Book Appointment CTA */}
            <button
              id="book-appointment-nav-btn"
              onClick={onOpenBooking}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-sm px-3.5 sm:px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            {/* Sign in / Switch user button */}
            <button
              id="auth-modal-btn"
              onClick={onOpenAuth}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Sign In or Register"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
