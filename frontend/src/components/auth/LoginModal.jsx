'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function LoginModal() {
  const { isLoginModalOpen, setIsLoginModalOpen, currentUser, presetUsers, handleLogin } = useApp();

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <i className="fa-solid fa-users-gear"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Ganti Akun & Role Guru</h3>
              <p className="text-[11px] text-slate-500">Pilih profil role untuk mensimulasikan hak akses di aplikasi RADISTES</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          title="Tutup Modal"
          aria-label="Tutup Modal"
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* User Card List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
          {presetUsers.map((user) => {
            const isCurrent = currentUser.id === user.id;
            const isWali = user.role === 'walikelas';
            const isAdmin = user.role === 'admin';

            return (
              <div
                key={user.id}
                onClick={() => handleLogin(user)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isAdmin 
                      ? 'bg-purple-100 text-purple-700' 
                      : isWali 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <i className={`fa-solid ${isAdmin ? 'fa-shield-halved' : isWali ? 'fa-user-tie' : 'fa-chalkboard-user'}`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{user.nama}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <span className={`font-semibold ${
                        isAdmin ? 'text-purple-600' : isWali ? 'text-brand-600' : 'text-emerald-600'
                      }`}>
                        {user.badge}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{user.telp}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isCurrent ? (
                    <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                      Aktif
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 text-[11px] font-semibold hover:bg-brand-600 hover:text-white transition"
                    title="Masuk"
                    aria-label="Masuk"
                    >
                      <i aria-hidden="true" className="fa-solid fa-right-to-bracket" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Petunjuk Hak Akses */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info text-brand-600"></i> Ketentuan Hak Akses Role:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
            <li><strong>Admin</strong>: Akses penuh ke semua 49 kelas, atur penugasan wali kelas, dan import SK.</li>
            <li><strong>Wali Kelas</strong>: Hanya dapat mengelola Leger & Cetak Raport untuk kelas yang diampunya saja.</li>
            <li><strong>Guru Mapel</strong>: Menu Leger & Cetak Raport disembunyikan. Hanya dapat setor & import nilai DKN.</li>
          </ul>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          title="Tutup"
          aria-label="Tutup"
          >
            <i aria-hidden="true" className="fa-solid fa-xmark" />
          </button>
        </div>

      </div>
    </div>
  );
}
