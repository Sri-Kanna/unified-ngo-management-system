import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Plus, Search, Edit, Trash2, QrCode, X, Check } from 'lucide-react';

interface Beneficiary {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  status: 'active' | 'inactive';
  qrCodeId: string;
  createdAt: string;
}

export const Beneficiaries: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [list, setList] = useState<Beneficiary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedBen, setSelectedBen] = useState<Beneficiary | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchBeneficiaries = async () => {
    try {
      const response = await api.get('/beneficiaries');
      setList(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const openAddModal = () => {
    setSelectedBen(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setDateOfBirth('');
    setGender('Male');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (ben: Beneficiary) => {
    setSelectedBen(ben);
    setName(ben.name);
    setEmail(ben.email || '');
    setPhone(ben.phone || '');
    setAddress(ben.address || '');
    setDateOfBirth(ben.dateOfBirth ? ben.dateOfBirth.split('T')[0] : '');
    setGender(ben.gender || 'Male');
    setStatus(ben.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      dateOfBirth: dateOfBirth || null,
      gender,
      status,
    };

    try {
      if (selectedBen) {
        await api.put(`/beneficiaries/${selectedBen.id}`, data);
      } else {
        await api.post('/beneficiaries', data);
      }
      setModalOpen(false);
      fetchBeneficiaries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) return;
    try {
      await api.delete(`/beneficiaries/${id}`);
      fetchBeneficiaries();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = list.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.email && b.email.toLowerCase().includes(search.toLowerCase())) ||
    (b.qrCodeId && b.qrCodeId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
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
            <span>{t('beneficiary.add')}</span>
          </button>
        )}
      </div>

      {/* Main Table Card */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">No beneficiaries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">{t('beneficiary.name')}</th>
                  <th className="px-6 py-4">{t('beneficiary.phone')}</th>
                  <th className="px-6 py-4">{t('beneficiary.gender')}</th>
                  <th className="px-6 py-4">{t('beneficiary.qrCode')}</th>
                  <th className="px-6 py-4">{t('common.status')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((ben) => (
                  <tr key={ben.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{ben.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{ben.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{ben.phone || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{ben.gender || '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedBen(ben);
                          setQrModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold hover:bg-brand-500 hover:text-white transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{ben.qrCodeId}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold text-[10px] uppercase ${
                          ben.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-slate-500/10 text-slate-600'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        {ben.status === 'active' ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user?.role !== 'volunteer' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(ben)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(ben.id)}
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

      {/* ADD/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto relative animate-reveal">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">
              {selectedBen ? t('beneficiary.edit') : t('beneficiary.add')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('beneficiary.name')} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('beneficiary.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('beneficiary.phone')}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('beneficiary.address')}</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="glass-input h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('beneficiary.dob')}</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('beneficiary.gender')}</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="glass-input"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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

      {/* DIGITAL ID QR CODE MODAL */}
      {qrModalOpen && selectedBen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 text-center relative animate-reveal">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Digital Beneficiary ID</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{selectedBen.name}</p>

            {/* QR Code Graphic Container */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mb-6 border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  JSON.stringify({
                    id: selectedBen.id,
                    name: selectedBen.name,
                    qr: selectedBen.qrCodeId,
                  })
                )}`}
                alt="Beneficiary QR Code ID"
                className="w-40 h-40"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unique QR Code ID</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-3 py-1.5 rounded-xl inline-block">
                {selectedBen.qrCodeId}
              </span>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center justify-center gap-1.5"
              >
                Print ID Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
