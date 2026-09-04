import React from 'react';
import { useTheme } from '../contexts/ThemeContext.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Languages, LogOut, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Extract path name to show header label
  const getHeaderTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return t('nav.dashboard');
    return t(`nav.${path}`) || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-6 border-b border-slate-200/50 dark:border-slate-800/50 glass">
      {/* Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-all">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Language selector */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <Languages className="w-4.5 h-4.5" />
            <span className="text-xs font-semibold uppercase">{language}</span>
          </button>
          <div className="absolute right-0 top-full mt-1 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
            <button
              onClick={() => setLanguage('en')}
              className={`w-full px-4 py-2 text-left text-xs font-medium transition-colors ${
                language === 'en' ? 'bg-brand-500/10 text-brand-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`w-full px-4 py-2 text-left text-xs font-medium transition-colors ${
                language === 'ta' ? 'bg-brand-500/10 text-brand-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-500/10 rounded-xl transition-all font-medium text-xs active:scale-95"
          title={t('nav.logout')}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{t('nav.logout')}</span>
        </button>
      </div>
    </header>
  );
};
