import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { useTheme } from '../contexts/ThemeContext.js';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Heart, Languages, Sun, Moon } from 'lucide-react';
import { FuturisticBackground } from '../components/FuturisticBackground.js';
import { TiltCard } from '../components/TiltCard.js';

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to Dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative overflow-hidden">
      {/* Moving 3D background */}
      <FuturisticBackground />

      {/* LEFT PANEL: Branding & Dynamic Layout */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900/40 dark:bg-slate-950/40 relative overflow-hidden items-center justify-center p-12 text-white border-r border-slate-200/10 backdrop-blur-xs">
        {/* Soft floating background light blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-500/10 blur-[120px]" />

        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          {/* Glowing identity box */}
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/30 mb-8 border border-brand-400/20">
            <Heart className="w-8 h-8 fill-current animate-pulse" />
          </div>
          
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            {t('login.title')}
          </h2>
          
          <p className="text-base text-slate-400 max-w-sm mb-12 font-medium">
            {t('login.subtitle')}
          </p>

          {/* Minimal illustrative vector graph / wireframe */}
          <TiltCard enableSound={false} className="w-full max-w-md p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">NGO Dashboard Preview</span>
            </div>
            {/* Mock chart skeleton */}
            <div className="space-y-3">
              <div className="h-16 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between px-4">
                <div className="space-y-1.5 text-left">
                  <div className="w-24 h-2 bg-slate-600 rounded" />
                  <div className="w-16 h-1.5 bg-slate-700 rounded" />
                </div>
                <div className="w-12 h-6 bg-brand-500/20 border border-brand-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-brand-400">+14%</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-12 rounded-xl bg-white/5 border border-white/5" />
                <div className="h-12 rounded-xl bg-white/5 border border-white/5 col-span-2" />
              </div>
            </div>
          </TiltCard>
        </div>
      </div>

      {/* RIGHT PANEL: Sign-in Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 xl:px-24 relative z-10">
        {/* Floating Controls for Theme & Lang */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          {/* Lang Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl transition-all">
              <Languages className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
              <button
                onClick={() => setLanguage('en')}
                className={`w-full px-4 py-2 text-left text-xs font-semibold ${
                  language === 'en' ? 'bg-brand-500/10 text-brand-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`w-full px-4 py-2 text-left text-xs font-semibold ${
                  language === 'ta' ? 'bg-brand-500/10 text-brand-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Brand identity on Mobile */}
        <div className="flex items-center gap-3 lg:hidden mb-8 self-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white shadow-md">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('login.title')}</h1>
        </div>

        {/* Login form Glassmorphism Card */}
        <TiltCard className="w-full max-w-md mx-auto glass-card p-8 md:p-10 shadow-2xl relative">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('login.cardTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Welcome to UNMS portal. Please enter your credentials.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('login.email')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@unms.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-10"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('login.password')}</label>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-brand-500 hover:text-brand-600 transition-colors">
                  {t('login.forgotPassword')}
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30 dark:bg-slate-900 dark:border-slate-800"
                />
                {t('login.rememberMe')}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('login.loginButton')
              )}
            </button>
          </form>

          {/* Quick info helpers */}
          <div className="mt-8 pt-6 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider block mb-2">Seed Accounts:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20">
                <span className="font-bold block text-slate-700 dark:text-slate-300">Admin</span>
                admin@unms.org / Admin@123
              </div>
              <div className="p-2 rounded bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20">
                <span className="font-bold block text-slate-700 dark:text-slate-300">Staff</span>
                staff@unms.org / Staff@123
              </div>
              <div className="p-2 rounded bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20">
                <span className="font-bold block text-slate-700 dark:text-slate-300">Volunteer</span>
                volunteer@unms.org / Volunteer@123
              </div>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
};
