'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { 
    currentUser, 
    logout,
    isSuperAdmin, 
    isWaliKelas, 
    isGuruMapelOnly, 
    pendingSubmissions 
  } = useApp();

  // Susun daftar menu sesuai Hak Akses Role
  const ALL_MENU_ITEMS = [
    { 
      key: 'dashboard', 
      title: 'Dashboard STS', 
      icon: 'fa-chart-pie', 
      path: '/',
      visible: true 
    },
    { 
      key: 'leger', 
      title: 'Leger Nilai STS', 
      icon: 'fa-table-list', 
      path: '/leger', 
      badge: isWaliKelas ? `Kelas ${currentUser.kelasWali}` : 'Inti',
      // Guru Mapel murni TIDAK BOLEH mengakses halaman Leger Raport!
      visible: !isGuruMapelOnly 
    },
    { 
      key: 'cetak-raport', 
      title: 'Cetak Raport PDF', 
      icon: 'fa-print', 
      path: '/cetak-raport', 
      badge: isWaliKelas ? currentUser.kelasWali : null,
      // Guru Mapel murni TIDAK BOLEH mencetak raport kelas!
      visible: !isGuruMapelOnly 
    },
    { 
      key: 'setor-nilai', 
      title: 'Setor & Import Nilai', 
      icon: 'fa-file-excel', 
      path: '/setor-nilai', 
      notifCount: pendingSubmissions.length,
      badge: isGuruMapelOnly ? 'Utama' : null,
      visible: true 
    },
    { 
      key: 'data-siswa', 
      title: isSuperAdmin ? 'Data Siswa & Wali' : isWaliKelas ? `Siswa ${currentUser.kelasWali}` : 'Data Siswa', 
      icon: 'fa-users', 
      path: '/data-siswa',
      visible: true 
    },
    { 
      key: 'pengaturan', 
      title: 'Pengaturan Raport', 
      icon: 'fa-gear', 
      path: '/pengaturan',
      // Pengaturan lembaga hanya untuk Admin & Wali Kelas
      visible: !isGuruMapelOnly 
    }
  ];

  const visibleMenus = ALL_MENU_ITEMS.filter(m => m.visible);

  return (
    <aside className="sticky top-16 z-20 w-full md:w-[230px] shrink-0">
      <nav className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-row md:flex-col gap-1 w-full overflow-x-auto md:overflow-visible custom-scrollbar">
        
        {/* Info Pengguna Aktif */}
        <div className="hidden md:block p-2.5 mb-1 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Guru yang Login:</span>
          <div className="font-bold text-xs text-slate-800 truncate flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              isSuperAdmin ? 'bg-purple-500' : isWaliKelas ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
            <span className="truncate">{currentUser?.nama || 'Guru'}</span>
          </div>
          <p className="text-[10px] font-semibold text-brand-600 mt-0.5 truncate">
            {currentUser?.badge || '-'}
          </p>
        </div>

        {visibleMenus.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          const activeClass = isActive
            ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-2xs'
            : 'text-slate-600 hover:bg-slate-50 font-medium hover:text-slate-900 border border-transparent';
          const iconColor = isActive ? 'text-brand-600' : 'text-slate-400';

          return (
            <Link
              key={item.key}
              href={item.path}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition shrink-0 md:shrink ${activeClass}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <i className={`fa-solid ${item.icon} w-4 text-center text-sm ${iconColor}`}></i>
                <span className="whitespace-nowrap">{item.title}</span>
              </div>
              
              {item.badge && (
                <span className="hidden md:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  {item.badge}
                </span>
              )}

              {item.notifCount !== undefined && item.notifCount > 0 && (
                <span className="ml-auto bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                  {item.notifCount}
                </span>
              )}
            </Link>
          );
        })}

        <hr className="hidden md:block my-2 border-slate-100" />

        {/* Info Petunjuk Role */}
        <div className="hidden md:block p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700 flex items-center gap-1.5">
            <i className="fa-solid fa-shield-halved text-brand-600"></i> Mode {currentUser.role.toUpperCase()}:
          </p>
          {isGuruMapelOnly ? (
            <p className="text-[10px] text-slate-600 leading-tight">
              Anda login sebagai <strong>Guru Mapel</strong>. Anda hanya dapat memasukkan & mengimpor nilai DKN untuk mapel yang Anda ajar.
            </p>
          ) : isWaliKelas ? (
            <p className="text-[10px] text-slate-600 leading-tight">
              Anda login sebagai <strong>Wali Kelas {currentUser.kelasWali}</strong>. Data leger dan cetak raport otomatis terfokus pada kelas Anda.
            </p>
          ) : (
            <p className="text-[10px] text-slate-600 leading-tight">
              Anda login sebagai <strong>Administrator</strong>. Memiliki akses penuh ke seluruh 49 kelas dan penugasan wali kelas.
            </p>
          )}
        </div>
        {/* Tombol Logout Sesuai ExamLAN Pro */}
        <hr className="hidden md:block my-1 border-slate-100" />
        <button
          type="button"
          onClick={logout}
          className="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-medium transition w-full text-left cursor-pointer"
          title="Keluar dari Akun"
        >
          <i className="fa-solid fa-right-from-bracket w-4 text-center text-sm text-rose-500"></i>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
