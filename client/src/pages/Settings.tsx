import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Settings as SettingsIcon, Shield, CheckCircle2, History } from 'lucide-react';

interface NGOSettings {
  ngoName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  taxExemptionNumber: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  targetTable: string | null;
  targetId: string | null;
  details: string | null;
  timestamp: string;
  userName: string | null;
  userEmail: string | null;
}

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [settings, setSettings] = useState<NGOSettings | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [ngoName, setNgoName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxExemptionNumber, setTaxExemptionNumber] = useState('');

  const fetchData = async () => {
    try {
      const settingsRes = await api.get('/settings');
      setSettings(settingsRes.data);
      setNgoName(settingsRes.data.ngoName);
      setContactEmail(settingsRes.data.contactEmail);
      setContactPhone(settingsRes.data.contactPhone);
      setAddress(settingsRes.data.address);
      setTaxExemptionNumber(settingsRes.data.taxExemptionNumber);

      if (user?.role === 'admin') {
        const logsRes = await api.get('/settings/logs');
        setLogs(logsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    try {
      await api.put('/settings', {
        ngoName,
        contactEmail,
        contactPhone,
        address,
        taxExemptionNumber,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* NGO Identity settings panel */}
      <div className="lg:col-span-2 glass-card p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5 border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
          <SettingsIcon className="w-4 h-4 text-brand-500" />
          {t('setting.ngoDetails')}
        </h3>

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>{t('setting.saveSuccess')}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">{t('setting.ngoName')} *</label>
            <input
              type="text"
              required
              disabled={!isAdmin}
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              className="glass-input disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">{t('setting.contactEmail')} *</label>
              <input
                type="email"
                required
                disabled={!isAdmin}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="glass-input disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">{t('setting.contactPhone')} *</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="glass-input disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">{t('setting.address')} *</label>
            <textarea
              required
              disabled={!isAdmin}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="glass-input h-20 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">{t('setting.taxExemption')} *</label>
            <input
              type="text"
              required
              disabled={!isAdmin}
              value={taxExemptionNumber}
              onChange={(e) => setTaxExemptionNumber(e.target.value)}
              className="glass-input disabled:opacity-60"
            />
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex justify-end">
              <button
                type="submit"
                className="btn-premium px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs"
              >
                {t('common.save')}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Security Audit logs panel (Admin Only) */}
      <div className="glass-card p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5 border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
          <Shield className="w-4 h-4 text-rose-500" />
          {t('setting.auditLogs')}
        </h3>

        {isAdmin ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto pr-1 space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="pt-3 first:pt-0">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>{log.action}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                  {log.details}
                </div>
                <div className="flex gap-2 text-[9px] text-slate-400 font-medium mt-1">
                  <span>User: {log.userName || 'System'}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-rose-500/80 font-bold bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center justify-center text-center">
            Security audit log access is restricted to administrative accounts only.
          </div>
        )}
      </div>
    </div>
  );
};
