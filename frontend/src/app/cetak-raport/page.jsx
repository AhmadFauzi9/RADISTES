'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import PrintableRaport from '@/components/raport/PrintableRaport';

export default function CetakRaportPage() {
  const { 
    currentUser,
    isSuperAdmin,
    isWaliKelas,
    isGuruMapelOnly,
    schoolSettings, 
    selectedClassId, 
    activeClassInfo, 
    currentLeger, 
    openRaportModal,
    showToast 
  } = useApp();

  const [selectedStudentNis, setSelectedStudentNis] = useState(currentLeger[0]?.nis || '');
  const [printMode, setPrintMode] = useState('single');

  // PROTEKSI ROLE: Jika Guru Mapel murni, tolak akses cetak raport
  if (isGuruMapelOnly) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-2xs text-center max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-xs">
          <i className="fa-solid fa-ban"></i>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">Cetak Raport Dikhususkan untuk Wali Kelas</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Akun Anda terdaftar sebagai <strong>{currentUser.nama} ({currentUser.badge})</strong>. Guru mapel tidak memiliki akses mencetak raport kelas, silakan setor nilai melalui menu Setor Nilai.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/setor-nilai"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <i className="fa-solid fa-file-excel"></i>
            <span>Buka Menu Setor & Import Nilai Mapel →</span>
          </Link>
        </div>
      </div>
    );
  }

  const effectiveClassId = isWaliKelas ? currentUser.kelasWali : selectedClassId;
  const activeStudent = currentLeger.find(s => s.nis === selectedStudentNis) || currentLeger[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      
      {/* Header Bar Cetak Raport */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider">
                {isWaliKelas ? `Kelas ${effectiveClassId}` : 'Print & Export PDF'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                CETAK RAPORT STS - KELAS {effectiveClassId}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Template resmi MTs Al Amiriyyah 1:1 Excel. Wali Kelas: <strong>{activeClassInfo?.wali}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/leger"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Kembali ke Leger</span>
            </Link>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              <i className="fa-solid fa-print"></i>
              <span>{printMode === 'all' ? `Cetak Seluruh Siswa (${currentLeger.length} Raport)` : 'Cetak Raport Ini (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* Toolbar Pengaturan Mode Cetak */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Mode Cetak:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setPrintMode('single')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  printMode === 'single' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-user mr-1"></i> Per Siswa (Satuan)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintMode('all');
                  showToast('Mode cetak seluruh kelas diaktifkan. Klik tombol cetak untuk mencetak semua siswa sekaligus.', 'info');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  printMode === 'all' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-users mr-1"></i> Seluruh Kelas Massal ({currentLeger.length} Siswa)
              </button>
            </div>
          </div>

          {printMode === 'single' && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-slate-600 shrink-0">Pilih Siswa:</span>
              <select
                value={selectedStudentNis}
                onChange={(e) => setSelectedStudentNis(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer max-w-xs truncate"
              >
                {currentLeger.map(s => (
                  <option key={s.nis} value={s.nis}>
                    No. {s.no} - {s.nama} (NIS: {s.nis}) - Rank #{s.ranking}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tampilan Dokumen Raport Siap Print */}
      {printMode === 'single' ? (
        <div className="space-y-4">
          <PrintableRaport
            student={activeStudent}
            schoolSettings={schoolSettings}
            classInfo={activeClassInfo}
            totalStudents={currentLeger.length}
          />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="no-print p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-600"></i>
              <span>
                Menampilkan <strong>{currentLeger.length} Raport</strong> berurutan. Saat dicetak atau disimpan ke PDF, setiap siswa otomatis berada di halaman tersendiri (Page-Break A4).
              </span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Cetak Sekarang
            </button>
          </div>

          {currentLeger.map((student) => (
            <div key={student.nis} className="print-page-break">
              <div className="no-print text-center text-xs text-slate-400 font-mono py-1">
                --- Pembatas Halaman Siswa No. {student.no}: {student.nama} ---
              </div>
              <PrintableRaport
                student={student}
                schoolSettings={schoolSettings}
                classInfo={activeClassInfo}
                totalStudents={currentLeger.length}
              />
            </div>
          ))}
        </div>
      )}

      {/* Grid Bawah: Daftar Ringkas Siswa */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-list-check text-brand-600"></i>
          Daftar Siswa Kelas {effectiveClassId} ({currentLeger.length} Siswa)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {currentLeger.map((student) => {
            const isSelected = student.nis === selectedStudentNis && printMode === 'single';
            return (
              <div
                key={student.nis}
                onClick={() => {
                  setSelectedStudentNis(student.nis);
                  setPrintMode('single');
                }}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected 
                    ? 'bg-brand-50 border-brand-400 text-brand-900 shadow-2xs' 
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <p className="font-bold text-xs truncate">
                    {student.no}. {student.nama}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    NIS: {student.nis} • Rerata: <strong>{student.rataRata}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRaportModal(student);
                  }}
                  className="p-1 px-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold shrink-0 transition"
                  title="Buka Modal Preview PDF"
                >
                  <i className="fa-solid fa-eye"></i>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
