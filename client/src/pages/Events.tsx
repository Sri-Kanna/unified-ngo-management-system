import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Plus, Search, Edit, Trash2, X, Calendar, MapPin, CheckSquare, Square, UserPlus } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number | null;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

interface Participant {
  id: string;
  role: string;
  attended: boolean;
  registeredAt: string;
  userName: string;
  userEmail: string;
  userId: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const Events: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [list, setList] = useState<EventItem[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Active selected event for details & attendance
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Event Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [status, setStatus] = useState<EventItem['status']>('scheduled');

  // Register Participant Form Fields
  const [regUserId, setRegUserId] = useState('');
  const [regRole, setRegRole] = useState<'volunteer' | 'beneficiary' | 'staff'>('volunteer');

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setList(response.data);
      if (response.data.length > 0 && !activeEvent) {
        handleSelectEvent(response.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // In a real app we might fetch user list, let's reuse volunteers/beneficiary/users
      const res = await api.get('/volunteers'); // Fallback to list of volunteers
      setUsersList(
        res.data.map((v: any) => ({
          id: v.userId || v.id,
          name: v.name,
          email: v.email,
          role: 'volunteer',
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  const handleSelectEvent = async (event: EventItem) => {
    setActiveEvent(event);
    setLoadingParticipants(true);
    try {
      const res = await api.get(`/events/${event.id}/participants`);
      setParticipants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const openAddModal = () => {
    setSelectedEvent(null);
    setTitle('');
    setDescription('');
    setStartTime(new Date().toISOString().substring(0, 16));
    setEndTime(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().substring(0, 16));
    setLocation('');
    setCapacity('');
    setStatus('scheduled');
    setModalOpen(true);
  };

  const openEditModal = (event: EventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setStartTime(new Date(event.startTime).toISOString().substring(0, 16));
    setEndTime(new Date(event.endTime).toISOString().substring(0, 16));
    setLocation(event.location);
    setCapacity(event.capacity || '');
    setStatus(event.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description: description || null,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      location,
      capacity: capacity ? Number(capacity) : null,
      status,
    };

    try {
      if (selectedEvent) {
        const res = await api.put(`/events/${selectedEvent.id}`, data);
        if (activeEvent?.id === selectedEvent.id) {
          setActiveEvent(res.data);
        }
      } else {
        await api.post('/events', data);
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      if (activeEvent?.id === id) {
        setActiveEvent(null);
        setParticipants([]);
      }
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAttendance = async (participantId: string, currentStatus: boolean) => {
    if (user?.role === 'volunteer') return; // Volunteers cannot record attendance
    try {
      await api.post(`/events/${activeEvent?.id}/attendance`, {
        participantId,
        attended: !currentStatus,
      });
      // Update local state
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, attended: !currentStatus } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const openRegisterModal = () => {
    if (usersList.length > 0) {
      setRegUserId(usersList[0].id);
    }
    setRegRole('volunteer');
    setRegModalOpen(true);
  };

  const handleRegisterParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/events/${activeEvent?.id}/register`, {
        userId: regUserId,
        role: regRole,
      });
      setRegModalOpen(false);
      if (activeEvent) {
        handleSelectEvent(activeEvent);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = list.filter((evt) =>
    evt.title.toLowerCase().includes(search.toLowerCase()) ||
    evt.location.toLowerCase().includes(search.toLowerCase())
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
            <span>{t('event.add')}</span>
          </button>
        )}
      </div>

      {/* Grid Layout: Left (Events List), Right (Interactive Details & Attendance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Events list */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="glass-card py-20 text-center text-xs text-slate-500 font-medium">{t('common.loading')}</div>
          ) : filtered.length === 0 ? (
            <div className="glass-card py-20 text-center text-xs text-slate-500 font-medium">No events found.</div>
          ) : (
            filtered.map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleSelectEvent(evt)}
                className={`glass-card p-5 cursor-pointer border border-white/20 transition-all ${
                  activeEvent?.id === evt.id
                    ? 'ring-2 ring-brand-500/50 bg-brand-500/5 dark:bg-brand-500/5 border-brand-500/30'
                    : 'hover:border-slate-300 dark:hover:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                          evt.status === 'completed'
                            ? 'bg-slate-500/10 text-slate-600'
                            : evt.status === 'ongoing'
                            ? 'bg-indigo-500/10 text-indigo-600'
                            : evt.status === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{evt.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                      {evt.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-400 font-semibold pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(evt.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{evt.location}</span>
                      </div>
                    </div>
                  </div>

                  {user?.role !== 'volunteer' && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => openEditModal(evt, e)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={(e) => handleDelete(evt.id, e)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Interactive Attendance Sheet */}
        <div className="space-y-6">
          {activeEvent ? (
            <div className="glass-card p-5 space-y-6 sticky top-24">
              <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{activeEvent.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {activeEvent.location}
                </p>
              </div>

              {/* Attendance roster list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('event.participants')}
                  </h4>
                  {user?.role !== 'volunteer' && (
                    <button
                      onClick={openRegisterModal}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-500 hover:text-brand-600 transition-all border border-brand-500/10 px-2.5 py-1 rounded-lg hover:bg-brand-500/5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register</span>
                    </button>
                  )}
                </div>

                {loadingParticipants ? (
                  <div className="py-10 text-center text-xs text-slate-500 font-medium">Loading roster...</div>
                ) : participants.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 font-medium">No registrations yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[280px] overflow-y-auto pr-1 space-y-2.5">
                    {participants.map((part) => (
                      <div
                        key={part.id}
                        onClick={() => toggleAttendance(part.id, part.attended)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border border-transparent transition-all ${
                          user?.role !== 'volunteer' ? 'cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-900/40 hover:border-slate-200/40 dark:hover:border-slate-800/40' : ''
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{part.userName}</div>
                          <div className="text-[10px] text-slate-400 font-medium capitalize">{part.role}</div>
                        </div>

                        {part.attended ? (
                          <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow shadow-emerald-500/20 border border-emerald-600/20">
                            <CheckSquare className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 flex items-center justify-center">
                            <Square className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-10 text-center text-xs text-slate-400 font-medium">
              Select an event to view details and record attendance.
            </div>
          )}
        </div>
      </div>

      {/* EVENT FORM MODAL */}
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
              {selectedEvent ? t('event.edit') : t('event.add')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('event.eventTitle')} *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('event.description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('event.startTime')} *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('event.endTime')} *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('event.location')} *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">{t('event.capacity')}</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{t('common.status')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventItem['status'])}
                  className="glass-input"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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

      {/* REGISTER PARTICIPANT MODAL */}
      {regModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 relative animate-reveal">
            <button
              onClick={() => setRegModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">{t('event.register')}</h3>

            <form onSubmit={handleRegisterParticipant} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Select User/Volunteer</label>
                <select
                  value={regUserId}
                  onChange={(e) => setRegUserId(e.target.value)}
                  className="glass-input"
                  required
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Role in Event</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as 'volunteer' | 'beneficiary' | 'staff')}
                  className="glass-input"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="beneficiary">Beneficiary</option>
                  <option value="staff">Staff Helper</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setRegModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-premium px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
