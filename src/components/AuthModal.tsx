import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  Calendar,
  Heart,
  CheckCircle2,
  Shield,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login Form
  const [email, setEmail] = useState('patient.john@example.com');
  const [password, setPassword] = useState('password123');

  // Register Form
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1992-06-15');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !regEmail || !regPhone) {
      setError('Please fill in your name, email, and phone number.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.register({
        fullName,
        email: regEmail,
        phone: regPhone,
        dateOfBirth,
        gender,
        bloodGroup,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone
      });
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const quickSwitch = async (testEmail: string) => {
    setEmail(testEmail);
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(testEmail, 'password123');
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Kirinda Hospital Portal
            </div>
            <h2 className="text-lg font-bold">
              {mode === 'login' ? 'Sign In to Your Account' : 'Patient Registration'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'login'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'register'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Patient
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-5">
          {mode === 'login' ? (
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      id="login-email-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      id="login-password-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-login-btn"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition-colors mt-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              {/* Quick 1-Click Role Logins for testing */}
              <div className="pt-3 border-t border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Fast Demo Logins (Click to switch):
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => quickSwitch('patient.john@example.com')}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-colors"
                  >
                    <div className="font-bold text-slate-800">👤 Patient</div>
                    <div className="text-[10px] text-slate-500 truncate">John Habimana</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickSwitch('jean.claude@kirindahospital.org')}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
                  >
                    <div className="font-bold text-slate-800">🩺 Doctor</div>
                    <div className="text-[10px] text-slate-500 truncate">Dr. Jean Claude</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickSwitch('reception@kirindahospital.org')}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-left transition-colors"
                  >
                    <div className="font-bold text-slate-800">🧑💼 Receptionist</div>
                    <div className="text-[10px] text-slate-500 truncate">Patrick Mugisha</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickSwitch('admin@kirindahospital.org')}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-left transition-colors"
                  >
                    <div className="font-bold text-slate-800">👨💼 Admin</div>
                    <div className="text-[10px] text-slate-500 truncate">Dr. Beatrice M.</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Marie Claire Mukamana"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="marie@example.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+250 788 123 456"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Relative / Spouse"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition-colors mt-3"
              >
                {loading ? 'Creating Patient Profile...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
