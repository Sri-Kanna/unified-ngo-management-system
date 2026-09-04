import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { LanguageProvider } from './contexts/LanguageContext.js';
import { AuthProvider } from './contexts/AuthContext.js';
import { Layout } from './components/Layout.js';
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { Beneficiaries } from './pages/Beneficiaries.js';
import { Donors } from './pages/Donors.js';
import { Donations } from './pages/Donations.js';
import { Inventory } from './pages/Inventory.js';
import { Volunteers } from './pages/Volunteers.js';
import { Events } from './pages/Events.js';
import { Reports } from './pages/Reports.js';
import { Settings } from './pages/Settings.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />

              {/* Private routes within main layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="beneficiaries" element={<Beneficiaries />} />
                <Route path="donors" element={<Donors />} />
                <Route path="donations" element={<Donations />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="volunteers" element={<Volunteers />} />
                <Route path="events" element={<Events />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch-all fallback redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
