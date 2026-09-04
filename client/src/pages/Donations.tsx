import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Plus, Search, Edit, Trash2, X, DollarSign, Wallet } from 'lucide-react';

interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  amount: string;
  donationDate: string;
  donationType: 'monetary' | 'in-kind';
  description: string | null;
  status: 'completed' | 'pending';
}

interface DonorOption {
  id: string;
  name: string;
  email: string;
}

export const Donations: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [list, setList] = useState<Donation[]>([]);
  const [donors, setDonors] = useState<DonorOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // Form Fields
  const [donorId, setDonorId] = useState('');
  const [amount, setAmount] = useState('');
  const [donationDate, setDonationDate] = useState('');
  const [donationType, setDonationType] = useState<'monetary' | 'in-kind'>('monetary');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'completed' | 'pending'>('completed');

  const fetchData = async () => {
    try {
      const [donationsRes, donorsRes] = await Promise.all([
        api.get('/donations'),
        api.get('/donors'),
      ]);
      setList(donationsRes.data);
      setDonors(donorsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setSelectedDonation(null);
    setDonorId(donors.length > 0 ? donors[0].id : '');
    setAmount('');
    setDonationDate(new Date().toISOString().split('T')[0]);
    setDonationType('monetary');
    setDescription('');
    setStatus('completed');
    setModalOpen(true);
  };

  const openEditModal = (donation: Donation) => {
    setSelectedDonation(donation);
    setDonorId(donation.donorId);
    setAmount(donation.amount);
    setDonationDate(donation.donationDate.split('T')[0]);
    setDonationType(donation.donationType);
    setDescription(donation.description || '');
    setStatus(donation.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      donorId,
      amount,
      donationDate,
      donationType,
      description: description || null,
      status,
    };

    try {
      if (selectedDonation) {
        await api.put(`/donations/${selectedDonation.id}`, data);
      } else {
        await api.post('/donations', data);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this donation record?')) return;
    try {
      await api.delete(`/donations/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = list.filter((d) =>
    d.donorName.toLowerCase().includes(search.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(search.toLowerCase())) ||
    d.donationType.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amt: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(amt));
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
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
            disabled={donors.length === 0}
            className="btn-premium px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
            title={donors.length === 0 ? 'Add a donor first' : ''}
          >
            <Plus className="w-4 h-4" />
            <span>{t('donation.add')}</span>
          </button>
        )}
      </div>

      {/* Grid Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">No donation records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">{t('donation.donor')}</th>
                  <th className="px-6 py-4">{t('donation.amount')}</th>
                  <th className="px-6 py-4">{t('donation.date')}</th>
                  <th className="px-6 py-4">{t('donation.type')}</th>
                  <th className="px-6 py-4">{t('donation.description')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{don.donorName}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{don.donorEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-white">
                      {formatCurrency(don.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {new Date(don.donationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          don.donationType === 'monetary'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-indigo-500/10 text-indigo-600'
                        }`}
                      >
                        {don.donationType === 'monetary' ? <DollarSign className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                        {don.donationType === 'monetary' ? t('donation.monetary') : t('donation.inkind')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {don.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user?.role !== 'volunteer' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(don)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(don.id)}
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

      {/* RECORD DONATION MODAL */}
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
              {selectedDonation ? t('donation.edit') : t('donation.add')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donation.donor')} *</label>
                <select
                  value={donorId}
                  onChange={(e) => setDonorId(e.target.value)}
                  className="glass-input"
                  required
                >
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donation.amount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass-input"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donation.date')} *</label>
                <input
                  type="date"
                  required
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donation.type')}</label>
                <select
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value as 'monetary' | 'in-kind')}
                  className="glass-input"
                >
                  <option value="monetary">Monetary</option>
                  <option value="in-kind">In-kind Resource</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('donation.description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input h-20"
                  placeholder="Additional details..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('common.status')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'completed' | 'pending')}
                  className="glass-input"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending Approval</option>
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
