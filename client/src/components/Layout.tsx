import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Navbar } from './Navbar.js';
import { useAuth } from '../contexts/AuthContext.js';
import { FuturisticBackground } from './FuturisticBackground.js';
import { TamilAIChatBox } from './TamilAIChatBox.js';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Redirect to Login if unauthenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50/75 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 flex relative overflow-hidden">
      {/* Moving 3D background */}
      <FuturisticBackground />

      {/* Global AI Chat assistant */}
      <TamilAIChatBox />

      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main panel layout */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 z-10">
        {/* Sticky top navigation */}
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <div key={location.pathname} className="smooth-reveal">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-all duration-300"
        />
      )}
    </div>
  );
};
