'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const { 
    schoolSettings, 
    currentUser,
    logout,
    isSuperAdmin,
    isWaliKelas,
    isGuruMapelOnly,
    selectedClassId, 
    setSelectedClassId, 
    allClasses, 
    activeClassInfo,
    pendingSubmissions 
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

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
              {schoolSettings.namaMadrasah} • Raport Sumatif Tengah Semester
            </p>
          </div>
        </Link>

        {/* Right Section: Class Selector, Notifications, User Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          
          {/* Quick Class Switcher Dropdown (Hanya jika Admin atau Wali Kelas) */}
          {!isGuruMapelOnly && currentUser && (
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <i className="fa-solid fa-chalkboard-user text-xs text-brand-400"></i>
              <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">Kelas:</span>
              
              {isWaliKelas ? (
                // Jika Wali Kelas: Terkunci otomatis ke kelas yang diampunya saja
                <span className="text-white text-xs font-bold pl-1">
                  Kelas {currentUser.kelasWali} <span className="text-[10px] text-amber-400 font-normal">(Kelas Anda)</span>
                </span>
              ) : (
                // Jika Admin: Bebas pilih 49 kelas
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-1"
                >
                  <optgroup label="Kelas 7">
                    {allClasses.filter(c => c.tingkat === '7').map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        Kelas {c.nama} ({c.wali})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Kelas 8">
                    {allClasses.filter(c => c.tingkat === '8').map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        Kelas {c.nama} ({c.wali})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Kelas 9">
                    {allClasses.filter(c => c.tingkat === '9').map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        Kelas {c.nama} ({c.wali})
                      </option>
                    ))}
                  </optgroup>
                </select>
              )}
            </div>
          )}

          {/* Notifikasi Setoran Guru Mapel */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition focus:outline-none cursor-pointer"
              title="Notifikasi Setoran Nilai Masuk"
            >
              <i className="fa-solid fa-bell text-sm sm:text-base"></i>
              {pendingSubmissions.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
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
                  onClick={() => setShowNotifDropdown(false)}
                  className="block text-center text-xs font-bold text-brand-600 hover:text-brand-800 pt-1"
                >
                  Buka Portal Setor Nilai →
                </Link>
              </div>
            )}
          </div>

          {/* User Profile Info & Logout Button (Persis ExamLAN Pro) */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                isSuperAdmin 
                  ? 'bg-purple-600/30 border border-purple-500/40 text-purple-300' 
                  : isWaliKelas 
                  ? 'bg-brand-600/30 border border-brand-500/40 text-brand-300' 
                  : 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300'
              }`}>
                <i className={`fa-solid ${isSuperAdmin ? 'fa-shield-halved' : isWaliKelas ? 'fa-user-tie' : 'fa-chalkboard-user'}`}></i>
              </div>
              
              <div className="leading-tight min-w-0 hidden sm:block">
                <div className="font-bold text-xs text-white truncate max-w-[150px]">
                  {currentUser.nama}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <span className={`font-semibold ${
                    isSuperAdmin ? 'text-purple-400' : isWaliKelas ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {currentUser.badge}
                  </span>
                </div>
              </div>

              {/* Garis pemisah kecil */}
              <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block"></div>

              {/* Tombol Logout Resmi ExamLAN Pro */}
              <button
                type="button"
                onClick={logout}
                className="p-1.5 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
                title="Keluar dari akun (Logout)"
              >
                <i className="fa-solid fa-right-from-bracket text-xs text-rose-400 group-hover:text-white transition-colors"></i>
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
