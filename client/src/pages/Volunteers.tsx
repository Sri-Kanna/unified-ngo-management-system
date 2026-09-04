import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Plus, Search, Edit, Trash2, X, Tag } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  skills: string[] | null;
  availability: string | null;
  status: 'active' | 'inactive';
}

export const Volunteers: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [list, setList] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVol, setSelectedVol] = useState<Volunteer | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [availability, setAvailability] = useState('weekends');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchVolunteers = async () => {
    try {
      const response = await api.get('/volunteers');
      setList(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const openAddModal = () => {
    setSelectedVol(null);
    setName('');
    setEmail('');
    setPhone('');
    setSkillsStr('');
    setAvailability('weekends');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (vol: Volunteer) => {
    setSelectedVol(vol);
    setName(vol.name);
    setEmail(vol.email);
    setPhone(vol.phone || '');
    setSkillsStr(vol.skills ? vol.skills.join(', ') : '');
    setAvailability(vol.availability || 'weekends');
    setStatus(vol.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsStr
      ? skillsStr.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    const data = {
      name,
      email,
      phone: phone || null,
      skills,
      availability,
      status,
    };

    try {
      if (selectedVol) {
        await api.put(`/volunteers/${selectedVol.id}`, data);
      } else {
        await api.post('/volunteers', data);
      }
      setModalOpen(false);
      fetchVolunteers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this volunteer profile?')) return;
    try {
      await api.delete(`/volunteers/${id}`);
      fetchVolunteers();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = list.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase()) ||
    (v.skills && v.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-10"
          />
        </div>
        {user?.role !== 'volunteer' && (
          <button
            onClick={openAddModal}
            className="btn-premium px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('volunteer.add')}</span>
          </button>
        )}
      </div>

      {/* Grid Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">No volunteers registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">{t('volunteer.name')}</th>
                  <th className="px-6 py-4">{t('volunteer.phone')}</th>
                  <th className="px-6 py-4">{t('volunteer.skills')}</th>
                  <th className="px-6 py-4">{t('volunteer.availability')}</th>
                  <th className="px-6 py-4">{t('common.status')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((vol) => (
                  <tr key={vol.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{vol.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{vol.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{vol.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {vol.skills && vol.skills.length > 0 ? (
                          vol.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 font-bold rounded-lg text-[9px]"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None listed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 capitalize font-semibold">
                      {vol.availability || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          vol.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-slate-500/10 text-slate-600'
                        }`}
                      >
                        {vol.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user?.role !== 'volunteer' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(vol)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(vol.id)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No access</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VOLUNTEER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 relative animate-reveal">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">
              {selectedVol ? t('volunteer.edit') : t('volunteer.add')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('volunteer.name')} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('volunteer.email')} *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('volunteer.phone')}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('volunteer.skills')}</label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="glass-input"
                  placeholder="Teaching, Event management (comma separated)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('volunteer.availability')}</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="glass-input"
                >
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('common.status')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="glass-input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-premium px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
