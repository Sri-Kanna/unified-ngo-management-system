import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import {
  LayoutDashboard,
  Users,
  HandCoins,
  HeartHandshake,
  Package,
  ShieldAlert,
  Calendar,
  FileBarChart,
  Settings,
  Heart
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, roles: ['admin', 'staff', 'volunteer'] },
    { path: '/beneficiaries', label: t('nav.beneficiaries'), icon: Users, roles: ['admin', 'staff'] },
    { path: '/donations', label: t('nav.donations'), icon: HandCoins, roles: ['admin', 'staff'] },
    { path: '/donors', label: t('nav.donors'), icon: HeartHandshake, roles: ['admin', 'staff'] },
    { path: '/inventory', label: t('nav.inventory'), icon: Package, roles: ['admin', 'staff'] },
    { path: '/volunteers', label: t('nav.volunteers'), icon: ShieldAlert, roles: ['admin', 'staff'] },
    { path: '/events', label: t('nav.events'), icon: Calendar, roles: ['admin', 'staff', 'volunteer'] },
    { path: '/reports', label: t('nav.reports'), icon: FileBarChart, roles: ['admin', 'staff'] },
    { path: '/settings', label: t('nav.settings'), icon: Settings, roles: ['admin', 'staff', 'volunteer'] },
  ];

  const allowedItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } glass`}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Identity Section */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200/30 dark:border-slate-800/30">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">UNMS</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">A K Welfare Trust</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 translate-x-1'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card footer */}
        {user && (
          <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/30 bg-slate-100/20 dark:bg-slate-900/10">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300/30 dark:border-slate-700/30">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize font-medium">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
