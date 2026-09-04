import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Plus, Search, Edit, Trash2, X, ShieldCheck } from 'lucide-react';

interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  donorType: 'individual' | 'corporate';
  createdAt: string;
}

export const Donors: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [list, setList] = useState<Donor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [donorType, setDonorType] = useState<'individual' | 'corporate'>('individual');

  const fetchDonors = async () => {
    try {
      const response = await api.get('/donors');
      setList(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const openAddModal = () => {
    setSelectedDonor(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setDonorType('individual');
    setModalOpen(true);
  };

  const openEditModal = (donor: Donor) => {
    setSelectedDonor(donor);
    setName(donor.name);
    setEmail(donor.email);
    setPhone(donor.phone || '');
    setAddress(donor.address || '');
    setDonorType(donor.donorType);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      email,
      phone: phone || null,
      address: address || null,
      donorType,
    };

    try {
      if (selectedDonor) {
        await api.put(`/donors/${selectedDonor.id}`, data);
      } else {
        await api.post('/donors', data);
      }
      setModalOpen(false);
      fetchDonors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this donor?')) return;
    try {
      await api.delete(`/donors/${id}`);
      fetchDonors();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = list.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    d.donorType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
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
            <span>{t('donor.add')}</span>
          </button>
        )}
      </div>

      {/* Grid Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">No donors registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">{t('donor.name')}</th>
                  <th className="px-6 py-4">{t('donor.phone')}</th>
                  <th className="px-6 py-4">{t('donor.address')}</th>
                  <th className="px-6 py-4">{t('donor.type')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((donor) => (
                  <tr key={donor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{donor.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{donor.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{donor.phone || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium truncate max-w-xs">{donor.address || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                          donor.donorType === 'corporate'
                            ? 'bg-purple-500/10 text-purple-600'
                            : 'bg-blue-500/10 text-blue-600'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {donor.donorType === 'corporate' ? t('donor.corporate') : t('donor.individual')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user?.role !== 'volunteer' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(donor)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(donor.id)}
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

      {/* DONOR MODAL */}
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
              {selectedDonor ? t('donor.edit') : t('donor.add')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donor.name')} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donor.email')} *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donor.phone')}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donor.address')}</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="glass-input h-20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donor.type')}</label>
                <select
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value as 'individual' | 'corporate')}
                  className="glass-input"
                >
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporate</option>
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
