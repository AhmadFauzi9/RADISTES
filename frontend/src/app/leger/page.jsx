'use client';

import ModuleSearch from '@/components/common/ModuleSearch';
import ModuleHeading from '@/components/common/ModuleHeading';
import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import ImportDknModal from '@/components/import/ImportDknModal';

const toolbarButton = 'module-action';

export default function LegerPage() {
  const { 
    currentUser,
    isSuperAdmin,
    isWaliKelas,
    isGuruMapelOnly,
    schoolSettings, 
    selectedClassId, 
    setSelectedClassId,
    activeClassInfo, 
    allClasses,
    allMapel, 
    currentLeger, 
    updateStudentGrade, 
    updateStudentMeta,
    classStatus, 
    toggleLockClass,
    openRaportModal, 
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [levelFilter, setLevelFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [activeTab, setActiveTab] = useState('nilai');
  const [isDknModalOpen, setIsDknModalOpen] = useState(false);

  // PROTEKSI ROLE: Jika Guru Mapel murni, tolak akses dan tampilkan peringatan
  if (isGuruMapelOnly) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-2xs text-center max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-xs">
          <i className="fa-solid fa-lock"></i>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">Akses Khusus Wali Kelas & Admin</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Akun Anda terdaftar sebagai <strong>{currentUser.nama} ({currentUser.badge})</strong>. Anda tidak memiliki penugasan sebagai Wali Kelas sehingga tidak dapat mengelola Leger Raport kelas ini.
          </p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 text-left space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info text-amber-600"></i> Menu yang Tersedia untuk Guru Mapel:
          </p>
          <p className="text-[11px]">
            Silakan gunakan menu <strong>Setor & Import Nilai DKN</strong> untuk menginput atau mengunggah nilai mata pelajaran yang Anda ampu.
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

  // Jika Wali Kelas, pastikan kelas yang dikelola adalah kelasnya sendiri
  const effectiveClassId = isWaliKelas ? currentUser.kelasWali : selectedClassId;
  const isLocked = classStatus[effectiveClassId]?.isLocked || false;

  // Filter siswa
  const filteredStudents = currentLeger.filter(student => {
    const matchSearch = student.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        student.nis.includes(searchQuery);
    if (!matchSearch) return false;

    const grades = student.grades || {};
    const filledCount = allMapel.filter(m => grades[m.key] !== '' && grades[m.key] !== null && grades[m.key] !== undefined).length;
    const isComplete = filledCount === allMapel.length;

    if (filterStatus === 'complete') return isComplete;
    if (filterStatus === 'incomplete') return !isComplete;
    if (filterStatus === 'belowKKM') {
      return allMapel.some(m => {
        const val = grades[m.key];
        return val !== '' && val !== null && val !== undefined && Number(val) < m.kkm;
      });
    }

    return true;
  });

  const completeCount = currentLeger.filter(s => {
    const grades = s.grades || {};
    return allMapel.filter(m => grades[m.key] !== '' && grades[m.key] !== null && grades[m.key] !== undefined).length === allMapel.length;
  }).length;
  const isAllComplete = completeCount === currentLeger.length && currentLeger.length > 0;

  const top10Students = [...currentLeger]
    .sort((a, b) => (b.totalNilai || 0) - (a.totalNilai || 0))
    .slice(0, 10);

  const handleSimulateFillRemaining = () => {
    currentLeger.forEach(student => {
      allMapel.forEach(m => {
        if (!student.grades[m.key] || student.grades[m.key] === '') {
          const randomScore = 75 + Math.floor(Math.random() * 16);
          updateStudentGrade(student.nis, m.key, randomScore);
        }
      });
    });
    showToast('Seluruh nilai siswa yang kosong berhasil disinkronkan dari setoran guru mapel!', 'success');
  };

  const handleSaveLeger = () => {
    showToast(`Data Leger Kelas ${effectiveClassId} berhasil disimpan ke sistem!`, 'success');
  };

  const handleExportExcel = () => {
    showToast(`Mengekspor Leger Kelas ${effectiveClassId} ke file Excel (.xlsx)...`, 'info');
    setTimeout(() => {
      const headers = ['No', 'NIS', 'Nama Siswa', 'L/P', 'Kelas', ...allMapel.map(m => m.short), 'Jumlah Nilai', 'Rata-rata', 'Rank', 'Ekskul', 'Kelakuan', 'Kerajinan', 'Kerapian', 'Sakit', 'Izin', 'Alpa', 'Catatan'];
      const rows = currentLeger.map(s => [
        s.no,
        s.nis,
        `"${s.nama}"`,
        s.lp,
        s.kelas || effectiveClassId,
        ...allMapel.map(m => s.grades[m.key] || 0),
        s.totalNilai,
        s.rataRata,
        s.ranking,
        `"${s.pengembanganDiri?.jenis || '-'}"`,
        `"${s.akhlak?.kelakuan?.ket || 'Baik'}"`,
        `"${s.akhlak?.kerajinan?.ket || 'Baik'}"`,
        `"${s.akhlak?.kerapian?.ket || 'Baik'}"`,
        s.absensi?.sakit || 0,
        s.absensi?.izin || 0,
        s.absensi?.alpa || 0,
        `"${s.catatanWali || ''}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `LEGER_NILAI_STS_${effectiveClassId}_2025-2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`File Leger Kelas ${effectiveClassId} berhasil diunduh!`, 'success');
    }, 600);
  };

  return (
    <div className="space-y-4">
      
      {/* Header Info Sheet Leger */}
      <div className="module-panel space-y-3">
        <ModuleHeading
          label={isWaliKelas ? `Kelas Anda: ${effectiveClassId}` : 'Dokumen Resmi'}
          title={`Leger Kumpulan Nilai STS - Kelas ${effectiveClassId}`}
          description={<>Wali Kelas: <strong>{activeClassInfo?.wali}</strong> · {isWaliKelas ? 'Kelas yang Anda ampu' : 'Akses Administrator'}</>}
        />

        {/* Metadata Header Kelas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Kelas & Wali Kelas:</span>
            <span className="font-bold text-slate-800">
              {effectiveClassId} • {activeClassInfo?.wali}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Tahun Pelajaran:</span>
            <span className="font-bold text-slate-800">{schoolSettings.tahunAjaran}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Ujian / Semester:</span>
            <span className="font-bold text-brand-700">{schoolSettings.ujian} {schoolSettings.semester}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Tgl Pembagian Raport:</span>
            <span className="font-bold text-slate-800">{schoolSettings.tglRaport}</span>
          </div>
        </div>
      </div>

      {/* Toolbar Filter & Quick Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {isSuperAdmin && <>
            <select aria-label="Kelas" value={levelFilter} onChange={event => {
              const level = event.target.value;
              setLevelFilter(level);
              setSectionFilter('');
              const firstClass = allClasses.find(item => item.tingkat === level);
              if (firstClass) setSelectedClassId(firstClass.id);
            }} className="module-control">
              <option value="">Kelas</option>
              {['7', '8', '9'].map(level => <option key={level} value={level}>{level}</option>)}
            </select>
            <select aria-label="Bagian" value={sectionFilter} onChange={event => {
              const classId = event.target.value;
              setSectionFilter(classId);
              if (classId) {
                setLevelFilter(classId.slice(0, 1));
                setSelectedClassId(classId);
              }
            }} className="module-control">
              <option value="">Bagian</option>
              {allClasses.filter(item => item.tingkat === (levelFilter || selectedClassId.slice(0, 1))).map(item => (
                <option key={item.id} value={item.id}>{item.id.slice(1)}</option>
              ))}
            </select>
          </>}
          <ModuleSearch className="order-4" aria-label="Cari siswa" placeholder="Cari nama atau NIS siswa"
            value={searchQuery} onChange={event => setSearchQuery(event.target.value)} />

          <select
            aria-label="Filter kelengkapan nilai"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="module-control"
          >
            <option value="all">Status Nilai</option>
            <option value="complete">Nilai Lengkap ({completeCount})</option>
            <option value="incomplete">Belum Lengkap ({currentLeger.length - completeCount})</option>
            <option value="belowKKM">Nilai &lt; 70 (Remidi)</option>
          </select>

        </div>

        <div aria-label="Aksi leger" className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 md:shrink-0 md:border-l md:border-t-0 md:pl-3 md:pt-0">
          {!isWaliKelas && (
            <button type="button" onClick={() => setIsDknModalOpen(true)} title="Impor DKN Excel" aria-label="Impor DKN Excel"
              className={toolbarButton + ' border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}>
              <i aria-hidden="true" className="fa-solid fa-file-import" />
            </button>
          )}
          <button type="button" onClick={() => toggleLockClass(effectiveClassId)}
            title={isLocked ? 'Buka kunci leger' : 'Kunci leger'} aria-label={isLocked ? 'Buka kunci leger' : 'Kunci leger'}
            className={toolbarButton + (isLocked ? ' border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : ' border-slate-200 bg-white text-slate-600 hover:bg-slate-100')}>
            <i aria-hidden="true" className={`fa-solid ${isLocked ? 'fa-lock' : 'fa-lock-open'}`} />
          </button>
          {!isAllComplete && (
            <button type="button" onClick={handleSimulateFillRemaining} title="Simulasi isi nilai kosong" aria-label="Simulasi isi nilai kosong"
              className={toolbarButton + ' border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'}>
              <i aria-hidden="true" className="fa-solid fa-wand-magic-sparkles" />
            </button>
          )}
          <button type="button" onClick={handleExportExcel} title="Ekspor leger Excel" aria-label="Ekspor leger Excel"
            className={toolbarButton + ' border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}>
            <i aria-hidden="true" className="fa-solid fa-file-excel" />
          </button>
          <Link href="/cetak-raport" title={`Cetak raport PDF (${completeCount}/${currentLeger.length} lengkap)`} aria-label="Cetak raport PDF"
            className={toolbarButton + ' border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'}>
            <i aria-hidden="true" className="fa-solid fa-print" />
          </Link>
          <button type="button" onClick={handleSaveLeger} title="Simpan leger" aria-label="Simpan leger"
            className={toolbarButton + ' border-brand-600 bg-brand-600 text-white hover:bg-brand-700'}>
            <i aria-hidden="true" className="fa-solid fa-floppy-disk" />
          </button>
        </div>
      </div>

      {/* Interactive Leger Spreadsheet Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-table text-brand-400"></i>
            <span>Tabel Leger Interaktif ({filteredStudents.length} siswa ditampilkan)</span>
            {isLocked && (
              <span className="bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Terkunci (Hanya Baca)
              </span>
            )}
          </div>
          <span className="text-slate-400 text-[11px] font-mono">
            *Ketuk kolom nilai untuk mengedit. Total & ranking terhitung otomatis.
          </span>
        </div>

        <div className="border-b border-slate-200 bg-white px-3 py-2">
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('nilai')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'nilai' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Nilai Mata Pelajaran"
            aria-label="Nilai Mata Pelajaran"
            >
              <i aria-hidden="true" className="fa-solid fa-graduation-cap mr-1"></i> Nilai 17 Mapel
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pendukung')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'pendukung' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Ekskul, Akhlak & Absensi"
            aria-label="Ekskul, Akhlak & Absensi"
            >
              <i aria-hidden="true" className="fa-solid fa-heart mr-1"></i> Ekskul, Akhlak & Absensi
            </button>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar max-h-[620px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold sticky top-0 z-20 shadow-xs">
              <tr className="border-b border-slate-300">
                <th className="py-2 px-2 text-center border-r border-slate-200 w-10 sticky left-0 bg-slate-100 z-30">No</th>
                <th className="py-2 px-2 border-r border-slate-200 w-20 sticky left-10 bg-slate-100 z-30">NIS</th>
                <th className="py-2 px-3 border-r border-slate-200 min-w-[200px] sticky left-30 bg-slate-100 z-30">Nama Siswa</th>
                <th className="py-2 px-1 text-center border-r border-slate-200 w-8">L/P</th>
                <th className="py-2 px-2 text-center border-r border-slate-200 w-16 bg-brand-50/60 text-brand-900">Kelas</th>

                {activeTab === 'nilai' ? (
                  <>
                    <th colSpan="17" className="py-1 px-2 text-center border-r border-slate-200 bg-brand-50 text-brand-900">
                      Nilai Setiap Mata Pelajaran (Skala 0 - 100)
                    </th>
                    <th className="py-2 px-2 text-center border-r border-slate-200 bg-indigo-50 text-indigo-900 w-16">Jumlah</th>
                    <th className="py-2 px-2 text-center border-r border-slate-200 bg-indigo-50 text-indigo-900 w-16">Rerata</th>
                    <th className="py-2 px-2 text-center border-r border-slate-200 bg-amber-50 text-amber-900 w-14">Rank</th>
                  </>
                ) : (
                  <>
                    <th colSpan="2" className="py-1 px-2 text-center border-r border-slate-200 bg-purple-50 text-purple-900">Kegiatan Peng. Diri</th>
                    <th colSpan="3" className="py-1 px-2 text-center border-r border-slate-200 bg-sky-50 text-sky-900">Akhlak & Kepribadian</th>
                    <th colSpan="3" className="py-1 px-2 text-center border-r border-slate-200 bg-rose-50 text-rose-900">Absensi (Hari)</th>
                    <th className="py-1 px-2 text-center border-r border-slate-200 bg-slate-200 min-w-[180px]">Catatan Wali Kelas</th>
                  </>
                )}

                <th className="py-2 px-2 text-center w-24 sticky right-0 bg-slate-100 z-30">Aksi</th>
              </tr>

              <tr className="border-b border-slate-300 text-[10px] bg-slate-200/80">
                <th className="border-r border-slate-300 sticky left-0 bg-slate-200/80 z-30"></th>
                <th className="border-r border-slate-300 sticky left-10 bg-slate-200/80 z-30"></th>
                <th className="border-r border-slate-300 sticky left-30 bg-slate-200/80 z-30"></th>
                <th className="border-r border-slate-300"></th>
                <th className="border-r border-slate-300"></th>

                {activeTab === 'nilai' ? (
                  <>
                    {allMapel.map(m => (
                      <th key={m.key} className="py-1 px-1 text-center border-r border-slate-300 min-w-[48px] max-w-[60px]" title={m.name}>
                        <div className="font-extrabold truncate">{m.short}</div>
                      </th>
                    ))}
                    <th className="py-1 px-1 text-center border-r border-slate-300 text-slate-500 font-mono">Total</th>
                    <th className="py-1 px-1 text-center border-r border-slate-300 text-slate-500 font-mono">Avg</th>
                    <th className="py-1 px-1 text-center border-r border-slate-300 text-slate-500 font-mono">1..N</th>
                  </>
                ) : (
                  <>
                    <th className="py-1 px-2 text-center border-r border-slate-300">Jenis</th>
                    <th className="py-1 px-2 text-center border-r border-slate-300">Nilai</th>
                    <th className="py-1 px-2 text-center border-r border-slate-300">Kelakuan</th>
                    <th className="py-1 px-2 text-center border-r border-slate-300">Kerajinan</th>
                    <th className="py-1 px-2 text-center border-r border-slate-300">Kerapian</th>
                    <th className="py-1 px-1 text-center border-r border-slate-300 w-10">Sakit</th>
                    <th className="py-1 px-1 text-center border-r border-slate-300 w-10">Izin</th>
                    <th className="py-1 px-1 text-center border-r border-slate-300 w-10">Alpa</th>
                    <th className="py-1 px-2 border-r border-slate-300">Memo untuk Orang Tua</th>
                  </>
                )}

                <th className="sticky right-0 bg-slate-200/80 z-30 text-center">Cetak</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="26" className="py-8 text-center text-slate-400">
                    <i className="fa-solid fa-inbox text-2xl mb-1 block"></i>
                    Tidak ada siswa yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const grades = student.grades || {};
                  const isTop3 = student.ranking <= 3;

                  return (
                    <tr
                      key={student.nis}
                      className="hover:bg-brand-50/40 transition group text-slate-700"
                    >
                      <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono font-semibold sticky left-0 bg-white group-hover:bg-brand-50/70 z-10">
                        {student.no}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-200 font-mono text-slate-500 sticky left-10 bg-white group-hover:bg-brand-50/70 z-10 text-[11px]">
                        {student.nis}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-slate-800 sticky left-30 bg-white group-hover:bg-brand-50/70 z-10 truncate max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          {isTop3 && (
                            <i className={`fa-solid fa-trophy text-xs ${
                              student.ranking === 1 ? 'text-amber-500' : student.ranking === 2 ? 'text-slate-400' : 'text-amber-700'
                            }`}></i>
                          )}
                          <span>{student.nama}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-1 text-center border-r border-slate-200 text-slate-500 font-mono text-[11px]">
                        {student.lp}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200 font-bold text-brand-700 bg-brand-50/40 text-[11px]">
                        {student.kelas || effectiveClassId}
                      </td>

                      {activeTab === 'nilai' ? (
                        <>
                          {allMapel.map((m) => {
                            const val = grades[m.key];
                            const isBelowKKM = val !== '' && val !== null && val !== undefined && Number(val) < m.kkm;
                            const isEmpty = val === '' || val === null || val === undefined;

                            return (
                              <td
                                key={m.key}
                                className={`p-0 border-r border-slate-200 text-center ${
                                  isBelowKKM ? 'bg-rose-50' : isEmpty ? 'bg-amber-50/30' : ''
                                }`}
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  disabled={isLocked}
                                  value={val !== undefined ? val : ''}
                                  onChange={(e) => updateStudentGrade(student.nis, m.key, e.target.value)}
                                  placeholder="-"
                                  className={`w-full py-1.5 text-center font-mono text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition ${
                                    isBelowKKM 
                                      ? 'text-rose-700 font-extrabold' 
                                      : isEmpty 
                                      ? 'text-slate-300 font-medium' 
                                      : 'text-slate-800 font-semibold'
                                  } ${isLocked ? 'cursor-not-allowed bg-transparent' : 'cursor-text'}`}
                                />
                              </td>
                            );
                          })}

                          <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-900 bg-indigo-50/30">
                            {student.totalNilai}
                          </td>
                          <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono font-bold text-brand-700 bg-indigo-50/30">
                            {student.rataRata}
                          </td>
                          <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono font-black text-amber-900 bg-amber-50/40">
                            <span className={`inline-block px-1.5 py-0.5 rounded-md text-xs ${
                              student.ranking === 1 ? 'bg-amber-500 text-white shadow-2xs' :
                              student.ranking === 2 ? 'bg-slate-400 text-white' :
                              student.ranking === 3 ? 'bg-amber-700 text-white' : ''
                            }`}>
                              {student.ranking}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-1.5 px-2 border-r border-slate-200">
                            <input
                              type="text"
                              disabled={isLocked}
                              value={student.pengembanganDiri?.jenis || ''}
                              onChange={(e) => updateStudentMeta(student.nis, 'pengembanganDiri', 'jenis', e.target.value)}
                              className="w-full text-xs outline-none bg-transparent"
                              placeholder="Pramuka/Banjari..."
                            />
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-200">
                            <input
                              type="text"
                              disabled={isLocked}
                              value={student.pengembanganDiri?.nilai || ''}
                              onChange={(e) => updateStudentMeta(student.nis, 'pengembanganDiri', 'nilai', e.target.value)}
                              className="w-full text-xs outline-none bg-transparent text-center font-bold"
                              placeholder="A/B..."
                            />
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-200 text-center">
                            <select
                              disabled={isLocked}
                              value={student.akhlak?.kelakuan?.ket || 'Baik'}
                              onChange={(e) => updateStudentMeta(student.nis, 'akhlak', 'kelakuan', { nilai: 85, ket: e.target.value })}
                              className="text-xs bg-transparent outline-none cursor-pointer"
                            >
                              <option>Sangat Baik</option>
                              <option>Baik</option>
                              <option>Cukup</option>
                              <option>Kurang</option>
                            </select>
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-200 text-center">
                            <select
                              disabled={isLocked}
                              value={student.akhlak?.kerajinan?.ket || 'Baik'}
                              onChange={(e) => updateStudentMeta(student.nis, 'akhlak', 'kerajinan', { nilai: 85, ket: e.target.value })}
                              className="text-xs bg-transparent outline-none cursor-pointer"
                            >
                              <option>Sangat Baik</option>
                              <option>Baik</option>
                              <option>Cukup</option>
                              <option>Kurang</option>
                            </select>
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-200 text-center">
                            <select
                              disabled={isLocked}
                              value={student.akhlak?.kerapian?.ket || 'Baik'}
                              onChange={(e) => updateStudentMeta(student.nis, 'akhlak', 'kerapian', { nilai: 85, ket: e.target.value })}
                              className="text-xs bg-transparent outline-none cursor-pointer"
                            >
                              <option>Sangat Baik</option>
                              <option>Baik</option>
                              <option>Cukup</option>
                              <option>Kurang</option>
                            </select>
                          </td>
                          <td className="py-1.5 px-1 border-r border-slate-200 text-center">
                            <input
                              type="number"
                              min="0"
                              disabled={isLocked}
                              value={student.absensi?.sakit ?? 0}
                              onChange={(e) => updateStudentMeta(student.nis, 'absensi', 'sakit', Number(e.target.value))}
                              className="w-10 text-center font-mono text-xs outline-none bg-transparent"
                            />
                          </td>
                          <td className="py-1.5 px-1 border-r border-slate-200 text-center">
                            <input
                              type="number"
                              min="0"
                              disabled={isLocked}
                              value={student.absensi?.izin ?? 0}
                              onChange={(e) => updateStudentMeta(student.nis, 'absensi', 'izin', Number(e.target.value))}
                              className="w-10 text-center font-mono text-xs outline-none bg-transparent"
                            />
                          </td>
                          <td className="py-1.5 px-1 border-r border-slate-200 text-center">
                            <input
                              type="number"
                              min="0"
                              disabled={isLocked}
                              value={student.absensi?.alpa ?? 0}
                              onChange={(e) => updateStudentMeta(student.nis, 'absensi', 'alpa', Number(e.target.value))}
                              className="w-10 text-center font-mono text-xs outline-none bg-transparent"
                            />
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-200">
                            <input
                              type="text"
                              disabled={isLocked}
                              value={student.catatanWali || ''}
                              onChange={(e) => updateStudentMeta(student.nis, 'catatanWali', null, e.target.value)}
                              className="w-full text-xs outline-none bg-transparent"
                              placeholder="Tulis catatan wali kelas..."
                            />
                          </td>
                        </>
                      )}

                      <td className="py-1.5 px-2 text-center sticky right-0 bg-white group-hover:bg-brand-50/70 z-10">
                        <button
                          type="button"
                          onClick={() => openRaportModal(student)}
                          className="p-1.5 px-2.5 rounded-lg bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center justify-center gap-1 mx-auto"
                          title="Lihat Template Raport Siap Print Siswa Ini"
                        aria-label="Lihat Template Raport Siap Print Siswa Ini"
                        >
                          <i aria-hidden="true" className="fa-solid fa-file-pdf"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Bawah: Peringkat 10 Besar & Petunjuk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-ranking-star text-amber-500 text-sm"></i>
              PERINGKAT 10 BESAR KELAS {effectiveClassId}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Berdasarkan Total Nilai STS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold text-slate-600">
                  <th className="py-1.5 px-2 text-center w-8">NO</th>
                  <th className="py-1.5 px-3">NAMA SISWA</th>
                  <th className="py-1.5 px-2 text-center w-14">KELAS</th>
                  <th className="py-1.5 px-2 text-center w-16">TOTAL</th>
                  <th className="py-1.5 px-2 text-center w-16">RERATA</th>
                  <th className="py-1.5 px-2 text-center w-16">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10Students.map((s, idx) => (
                  <tr key={s.nis} className="hover:bg-slate-50 transition">
                    <td className="py-1.5 px-2 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] ${
                        idx === 0 ? 'bg-amber-500 text-white' :
                        idx === 1 ? 'bg-slate-400 text-white' :
                        idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-slate-800 truncate max-w-[200px]">
                      {s.nama}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-brand-700 text-[11px]">
                      {s.kelas || effectiveClassId}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-900">
                      {s.totalNilai}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold text-brand-600">
                      {s.rataRata}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => openRaportModal(s)}
                        className="text-brand-600 hover:text-brand-800 text-[11px] font-bold cursor-pointer"
                        title="Cetak Raport"
                      aria-label="Cetak Raport"
                      >
                        <i aria-hidden="true" className="fa-solid fa-print"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-circle-question text-brand-600"></i>
              Petunjuk Wali Kelas ({effectiveClassId})
            </h3>
            <span className="text-[10px] bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded-full">
              Wali: {activeClassInfo?.wali}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
              <p className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                <i className="fa-solid fa-check-double text-indigo-600"></i>
                Status Pengisian Nilai Kelas {effectiveClassId}:
              </p>
              <p className="text-[11px] text-indigo-800">
                Saat ini terdapat <strong>{completeCount}</strong> dari <strong>{currentLeger.length}</strong> siswa yang nilainya sudah terisi penuh 17 mapel.
              </p>
            </div>

            <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-600">
              <li>Nilai yang disetorkan guru mapel via form atau file DKN otomatis masuk ke Leger kelas Anda.</li>
              <li>Wali kelas dapat memperbaiki nilai langsung pada cell tabel di atas.</li>
              <li>Jika semua nilai sudah terverifikasi dan lengkap, klik tombol <strong>"Kunci Nilai Fix"</strong>.</li>
              <li>Klik <strong>"Cetak Raport PDF"</strong> untuk mengunduh raport kelas Anda.</li>
            </ul>

            <div className="pt-2">
              <Link
                href="/cetak-raport"
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <i className="fa-solid fa-file-pdf"></i>
                <span>Cetak Raport Kelas {effectiveClassId} →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Import DKN Excel */}
      <ImportDknModal
        isOpen={isDknModalOpen}
        onClose={() => setIsDknModalOpen(false)}
        targetClass={effectiveClassId}
        targetMapel="tik"
      />

    </div>
  );
}
