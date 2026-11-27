'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

const dropdownPanel = 'absolute right-0 z-50 mt-2 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl';

export default function Header() {
  const { 
    schoolSettings, 
    currentUser,
    logout,
    isSuperAdmin,
    isWaliKelas,
    pendingSubmissions 
  } = useApp();

  const [openDropdown, setOpenDropdown] = useState(null);
  const actionsRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const accountButtonRef = useRef(null);
  const accountName = currentUser?.nama || currentUser?.username || '';
  const accountInitials = accountName.trim().split(/\s+/).slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
  const avatarTone = isSuperAdmin ? 'border-purple-500/40 bg-purple-600/30 text-purple-300'
    : isWaliKelas ? 'border-brand-500/40 bg-brand-600/30 text-brand-300'
    : 'border-emerald-500/40 bg-emerald-600/30 text-emerald-300';

  useEffect(() => {
    if (!openDropdown) return;

    function closeOutside(event) {
      if (!actionsRef.current?.contains(event.target)) setOpenDropdown(null);
    }

    function closeWithEscape(event) {
      if (event.key !== 'Escape') return;
      setOpenDropdown(null);
      const trigger = openDropdown === 'account' ? accountButtonRef : notificationButtonRef;
      trigger.current?.focus();
    }

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeWithEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, [openDropdown]);

  function toggleDropdown(name) {
    setOpenDropdown(previous => previous === name ? null : name);
  }

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2.5 flex justify-between items-center gap-2 sm:gap-4">
        
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 min-w-0 hover:opacity-95 transition">
          <div className="bg-brand-600 p-2 sm:p-2.5 rounded-xl text-white flex items-center justify-center shadow-xs shrink-0">
            <i className="fa-solid fa-book-open-reader text-lg sm:text-xl"></i>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide text-white">
                RADISTES
              </h1>
              <span className="hidden sm:inline-block bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate">
              Raport Digital Sumatif Tengah Semester  • {schoolSettings.namaMadrasah}
            </p>
          </div>
        </Link>

        {/* Notifikasi, profil, dan keluar */}
        <div ref={actionsRef} className="relative flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Notifikasi Setoran Guru Mapel */}
          <div className="sm:relative">
            <button
              type="button"
              ref={notificationButtonRef}
              onClick={() => toggleDropdown('notifications')}
              className="relative cursor-pointer rounded-xl p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              data-tooltip="Notifikasi Setoran Nilai Masuk"
              aria-label="Notifikasi Setoran Nilai Masuk"
              aria-expanded={openDropdown === 'notifications'}
            >
              <i aria-hidden="true" className="fa-solid fa-bell text-sm sm:text-base"></i>
              {pendingSubmissions.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {openDropdown === 'notifications' && (
              <div className={`${dropdownPanel} top-full w-72 space-y-2 p-3 animate-in fade-in zoom-in-95 duration-150 sm:w-80`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-inbox text-brand-600"></i> Setoran Nilai Masuk
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {pendingSubmissions.length} Data
                  </span>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {pendingSubmissions.map(sub => (
                    <div key={sub.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 transition text-left text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-brand-700">{sub.mapelName}</span>
                        <span className="text-[10px] text-slate-400">{sub.waktu}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Guru: {sub.guru}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                        <span>{sub.count} Siswa {sub.kelasId}</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <i className="fa-solid fa-circle-check"></i> Siap disinkron
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/setor-nilai"
                  onClick={() => setOpenDropdown(null)}
                  className="block text-center text-xs font-bold text-brand-600 hover:text-brand-800 pt-1"
                >
                  Buka Portal Setor Nilai →
                </Link>
              </div>
            )}
          </div>

          {currentUser && (
            <div className="relative">
              <button
                ref={accountButtonRef}
                type="button"
                onClick={() => toggleDropdown('account')}
                aria-label="Informasi akun"
                aria-expanded={openDropdown === 'account'}
                aria-controls={openDropdown === 'account' ? 'navbar-account-details' : undefined}
                className="flex cursor-pointer items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 text-xs font-semibold text-white transition hover:text-brand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-bold ${avatarTone}`}>
                  {accountInitials}
                </span>
                <span className="max-w-20 truncate sm:max-w-36">{currentUser.username || accountName}</span>
                <i aria-hidden="true" className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openDropdown === 'account' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'account' && (
                <div id="navbar-account-details" className={`${dropdownPanel} w-56 p-2`}>
                  <div className="flex items-center gap-2.5 border-b border-slate-100 px-2 pb-3 pt-2">
                    <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {accountInitials}
                    </span>
                    <div className="min-w-0 break-words leading-tight">
                      <p className="text-xs font-bold text-slate-900">{accountName}</p>
                      <p className="mt-0.5 text-[11px] text-slate-600">{isSuperAdmin ? 'Admin' : currentUser.badge}</p>
                    </div>
                  </div>
                  <button type="button" onClick={logout} aria-label="Keluar dari akun (Logout)"
                    className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-rose-700 transition hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-2 focus-visible:outline-rose-500">
                    <i aria-hidden="true" className="fa-solid fa-right-from-bracket" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
