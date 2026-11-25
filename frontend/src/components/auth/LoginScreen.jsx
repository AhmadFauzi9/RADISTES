'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const { loginGuru, schoolSettings } = useApp();

  const [username, setUsername] = useState('mutmaina');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    loginGuru(username.trim());
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
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              STS
            </span>
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
          title="Masuk ke Dashboard"
          aria-label="Masuk ke Dashboard"
          >
            <i aria-hidden="true" className="fa-solid fa-right-to-bracket"></i>
          </button>

          {/* Info Akun Demo Ringkas untuk Pengujian */}
          <div className="pt-2 border-t border-slate-100 text-[10.5px] text-slate-400 text-center space-y-0.5">
            <p className="font-semibold text-slate-500">Contoh Akun untuk Uji Coba:</p>
            <p>
              Wali Kelas: <code className="text-brand-600 font-bold">mutmaina</code> (8A) | <code className="text-brand-600 font-bold">emil</code> (7K)
            </p>
            <p>
              Guru Mapel: <code className="text-emerald-600 font-bold">budi</code> atau <code className="text-emerald-600 font-bold">hendra</code>
            </p>
            <p>
              Admin: <code className="text-purple-600 font-bold">admin</code>
            </p>
          </div>

        </form>

        <div className="bg-slate-50 border-t border-slate-100 py-2.5 px-4 text-center text-[10px] text-slate-400">
          RADISTES v1.0 • Portal Raport Tengah Semester
        </div>

      </div>

    </div>
  );
}
