'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Toast from '../common/Toast';
import RaportPreviewModal from '../raport/RaportPreviewModal';
import LoginScreen from '../auth/LoginScreen';
import { useApp } from '@/context/AppContext';

export default function AppLayout({ children }) {
  const { currentUser } = useApp();

  // Jika belum login, langsung tampilkan layar login
  if (!currentUser) {
    return (
      <>
        <LoginScreen />
        <Toast />
      </>
    );
  }

  // Jika sudah login, tampilkan aplikasi utama
  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col m-0 p-0 overflow-x-hidden">
      {/* Topbar Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-grow w-full px-3 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)] gap-5 items-start">
          {/* Sidebar Left */}
          <Sidebar />

          {/* Dynamic Content Right */}
          <div className="min-w-0 space-y-4">
            {children}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full border-t border-slate-200 bg-white py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2025/2026 <strong>MTs AL AMIRIYYAH</strong> - Blokagung Banyuwangi. All rights reserved.</span>
          <span className="text-[11px] text-slate-400 font-mono">RADISTES v1.0 (Next.js & Tailwind CSS)</span>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toast />

      {/* Global Raport Preview & Print Modal */}
      <RaportPreviewModal />
    </div>
  );
}
