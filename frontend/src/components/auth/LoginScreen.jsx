'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const { loginGuru, schoolSettings, showToast } = useApp();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast?.('Silakan masukkan username.', 'warning');
      return;
    }
    const result = loginGuru(username.trim());
    if (result?.success) {
      router.push('/');
    }
  };

  const handleSelectDemo = (demoUsername) => {
    setUsername(demoUsername);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-brand-500 selection:text-white">
      
      {/* Card Login Bersih Persis ExamLAN Pro */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Gelap */}
        <div className="bg-slate-950 p-6 text-center text-white">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center text-xl shadow-md border border-brand-500/30 mb-2.5">
            <i className="fa-solid fa-book-open-reader"></i>
          </div>
          <h2 className="text-lg font-black tracking-tight flex items-center justify-center gap-1.5">
            <span>RADISTES</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {schoolSettings.namaMadrasah}
          </p>
        </div>

        {/* Form Login Sederhana (Tanpa Opsi Role) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username guru..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 outline-none font-mono transition"
            />
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <i className="fa-solid fa-right-to-bracket"></i>
            <span>Masuk ke Dashboard</span>
          </button>

          {/* Info Akun Demo Ringkas untuk Pengujian */}
          <div className="pt-2 border-t border-slate-100 text-[10.5px] text-slate-400 text-center space-y-1">
            <p className="font-semibold text-slate-500">Klik Akun untuk Coba Cepat:</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleSelectDemo('mutmaina')}
                className="px-2 py-0.5 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-bold transition text-[10.5px] cursor-pointer"
              >
                mutmaina (8A)
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('emil')}
                className="px-2 py-0.5 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-bold transition text-[10.5px] cursor-pointer"
              >
                emil (7K)
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('budi')}
                className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold transition text-[10.5px] cursor-pointer"
              >
                budi (Mapel)
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('admin')}
                className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold transition text-[10.5px] cursor-pointer"
              >
                admin
              </button>
            </div>
          </div>

        </form>

        <div className="bg-slate-50 border-t border-slate-100 py-2.5 px-4 text-center text-[10px] text-slate-400">
          RADISTES v1.0 • Portal Raport Tengah Semester
        </div>

      </div>

    </div>
  );
}
