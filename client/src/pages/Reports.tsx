import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Plus, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  reportType: 'donation' | 'beneficiary' | 'inventory' | 'volunteer' | 'event';
  filePath: string;
  createdAt: string;
}

export const Reports: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [list, setList] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState<Report['reportType']>('donation');
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setList(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setSuccessMsg(null);

    try {
      await api.post('/reports/generate', { title, reportType });
      setTitle('');
      setSuccessMsg('Report compiled and saved successfully!');
      fetchReports();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Report form block */}
      {user?.role !== 'volunteer' && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-brand-500" />
            {t('report.generate')}
          </h3>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">{t('report.titleField')} *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
                placeholder="e.g. Q2 Donation Summary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">{t('report.type')}</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as Report['reportType'])}
                className="glass-input"
              >
                <option value="donation">Donations & Contributions</option>
                <option value="beneficiary">Beneficiary Directory</option>
                <option value="inventory">Inventory & Resources</option>
                <option value="volunteer">Volunteer List</option>
                <option value="event">Scheduled Events</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="btn-premium px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 h-10"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Compile & Save</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Reports Directory List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">{t('common.loading')}</div>
        ) : list.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">No reports generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">{t('report.titleField')}</th>
                  <th className="px-6 py-4">{t('report.type')}</th>
                  <th className="px-6 py-4">{t('report.createdAt')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {list.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>{rep.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                        {rep.reportType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {new Date(rep.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Triggers actual CSV download */}
                      <a
                        href={rep.filePath}
                        download
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500 hover:text-white transition-all rounded-lg"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('report.download')}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
