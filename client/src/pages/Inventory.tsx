import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Plus, Search, Edit, Trash2, X, Barcode as BarcodeIcon, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  barcode: string;
  location: string | null;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  createdAt: string;
}

export const Inventory: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [list, setList] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form Fields
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('units');
  const [barcode, setBarcode] = useState('');
  const [location, setLocation] = useState('');

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setList(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAddModal = () => {
    setSelectedItem(null);
    setItemName('');
    setCategory('');
    setQuantity(0);
    setUnit('units');
    setBarcode('');
    setLocation('');
    setModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemName(item.itemName);
    setCategory(item.category);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setBarcode(item.barcode);
    setLocation(item.location || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      itemName,
      category,
      quantity: Number(quantity),
      unit,
      barcode: barcode || null,
      location: location || null,
    };

    try {
      if (selectedItem) {
        await api.put(`/inventory/${selectedItem.id}`, data);
      } else {
        await api.post('/inventory', data);
      }
      setModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = list.filter((i) =>
    i.itemName.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.barcode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
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
            <span>{t('inventory.add')}</span>
          </button>
        )}
      </div>

      {/* Grid Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">No inventory items logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">{t('inventory.itemName')}</th>
                  <th className="px-6 py-4">{t('inventory.category')}</th>
                  <th className="px-6 py-4">{t('inventory.quantity')}</th>
                  <th className="px-6 py-4">{t('inventory.barcode')}</th>
                  <th className="px-6 py-4">{t('inventory.location')}</th>
                  <th className="px-6 py-4">{t('common.status')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{item.itemName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{item.category}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-white">
                      {item.quantity} <span className="text-[10px] text-slate-400 font-normal capitalize">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setBarcodeModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-500 hover:text-white transition-all"
                      >
                        <BarcodeIcon className="w-3.5 h-3.5" />
                        <span>{item.barcode}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{item.location || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                          item.status === 'in-stock'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : item.status === 'low-stock'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {item.status !== 'in-stock' && <AlertTriangle className="w-3 h-3" />}
                        {item.status === 'in-stock'
                          ? t('inventory.instock')
                          : item.status === 'low-stock'
                          ? t('inventory.lowstock')
                          : t('inventory.outstock')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user?.role !== 'volunteer' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(item.id)}
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

      {/* ADD/EDIT ITEM MODAL */}
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
              {selectedItem ? t('inventory.edit') : t('inventory.add')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('inventory.itemName')} *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('inventory.category')} *</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="glass-input"
                    placeholder="Food, Medical, etc."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('inventory.unit')} *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="glass-input"
                    placeholder="kg, boxes, kits"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('inventory.quantity')} *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('inventory.barcode')}</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="glass-input"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('inventory.location')}</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="glass-input"
                />
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

      {/* BARCODE DRAWER MODAL */}
      {barcodeModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 text-center relative animate-reveal">
            <button
              onClick={() => setBarcodeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Item Tracking Barcode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{selectedItem.itemName}</p>

            {/* Barcode image render using bwip-js API */}
            <div className="p-5 bg-white rounded-2xl inline-block shadow-inner mb-6 border border-slate-200">
              <img
                src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(
                  selectedItem.barcode
                )}&scale=2.5&rotate=N&includeText=true`}
                alt="Barcode"
                className="max-w-full h-auto mx-auto"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Barcode ID</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-3 py-1.5 rounded-xl inline-block">
                {selectedItem.barcode}
              </span>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Print Barcode Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
