import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Copy,
  Download,
  Check,
  Table,
  FileCode,
  Layers,
  Key,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({
  isOpen,
  onClose
}) => {
  const [sqlContent, setSqlContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'sql'>('tables');

  useEffect(() => {
    if (isOpen) {
      loadSql();
    }
  }, [isOpen]);

  const loadSql = async () => {
    try {
      setLoading(true);
      const sql = await api.getDatabaseSchemaSql();
      setSqlContent(sql);
    } catch {
      setSqlContent('-- Failed to load SQL schema');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSqlFile = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kirinda_hospital_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const tablesList = [
    { name: 'users', purpose: 'Authentication credentials, user roles (patient, doctor, receptionist, admin), statuses' },
    { name: 'patients', purpose: 'Patient profiles, demographics, blood group, emergency contacts, insurance' },
    { name: 'departments', purpose: 'Hospital clinical branches, room extensions, department heads' },
    { name: 'doctors', purpose: 'Medical licenses, qualifications, consultation fees, rooms, specialties' },
    { name: 'doctor_availability', purpose: 'Configurable weekly working hours, break schedules, slot duration rules' },
    { name: 'appointments', purpose: 'Bookings, reference codes (KHS-YYYY-XXXX), statuses, double-booking keys' },
    { name: 'notifications', purpose: 'In-app event notifications for appointment updates and announcements' },
    { name: 'medical_records', purpose: 'Authorized clinical consultation summaries, diagnoses, vital signs' },
    { name: 'prescriptions', purpose: 'Prescribed medications, dosage, frequency, and instructions' },
    { name: 'audit_logs', purpose: 'Security access tracking, data changes, compliance audit log' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Kirinda Hospital Database (MySQL)</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  MySQL 8.0+ / MariaDB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Normalized relational database schema with 10 tables, foreign keys, indexes & seed data
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Actions */}
        <div className="bg-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'tables'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Schema Architecture (10 Tables)
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'sql'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full schema.sql (DDL & Seeds)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
            </button>

            <button
              onClick={downloadSqlFile}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download schema.sql</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto bg-slate-950 text-slate-200">
          {activeTab === 'tables' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  This relational schema enforces 3NF normalization, foreign key cascade constraints, unique indexes to prevent double bookings, and audit traceability for Kirinda Hospital.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tablesList.map((t, i) => (
                  <div key={t.name} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                        <Table className="w-3.5 h-3.5 text-slate-400" />
                        {i + 1}. `{t.name}`
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">InnoDB</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{t.purpose}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Key Relational Links:
                </div>
                <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1">
                  <li>`users` (1) ── (1) `patients` / `doctors`</li>
                  <li>`departments` (1) ── (N) `doctors`</li>
                  <li>`doctors` (1) ── (N) `doctor_availability` & `appointments`</li>
                  <li>`patients` (1) ── (N) `appointments`</li>
                  <li>`appointments` (1) ── (1) `medical_records` (1) ── (N) `prescriptions`</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs">Loading database schema...</div>
              ) : (
                <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto p-4 bg-slate-900 rounded-xl border border-slate-800">
                  {sqlContent}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Target: MySQL 8.0+ | Database: `kirinda_hospital_db`</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
