import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Link } from 'react-router-dom';
import {
  Users,
  HandCoins,
  ShieldAlert,
  Calendar,
  Package,
  TrendingUp,
  Activity,
  Plus,
  FileText,
  UserPlus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TiltCard } from '../components/TiltCard.js';

interface DashboardStats {
  cards: {
    beneficiaries: number;
    volunteers: number;
    donations: {
      totalAmount: string;
      count: number;
    };
    events: number;
    inventory: number;
  };
  charts: {
    monthlyDonations: { month: string; total: number }[];
    resourceDist: { name: string; value: number }[];
    beneficiaryGrowth: { month: string; count: number }[];
    eventParticipation: { title: string; participants: number }[];
  };
  upcomingEvents: {
    id: string;
    title: string;
    startTime: string;
    location: string;
  }[];
}

interface RecentActivity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userName: string | null;
}

export const Dashboard: React.FC = () => {
  const { t, language, tText } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-activity'),
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
      </div>
    );
  }

  const PIE_COLORS = ['#3b66ff', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Format currency helper
  const formatCurrency = (amt: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(parseFloat(amt));
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {t('dashboard.welcome')}, {tText(user?.name)}!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Here is what is happening at the trust today.
          </p>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-3 py-1.5 rounded-xl self-start">
          {new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Beneficiaries Card */}
        <TiltCard className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('dashboard.stats.beneficiaries')}
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.cards.beneficiaries}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </TiltCard>

        {/* Donations Card */}
        <TiltCard className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('dashboard.stats.donations')}
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate">
              {formatCurrency(stats.cards.donations.totalAmount)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <HandCoins className="w-5 h-5" />
          </div>
        </TiltCard>

        {/* Volunteers Card */}
        <TiltCard className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('dashboard.stats.volunteers')}
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.cards.volunteers}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </TiltCard>

        {/* Inventory Card */}
        <TiltCard className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('dashboard.stats.inventory')}
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.cards.inventory}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </TiltCard>

        {/* Events Card */}
        <TiltCard className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('dashboard.stats.events')}
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.cards.events}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </TiltCard>
      </div>

      {/* CHARTS LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Donations Chart */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('dashboard.charts.donationsTrend')}</h4>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.charts.monthlyDonations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b66ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b66ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.15)" />
                <XAxis dataKey="month" stroke="currentColor" className="text-[10px] text-slate-400 font-semibold" />
                <YAxis stroke="currentColor" className="text-[10px] text-slate-400 font-semibold" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b66ff" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Distribution (Bar Chart) */}
        <div className="glass-card p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('dashboard.charts.resourceDistribution')}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.resourceDist.map(item => ({ ...item, name: tText(item.name) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.15)" />
                <XAxis dataKey="name" stroke="currentColor" className="text-[10px] text-slate-400 font-semibold" />
                <YAxis stroke="currentColor" className="text-[10px] text-slate-400 font-semibold" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Beneficiary Growth (Area) */}
        <div className="glass-card p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('dashboard.charts.beneficiaryGrowth')}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.charts.beneficiaryGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.15)" />
                <XAxis dataKey="month" stroke="currentColor" className="text-[10px] text-slate-400 font-semibold" />
                <YAxis stroke="currentColor" className="text-[10px] text-slate-400 font-semibold" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Participation (Pie Chart) */}
        <div className="glass-card p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('dashboard.charts.eventParticipation')}</h4>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.charts.eventParticipation.map(item => ({ ...item, title: tText(item.title) }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="participants"
                    nameKey="title"
                  >
                    {stats.charts.eventParticipation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 text-xs">
              {stats.charts.eventParticipation.map((entry, index) => (
                <div key={entry.title} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{tText(entry.title)}</span>
                  <span className="text-slate-400 font-bold">({entry.participants})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WIDGETS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent System Activity */}
        <div className="glass-card p-5 space-y-4 lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('dashboard.widgets.recentActivity')}</h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto pr-2 space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3 pt-3 first:pt-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs flex-shrink-0 text-slate-500 dark:text-slate-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {tText(act.details)}
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-400 font-medium mt-1">
                    <span>By: {tText(act.userName) || 'System'}</span>
                    <span>•</span>
                    <span>{new Date(act.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions (only for Admin/Staff) */}
          {user?.role !== 'volunteer' && (
            <div className="glass-card p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('dashboard.widgets.quickActions')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/beneficiaries"
                  className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex flex-col items-center justify-center gap-2 hover:bg-brand-500 hover:text-white transition-all text-center group border border-brand-500/10"
                >
                  <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Add Beneficiary</span>
                </Link>
                <Link
                  to="/donations"
                  className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all text-center group border border-emerald-500/10"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Record Donation</span>
                </Link>
                <Link
                  to="/reports"
                  className="p-3 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex flex-col items-center justify-center gap-2 hover:bg-violet-500 hover:text-white transition-all text-center group border border-violet-500/10"
                >
                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Generate Report</span>
                </Link>
                <Link
                  to="/events"
                  className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all text-center group border border-rose-500/10"
                >
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Schedule Event</span>
                </Link>
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div className="glass-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('dashboard.widgets.upcomingEvents')}</h4>
            <div className="space-y-3">
              {stats.upcomingEvents.length > 0 ? (
                stats.upcomingEvents.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{tText(evt.title)}</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(evt.startTime).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{tText(evt.location)}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">No upcoming events scheduled</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
